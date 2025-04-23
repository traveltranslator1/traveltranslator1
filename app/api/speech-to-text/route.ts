import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient, protos } from '@google-cloud/speech';

// 明确告诉Next.js这是一个动态路由
export const dynamic = 'force-dynamic';

function validateAndFixGoogleCredentials() {
  try {
    process.env.GRPC_VERBOSITY= 'DEBUG';
    process.env.GRPC_TRACE = 'all';
    // 直接使用环境变量中的凭据字符串
    const credentials = process.env.GOOGLE_CREDENTIALS;
      if (!credentials) {
        throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
      }
  
      console.log('Parsed credentials:', credentials);
  
      // 尝试解析凭证
      let parsedCredentials;
      try {
        parsedCredentials = JSON.parse(credentials);
      } catch (error) {
        console.error('Failed to parse GOOGLE_CREDENTIALS as JSON:', error);
        throw new Error('Failed to parse GOOGLE_CREDENTIALS as JSON');
      }
      
      // 验证必要的字段
      const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
      for (const field of requiredFields) {
        if (!parsedCredentials[field]) {
          throw new Error(`Missing required field in credentials: ${field}`);
        }
      }
  
      // 确保 private_key 格式正确
      if (!parsedCredentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private_key format in credentials');
      }
  
      console.log('Parsed credentials:', parsedCredentials);
      return parsedCredentials;
    } catch (error) {
      console.error('Error validating Google credentials:', error);
      throw error;
    }

}

// 创建 Google Cloud Speech-to-Text 客户端
let speechClient: SpeechClient | null = null;
try {
  const credentials = validateAndFixGoogleCredentials();
  console.log('credentials', credentials);
  // 创建 SpeechClient 实例
  speechClient = new SpeechClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id
  });

  console.log('Successfully initialized Google Speech-to-Text client');
} catch (error) {
  console.error('Failed to initialize Google Speech-to-Text client:', error);
  // 不要在这里抛出错误，让请求处理函数处理它
}

export async function POST(request: NextRequest) {
  try {
    // 检查客户端是否正确初始化
    if (!speechClient) {
      throw new Error('Google Speech-to-Text client is not initialized. Please check your credentials.');
    }

    console.log('Received speech-to-text request');
    
    // 处理FormData请求
    let audioBuffer: Buffer;
    let language: string = 'en-US';
    let contentType: string = 'audio/webm;codecs=opus';
    
    try {
      // 尝试解析FormData
      const formData = await request.formData();
      console.log('FormData fields:', Array.from(formData.keys()));
      
      const audioFile = formData.get('audio');
      if (!audioFile) {
        throw new Error('No audio file provided');
      }
      
      // 获取语言参数
      language = (formData.get('language') as string) || 'en-US';
      console.log('Language from FormData:', language);
      
      // 获取音频内容
      if (audioFile instanceof Blob) {
        const arrayBuffer = await audioFile.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        contentType = audioFile.type || contentType;
        console.log('Audio file type:', contentType);
        console.log('Audio buffer size:', audioBuffer.length, 'bytes');
      } else {
        throw new Error('Invalid audio file');
      }
    } catch (formError) {
      console.error('Error parsing FormData:', formError);
      
      // 回退到直接读取请求体
      console.log('Falling back to reading request body directly');
      const arrayBuffer = await request.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      
      // 尝试从URL参数获取语言
      const url = new URL(request.url);
      language = url.searchParams.get('language') || 'en-US';
      console.log('Language from URL params:', language);
      
      // 从请求头获取内容类型
      const contentTypeHeader = request.headers.get('content-type');
      if (contentTypeHeader && contentTypeHeader.includes('audio/')) {
        contentType = contentTypeHeader;
      }
      console.log('Content type from header:', contentType);
    }
    
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Empty audio buffer');
    }
    
    console.log(`Processing speech recognition for language: ${language}`);

    // 确定音频编码类型
    let encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS;
    let sampleRateHertz = 48000;
    
    if (contentType.includes('mp4') || contentType.includes('aac')) {
      encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.AMR;
      sampleRateHertz = 16000;
    } else if (contentType.includes('ogg')) {
      encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS;
      sampleRateHertz = 48000;
    } else if (contentType.includes('mp3')) {
      encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3;
      sampleRateHertz = 44100;
    } else if (contentType.includes('wav') || contentType.includes('wave')) {
      encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16;
      sampleRateHertz = 16000;
    }
    
    // 配置 Google Speech-to-Text 请求
    const recognizeRequest: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: language,
        model: 'default',
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
      },
    };
    
    console.log('Sending request to Google Speech-to-Text API with config:', {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding[encoding],
      sampleRateHertz: sampleRateHertz,
      languageCode: language
    });
    
    // 调用 Google Speech-to-Text API
    const [response] = await speechClient.recognize(recognizeRequest);
    
    // 处理响应
    if (!response.results || response.results.length === 0) {
      console.log('No transcription results returned');
      return NextResponse.json({
        text: "",
        confidence: 0,
      });
    }
    
    type SpeechResult = protos.google.cloud.speech.v1.ISpeechRecognitionResult;
    
    // 拼接所有识别到的文本
    const transcription = response.results
      .map((result: SpeechResult) => 
        result.alternatives && result.alternatives[0] ? result.alternatives[0].transcript : '')
      .join('\n');
    
    // 获取置信度（使用第一个结果的置信度）
    const confidence = response.results[0].alternatives && response.results[0].alternatives[0] ? 
      response.results[0].alternatives[0].confidence || 0 : 0;
    
    console.log(`Transcription completed: "${transcription.substring(0, 50)}${transcription.length > 50 ? '...' : ''}"`);
    
    return NextResponse.json({
      text: transcription,
      confidence: confidence,
    });
  } catch (error) {
    console.error('Speech to text API error:', error);
    return NextResponse.json(
      { error: 'Failed to process speech to text', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 