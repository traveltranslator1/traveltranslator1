import { NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// 可用的声音列表
const VOICES = {
  'ja-JP': [
    'ja-JP-Standard-A',  // 女声
    'ja-JP-Standard-B',  // 男声
    'ja-JP-Standard-C',  // 女声
    'ja-JP-Standard-D'   // 男声
  ],
  'en-US': [
    'en-US-Standard-A',  // 女声
    'en-US-Standard-B',  // 男声
    'en-US-Standard-C',  // 女声
    'en-US-Standard-D'   // 男声
  ],
  'zh-CN': [
    'cmn-CN-Standard-A',  // 女声
    'cmn-CN-Standard-B',  // 男声
    'cmn-CN-Standard-C',  // 男声
    'cmn-CN-Standard-D'   // 女声
  ],
  'fr-FR': [
    'fr-FR-Standard-A',  // 女声
    'fr-FR-Standard-B',  // 男声
    'fr-FR-Standard-C',  // 女声
    'fr-FR-Standard-D'   // 男声
  ],
  'de-DE': [
    'de-DE-Standard-A',  // 女声
    'de-DE-Standard-B',  // 男声
    'de-DE-Standard-C',  // 女声
    'de-DE-Standard-D'   // 男声
  ],
  'es-ES': [
    'es-ES-Standard-A',  // 女声
    'es-ES-Standard-B',  // 男声
    'es-ES-Standard-C',  // 女声
    'es-ES-Standard-D'   // 男声
  ]
};

// 语言代码映射表
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'en': 'en-US',
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-CN', // 使用中文声音
  'ja': 'ja-JP',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES'
};

// 随机选择一个声音
function getRandomVoice(languageCode: string): string {
  const voices = VOICES[languageCode as keyof typeof VOICES] || VOICES['en-US'];
  const randomIndex = Math.floor(Math.random() * voices.length);
  return voices[randomIndex];
}

// 验证并修复 Google Cloud 凭证
function validateAndFixGoogleCredentials() {
  try {
    const credentials = process.env.GOOGLE_CREDENTIALS;
    if (!credentials) {
      throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
    }

    // 尝试解析凭证
    let parsedCredentials;
    try {
      parsedCredentials = JSON.parse(credentials);
    } catch {
      throw new Error('Failed to parse GOOGLE_CREDENTIALS as JSON');
    }
    
    // 验证必要的字段
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!parsedCredentials[field]) {
        throw new Error(`Missing required field in credentials: ${field}`);
      }
    }

    // 修复 private_key 格式
    let privateKey = parsedCredentials.private_key;
    privateKey = privateKey.replace('-----BEGINPRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----');
    privateKey = privateKey.replace('-----ENDPRIVATEKEY-----', '-----END PRIVATE KEY-----');
    parsedCredentials.private_key = privateKey;

    // 确保 private_key 格式正确
    if (!parsedCredentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private_key format in credentials');
    }

    return parsedCredentials;
  } catch (error) {
    console.error('Error validating Google credentials:', error);
    throw error;
  }
}

// 创建 Google Cloud Text-to-Speech 客户端
let client: TextToSpeechClient | null = null;
try {
  const credentials = validateAndFixGoogleCredentials();
  client = new TextToSpeechClient({
    credentials,
    projectId: credentials.project_id
  });
} catch (error) {
  console.error('Failed to initialize Google TTS client:', error);
  // 不要在这里抛出错误，让请求处理函数处理它
}

export async function POST(request: Request) {
  try {
    // 检查客户端是否正确初始化
    if (!client) {
      throw new Error('Google TTS client is not initialized. Please check your credentials.');
    }

    const { text, language } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // 根据语言选择语言代码
    let languageCode: string;
    
    // 检查是否提供了language参数
    if (language && LANGUAGE_CODE_MAP[language]) {
      languageCode = LANGUAGE_CODE_MAP[language];
    } 
    // 默认使用英语
    else {
      languageCode = 'en-US';
    }

    // 如果没有该语言的声音配置，使用英语
    if (!VOICES[languageCode as keyof typeof VOICES]) {
      console.warn(`No voice configuration for language code: ${languageCode}, falling back to en-US`);
      languageCode = 'en-US';
    }

    // 随机选择一个声音
    const voiceName = getRandomVoice(languageCode);

    // 构建请求
    const req = {
      input: { text },
      voice: { 
        languageCode,
        name: voiceName
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0
      },
    };

    console.log('Sending request to Google TTS:', {
      text,
      languageCode,
      voiceName,
      originalLanguage: language
    });

    // 调用 Google TTS API
    const [response] = await client.synthesizeSpeech(req);
    const audioContent = response.audioContent;

    if (!audioContent) {
      throw new Error('No audio content received from Google TTS API');
    }

    // 返回音频数据
    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000', // 缓存一年
      },
    });
  } catch (error) {
    console.error('Error generating pronunciation:', error);
    
    // 返回更详细的错误信息
    let errorMessage = 'Failed to generate pronunciation';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('GOOGLE_CREDENTIALS')) {
        errorMessage = 'Invalid or missing Google Cloud credentials';
        statusCode = 503;
      } else if (error.message.includes('private_key')) {
        errorMessage = 'Invalid Google Cloud credentials format';
        statusCode = 503;
      } else if (error.message.includes('quota')) {
        errorMessage = 'Google Cloud API quota exceeded';
        statusCode = 429;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
} 