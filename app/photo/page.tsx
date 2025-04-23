'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Copy, Check, Loader2, RefreshCw, Volume2, ArrowRight, Upload, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

// 重用主页面的语言映射
const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'ja-JP', label: 'Japanese' },
];

// 翻译语言代码映射
const translationLanguageCodes: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'ja-JP': 'ja',
};

export default function PhotoTranslation() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto'); // 自动检测
  const [targetLanguage, setTargetLanguage] = useState('zh-CN');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [translationAudioUrl, setTranslationAudioUrl] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isCopyingRecognized, setIsCopyingRecognized] = useState(false);
  const [isCopyingTranslated, setIsCopyingTranslated] = useState(false);
  const [copySuccessRecognized, setCopySuccessRecognized] = useState(false);
  const [copySuccessTranslated, setCopySuccessTranslated] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 清除预览和结果的函数
  const clearResults = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRecognizedText('');
    setTranslatedText('');
    setDetectedLanguage('');
    setTranslationAudioUrl(null);
  };

  // 当检测到文本时自动翻译
  useEffect(() => {
    if (recognizedText) {
      translateText();
    }
  }, [recognizedText]);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 验证文件是否为图片
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // 自动开始处理图片
      processImage(file);
    }
  };

  // 处理拖放文件
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 验证文件是否为图片
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // 自动开始处理图片
      processImage(file);
    }
  };

  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 调用API处理图片
  const processImage = async (file: File) => {
    try {
      setIsProcessingImage(true);
      setRecognizedText('');
      setTranslatedText('');
      setDetectedLanguage('');
      setTranslationAudioUrl(null);
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('image', file);
      
      // 发送请求
      const response = await fetch('/api/vision-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }
      
      const data = await response.json();
      
      if (data.text) {
        setRecognizedText(data.text);
        if (data.language) {
          setDetectedLanguage(data.language);
        }
      } else {
        toast.warning('No text detected in the image. Try another image or adjust the image quality.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // 翻译文本
  const translateText = async () => {
    if (!recognizedText || isTranslating) return;

    try {
      setIsTranslating(true);
      
      // 根据检测到的语言或用户选择设置源语言
      const sourceCode = detectedLanguage 
        ? detectedLanguage.split('-')[0] 
        : (sourceLanguage !== 'auto' ? translationLanguageCodes[sourceLanguage] || 'en' : 'auto');
      
      const targetCode = translationLanguageCodes[targetLanguage] || 'zh';
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recognizedText,
          sourceLanguage: sourceCode,
          targetLanguage: targetCode,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate text');
      }
      
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      toast.error('Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // 生成语音
  const generateSpeech = async () => {
    if (!translatedText || isGeneratingAudio) return;
    
    try {
      setIsGeneratingAudio(true);
      
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translatedText,
          language: targetLanguage,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }
      
      // 获取音频blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setTranslationAudioUrl(url);
      
      // 自动播放音频
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error('Failed to generate speech. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, setCopying: (value: boolean) => void, setSuccess: (value: boolean) => void) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
      setCopying(false);
      setSuccess(true);
      // 2秒后重置成功状态
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy text');
      setCopying(false);
    }
  };

  const copyRecognizedText = () => copyToClipboard(recognizedText, setIsCopyingRecognized, setCopySuccessRecognized);
  const copyTranslatedText = () => copyToClipboard(translatedText, setIsCopyingTranslated, setCopySuccessTranslated);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <img 
                src="/icon-192.png" 
                alt="Travel Translator Logo" 
                className="h-8 w-8" 
              />
              <span>Travel Translator</span>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Photo Translation Section */}
      <section className="py-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">
            Photo Text Recognition &amp; Translation
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            Take a photo of signs, menus, or documents while traveling to instantly translate their content using Google Cloud Vision API.
          </p>

          <Card className="p-6 space-y-6">
            {/* Image Upload Area */}
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {!imagePreview ? (
                <div className="py-6">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium mb-1">Upload Image</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop an image or click to browse
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-80 mx-auto rounded-lg" 
                  />
                  <Button 
                    className="absolute top-2 right-2" 
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearResults();
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              )}
            </div>

            {/* Processing Status */}
            {isProcessingImage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Processing image...</span>
              </div>
            )}

            {/* Recognized Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Detected Text
                  {detectedLanguage && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Detected language: {detectedLanguage}
                    </span>
                  )}
                </label>
              </div>
              <div className="relative">
                <Textarea
                  value={recognizedText}
                  onChange={(e) => setRecognizedText(e.target.value)}
                  placeholder="Detected text will appear here..."
                  className="min-h-[120px] resize-none pr-12"
                />
                {recognizedText && (
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9" 
                      onClick={copyRecognizedText}
                      disabled={isCopyingRecognized}
                    >
                      {isCopyingRecognized ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : copySuccessRecognized ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Translation Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Translation</h2>
                <div className="flex items-center space-x-2">
                  {isTranslating && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Translating...
                    </div>
                  )}
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  value={translatedText}
                  placeholder="Translation will appear here..."
                  className="min-h-[120px] resize-none pr-12"
                  readOnly
                />
                {translatedText && (
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9" 
                      onClick={copyTranslatedText}
                      disabled={isCopyingTranslated}
                    >
                      {isCopyingTranslated ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : copySuccessTranslated ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (recognizedText) {
                      translateText();
                    }
                  }}
                  disabled={!recognizedText || isTranslating}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retranslate
                    </>
                  )}
                </Button>
                <Button 
                  onClick={generateSpeech}
                  disabled={!translatedText || isGeneratingAudio}
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Speak
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* What is Section */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">What is Photo Translation?</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Photo Translation is an advanced feature of Travel Translator that uses Google Cloud Vision API to detect text in images and instantly translate it into your preferred language. This powerful technology allows you to overcome language barriers by simply taking a photo of any text you encounter during your travels.
              </p>
              <p className="text-muted-foreground">
                Whether you&apos;re navigating a foreign city, ordering food at a restaurant, or trying to understand important documents, our photo translation tool provides accurate, real-time translations with just a snap of your camera. The system automatically detects the language of the text and translates it into your chosen target language, making it an indispensable tool for travelers, business professionals, and language learners.
              </p>
              <p className="text-muted-foreground">
                Our photo translation feature is designed to be intuitive and user-friendly, requiring no technical expertise. Simply upload an image or take a photo, and our advanced OCR (Optical Character Recognition) technology will extract the text, which is then processed by our translation engine to provide you with an accurate translation in seconds.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">How to Use Photo Translation</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">1. Upload Image</h3>
                <p className="text-muted-foreground">
                  Take a photo with your device&apos;s camera or upload an existing image containing text you want to translate. For best results, ensure the text is clearly visible and well-lit.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">2. Text Recognition</h3>
                <p className="text-muted-foreground">
                  Our system uses Google Cloud Vision API to automatically detect and extract text from your image. The detected text will appear in the &quot;Detected Text&quot; field, and the system will identify the source language.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">3. Get Translation</h3>
                <p className="text-muted-foreground">
                  Select your target language from the dropdown menu. The extracted text is instantly translated, and you can copy the translation, listen to it spoken aloud, or save it for later reference.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Advanced OCR Technology</h3>
                <p className="text-muted-foreground">
                  Powered by Google Cloud Vision API, our text recognition system can accurately extract text from various image formats, including photos of signs, documents, and handwritten notes.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Multi-Language Support</h3>
                <p className="text-muted-foreground">
                  Translate between multiple languages including English, Chinese, Spanish, French, German, and Japanese. Our system automatically detects the source language for your convenience.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Text-to-Speech</h3>
                <p className="text-muted-foreground">
                  Listen to the pronunciation of translated text with our text-to-speech feature, helping you learn correct pronunciation and communicate more effectively.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
                <p className="text-muted-foreground">
                  Copy translated text to your clipboard with a single click, making it easy to share translations via messaging apps, email, or other platforms.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Camera Integration</h3>
                <p className="text-muted-foreground">
                  Take photos directly within the app using your device&apos;s camera, with automatic text detection and translation for immediate results.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">User-Friendly Interface</h3>
                <p className="text-muted-foreground">
                  Our intuitive design makes photo translation accessible to users of all technical levels, with clear instructions and visual feedback throughout the process.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Perfect For</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Restaurant Menus</h3>
                <p className="text-muted-foreground">
                  Never wonder what you&apos;re ordering again! Translate menus to understand ingredients, dishes, and special offers at restaurants worldwide.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Street Signs</h3>
                <p className="text-muted-foreground">
                  Navigate foreign cities with confidence by translating street signs, directions, and addresses, helping you find your way without language barriers.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Product Labels</h3>
                <p className="text-muted-foreground">
                  Understand what you&apos;re buying by translating product ingredients, instructions, and descriptions on packaging in any language.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Informational Signs</h3>
                <p className="text-muted-foreground">
                  Don&apos;t miss important information at museums, attractions, or transportation hubs by instantly translating informational signs and notices.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Business Documents</h3>
                <p className="text-muted-foreground">
                  Translate business cards, contracts, and other professional documents to facilitate international business communication and collaboration.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Educational Materials</h3>
                <p className="text-muted-foreground">
                  Help students and educators translate textbooks, worksheets, and educational resources to support learning in multiple languages.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">How accurate is the photo translation?</h3>
                <p className="text-muted-foreground">
                  Our photo translation feature uses Google Cloud Vision API for text recognition and Google Translate for translation, providing highly accurate results. The accuracy depends on image quality, text clarity, and language complexity, but our system performs exceptionally well with clear, well-lit images.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Which languages are supported?</h3>
                <p className="text-muted-foreground">
                  Our photo translation tool supports multiple languages including English, Chinese (Simplified), Spanish, French, German, and Japanese. The system can detect the source language automatically and translate to any of our supported target languages.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Can I use the app offline?</h3>
                <p className="text-muted-foreground">
                  Photo translation requires an internet connection to process images and access our translation services. However, you can take photos while offline and upload them when you have connectivity.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we take your privacy seriously. Images and translations are processed securely, and we do not store your photos or translation data permanently. All data is encrypted during transmission.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">Can I translate handwritten text?</h3>
                <p className="text-muted-foreground">
                  While our system works best with printed text, it can recognize clear, well-formed handwriting in many languages. For best results with handwritten text, ensure good lighting and minimal background clutter.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-2">How do I get the best results?</h3>
                <p className="text-muted-foreground">
                  For optimal translation results, ensure your image is well-lit, focused, and contains clear, readable text. Avoid extreme angles, glare, or shadows that might obscure the text. For small text, try to get as close as possible while maintaining focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 md:py-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <img 
                src="/icon-192.png" 
                alt="Travel Translator Logo" 
                className="h-6 w-6" 
              />
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} Travel Translator. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 