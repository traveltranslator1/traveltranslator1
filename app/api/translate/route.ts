import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

/**
 * 翻译 API 配置
 * 
 * 该 API 使用 Google Gemini 模型进行文本翻译，支持多种语言和内容类型。
 * 
 * 请求参数:
 * - text: 要翻译的文本 (必填)
 * - targetLanguage: 目标语言代码 (必填)
 * - sourceLanguage: 源语言代码 (可选，默认为自动检测)
 * - modelType: 使用的模型类型 (可选，默认为 'default')
 *   - 'default': 默认模型，平衡速度和准确性 (gemini-1.5-flash)
 *   - 'fast': 快速模型，优先考虑速度 (gemini-1.5-flash)
 *   - 'accurate': 准确模型，优先考虑准确性 (gemini-1.5-pro)
 *   - 'legacy': 旧版模型 (gemini-pro)
 * - timeout: 请求超时时间，单位毫秒 (可选，默认为 30000)
 * 
 * 响应格式:
 * - translatedText: 翻译后的文本
 * - sourceLanguage: 源语言代码
 * - targetLanguage: 目标语言代码
 * - contentType: 检测到的内容类型
 * - model: 使用的模型名称
 * 
 * 错误响应:
 * - error: 错误消息
 * - details: 详细错误信息
 * - sourceLanguage: 源语言代码
 * - targetLanguage: 目标语言代码
 */

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// 支持的模型配置
const MODELS = {
  default: 'gemini-1.5-flash',
  fast: 'gemini-1.5-flash',
  accurate: 'gemini-1.5-pro',
  legacy: 'gemini-pro'
};

// 简单的请求计数器，用于基本的速率限制
const requestCounter = {
  count: 0,
  lastReset: Date.now(),
  maxRequestsPerMinute: 60, // 每分钟最大请求数
  
  increment() {
    // 如果距离上次重置已经过去了一分钟，重置计数器
    if (Date.now() - this.lastReset > 60000) {
      this.count = 0;
      this.lastReset = Date.now();
    }
    
    this.count++;
    return this.count <= this.maxRequestsPerMinute;
  }
};

export async function POST(request: Request) {
  try {
    // 基本的速率限制
    if (!requestCounter.increment()) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { text, sourceLanguage, targetLanguage, modelType = 'default', timeout = 30000 } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'No target language provided' },
        { status: 400 }
      );
    }

    // 选择模型
    const modelName = MODELS[modelType as keyof typeof MODELS] || MODELS.default;
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`Translating text from ${sourceLanguage || 'auto'} to ${targetLanguage} using model ${modelName}`);
    console.log(`Text to translate (first 50 chars): ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    
    // 构建翻译提示词
    const contentType = determineContentType(text);
    const targetLanguageName = getLanguageName(targetLanguage);
    const sourceLanguageName = sourceLanguage ? getLanguageName(sourceLanguage) : "自动检测";
    
    const prompt = `你是一位专业翻译，精通多种语言的互译。
翻译以下${contentType}，要求译文准确、流畅，符合${targetLanguageName}的表达习惯。
源语言：${sourceLanguageName}
目标语言：${targetLanguageName}

请直接返回翻译结果，不要添加任何解释、注释或额外的文本。保持原文的格式、段落和标点符号。

原文：
${text}`;
    
    // 调用 Gemini API 进行翻译，添加超时处理
    let translatedText = '';
    try {
      // 创建一个带超时的 Promise
      const translationPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Translation request timed out')), timeout);
      });
      
      // 使用 Promise.race 实现超时处理
      const result = await Promise.race([
        translationPromise,
        timeoutPromise
      ]) as Awaited<ReturnType<typeof model.generateContent>>;
      
      translatedText = result.response.text();
      
      if (!translatedText) {
        throw new Error('Empty response from Gemini');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log(`Translation completed (first 50 chars): ${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}`);
    
    return NextResponse.json({
      translatedText,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      contentType,
      model: modelName
    });
  } catch (error) {
    console.error('Translation API error:', error);
    
    // 获取请求体中的语言信息，如果无法解析则使用默认值
    let sourceLanguage = 'auto';
    let targetLanguage = 'en';
    try {
      const body = await request.clone().json();
      sourceLanguage = body.sourceLanguage || 'auto';
      targetLanguage = body.targetLanguage || 'en';
    } catch (e) {
      console.error('Failed to parse request body in error handler:', e);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to translate text', 
        details: error instanceof Error ? error.message : String(error),
        sourceLanguage,
        targetLanguage
      },
      { status: 500 }
    );
  }
}

/**
 * 根据文本内容确定内容类型
 */
function determineContentType(text: string): string {
  // 检查是否包含代码特征
  if (text.includes('{') && text.includes('}') && 
      (text.includes('function') || text.includes('class') || 
       text.includes('const') || text.includes('var') || 
       text.includes('let') || text.includes('import') || 
       text.includes('export') || text.includes('def ') || 
       text.includes('public ') || text.includes('private ') || 
       text.includes('package ') || text.includes('using ') || 
       text.includes('#include'))) {
    return "代码";
  }
  
  // 检查是否是技术文档
  if (text.includes('API') || text.includes('HTTP') || 
      text.includes('SDK') || text.includes('URL') || 
      text.includes('JSON') || text.includes('XML') || 
      text.includes('REST') || text.includes('SOAP') || 
      text.includes('GET ') || text.includes('POST ') || 
      text.includes('PUT ') || text.includes('DELETE ') || 
      text.includes('npm ') || text.includes('yarn ') || 
      text.includes('docker ') || text.includes('kubernetes') || 
      text.includes('kubectl') || text.includes('terraform')) {
    return "技术文档";
  }
  
  // 检查是否是对话或聊天
  if ((text.includes(':') && (text.split('\n').filter(line => line.includes(':')).length > 2)) || 
      text.includes('Q:') && text.includes('A:') || 
      text.includes('问:') && text.includes('答:') || 
      text.includes('问：') && text.includes('答：')) {
    return "对话";
  }
  
  // 检查是否是法律文本
  if (text.includes('条款') || text.includes('合同') || 
      text.includes('协议') || text.includes('法律') || 
      text.includes('规定') || text.includes('条例') || 
      text.includes('第') && text.includes('条') || 
      text.includes('hereby') || text.includes('pursuant') || 
      text.includes('shall') || text.includes('terms and conditions')) {
    return "法律文本";
  }
  
  // 检查是否是学术文本
  if (text.includes('Abstract') || text.includes('Introduction') || 
      text.includes('Methodology') || text.includes('Conclusion') || 
      text.includes('References') || text.includes('et al.') || 
      text.includes('摘要') || text.includes('引言') || 
      text.includes('方法') || text.includes('结论') || 
      text.includes('参考文献')) {
    return "学术文本";
  }
  
  // 默认为普通文本
  return "文本";
}

/**
 * 获取语言代码对应的语言名称
 */
function getLanguageName(languageCode: string): string {
  const languageMap: Record<string, string> = {
    'en': '英语',
    'zh': '中文',
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    'ja': '日语',
    'ko': '韩语',
    'fr': '法语',
    'de': '德语',
    'es': '西班牙语',
    'it': '意大利语',
    'ru': '俄语',
    'pt': '葡萄牙语',
    'ar': '阿拉伯语',
    'hi': '印地语',
    'th': '泰语',
    'vi': '越南语',
    'id': '印尼语',
    'ms': '马来语',
    'tr': '土耳其语',
    'nl': '荷兰语',
    'pl': '波兰语',
    'sv': '瑞典语',
    'da': '丹麦语',
    'fi': '芬兰语',
    'no': '挪威语',
    'cs': '捷克语',
    'hu': '匈牙利语',
    'el': '希腊语',
    'he': '希伯来语',
    'uk': '乌克兰语',
    'ro': '罗马尼亚语',
    'bg': '保加利亚语',
    'hr': '克罗地亚语',
    'sr': '塞尔维亚语',
    'sk': '斯洛伐克语',
    'sl': '斯洛文尼亚语',
    'et': '爱沙尼亚语',
    'lv': '拉脱维亚语',
    'lt': '立陶宛语',
    'fa': '波斯语',
    'ur': '乌尔都语',
    'bn': '孟加拉语',
    'ta': '泰米尔语',
    'te': '泰卢固语',
    'ml': '马拉雅拉姆语',
    'kn': '卡纳达语',
    'mr': '马拉地语',
    'gu': '古吉拉特语',
    'pa': '旁遮普语',
    'or': '奥里亚语',
    'my': '缅甸语',
    'ne': '尼泊尔语',
    'si': '僧伽罗语',
    'km': '高棉语',
    'lo': '老挝语',
    'mn': '蒙古语',
    'jv': '爪哇语',
    'sw': '斯瓦希里语',
    'zu': '祖鲁语',
    'xh': '科萨语',
    'yo': '约鲁巴语',
    'ig': '伊博语',
    'ha': '豪萨语',
    'auto': '自动检测'
  };
  
  return languageMap[languageCode] || languageCode;
} 