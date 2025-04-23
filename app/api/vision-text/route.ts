import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Set to dynamic to prevent caching
export const dynamic = 'force-dynamic';

/**
 * Google Cloud Vision API 文本检测
 * 
 * 此API用于从图像中提取文本，支持多种语言的文字识别。
 * 
 * 请求参数:
 * - 图像数据: 通过FormData以文件形式发送
 * 
 * 响应格式:
 * - text: 从图像中检测到的文本
 * - language: 检测到的语言代码（如果可用）
 * 
 * 错误响应:
 * - error: 错误消息
 * - status: HTTP状态码
 */

// 创建Vision客户端
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient() {
  if (!visionClient) {
    try {
      // 直接使用环境变量中的凭据字符串
      const credentials = process.env.GOOGLE_CREDENTIALS;
      if (!credentials) {
        throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
      }

      // 尝试解析凭证
      let parsedCredentials;
      try {
        parsedCredentials = JSON.parse(credentials);
      } catch (error) {
        console.error('Failed to parse GOOGLE_CREDENTIALS as JSON:', error);
        throw new Error('Failed to parse GOOGLE_CREDENTIALS as JSON');
      }

      // 创建Vision客户端
      visionClient = new ImageAnnotatorClient({
        credentials: parsedCredentials
      });
      
      console.log('Created Vision API client');
    } catch (error) {
      console.error('Error creating Vision client:', error);
      throw error;
    }
  }
  return visionClient;
}

export async function POST(request: NextRequest) {
  console.log('Vision API request received');
  
  try {
    // 获取Vision客户端
    const client = getVisionClient();
    
    // 处理请求
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log('Processing image:', imageFile.name, 'Size:', imageFile.size);
    
    // 将文件转换为Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    
    // 调用Vision API进行文本检测
    const [result] = await client.textDetection({
      image: { content: buffer }
    });
    
    const textAnnotations = result.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json(
        { text: '', message: 'No text detected in the image' },
        { status: 200 }
      );
    }
    
    // 第一个注释通常包含整个检测到的文本
    const detectedText = textAnnotations[0].description || '';
    // 尝试获取语言代码
    const detectedLanguage = textAnnotations[0].locale || '';
    
    console.log('Text detected:', detectedText.substring(0, 100) + (detectedText.length > 100 ? '...' : ''));
    console.log('Detected language:', detectedLanguage);
    
    return NextResponse.json({
      text: detectedText,
      language: detectedLanguage
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 