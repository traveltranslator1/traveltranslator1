'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, RefreshCw, Copy, Check, Mic, StopCircle, Play, Download, Globe2, ArrowRight, Menu, Camera, Languages, Volume, Laptop, Cloud, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RecordingButton } from '@/components/ui/recording-button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';

const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'ja-JP', label: 'Japanese' },
];

// Map for translation language codes (different from speech recognition codes)
const translationLanguageCodes: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'ja-JP': 'ja',
};

const features = [
  {
    title: "Accurate Speech Translation",
    description: "Our advanced speech recognition technology powered by Google Cloud ensures highly accurate voice translation with real-time processing, making Travel Translator the ideal companion for natural conversations in any language.",
    icon: Mic
  },
  {
    title: "Instant Photo Translation",
    description: "Translate text from images instantly using Google Cloud Vision API. From menus to street signs, our photo translation feature makes navigating foreign environments effortless with high accuracy.",
    icon: Camera
  },
  {
    title: "Multi-Language Support",
    description: "Translate between dozens of languages with comprehensive coverage. Travel Translator empowers you to connect across cultures and explore globally without limitations, supporting all major world languages.",
    icon: Languages
  },
  {
    title: "Text-to-Speech Function",
    description: "Not sure how to pronounce it? Our text-to-speech feature powered by Google Cloud Text-to-Speech speaks the translation for you, helping you learn and communicate more effectively with natural pronunciation.",
    icon: Volume
  },
  {
    title: "User-Friendly Interface",
    description: "Designed for simplicity and ease of use with responsive design. Travel Translator is intuitive and accessible for travelers of all ages and tech-savviness, with clear visual feedback and straightforward controls.",
    icon: Laptop
  },
  {
    title: "Cloud-Based Accuracy",
    description: "Leveraging powerful Google Cloud translation services, Travel Translator provides consistently accurate and up-to-date translations with continuous improvements to language models and recognition algorithms.",
    icon: Cloud
  }
];

const useCases = [
  {
    title: "Dining Like a Local",
    description: "Effortlessly order food at restaurants by translating menus with our photo translation feature. Understand ingredients, special dishes, and dietary restrictions to enjoy authentic local cuisine with confidence.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Navigate with Confidence",
    description: "Understand street signs, public transportation schedules, and maps in any language. Our translation tools help you navigate foreign cities independently, find your way around, and discover hidden gems.",
    image: "https://images.unsplash.com/photo-1569959220744-ff553533f492?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Connect with Locals",
    description: "Engage in meaningful conversations with people you meet. Use speech translation to break the ice, ask for recommendations, share stories, and build genuine connections across language barriers.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Shopping Smart Abroad",
    description: "Understand product descriptions, ask shopkeepers questions, and negotiate prices with ease. Our translation tools help you make informed purchasing decisions and find the best deals in local markets.",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Cultural Exploration",
    description: "Deepen your understanding of local culture by translating historical information, museum exhibits, and cultural artifacts. Our tools help you appreciate the rich heritage and traditions of the places you visit.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Emergency Assistance",
    description: "Access critical information in emergency situations. Translate medical terms, communicate with healthcare providers, and understand important safety information when language barriers could be a matter of safety.",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=60"
  }
];

const faqs = [
  {
    question: "How accurate is Travel Translator compared to other translation apps?",
    answer: "Travel Translator is built with cutting-edge Google Cloud translation technology, offering superior accuracy for travel-specific scenarios. Our speech recognition and translation engines are specifically optimized for conversational language and travel terminology, consistently outperforming general-purpose translation tools in real-world travel situations."
  },
  {
    question: "What languages does Travel Translator support?",
    answer: "Travel Translator supports dozens of languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese (Simplified and Traditional), Arabic, and many more. We continuously expand our language coverage to serve travelers worldwide. Our comprehensive language support makes us the most versatile travel translator available."
  },
  {
    question: "Can I use Travel Translator offline?",
    answer: "Yes, our Premium plan includes offline translation capabilities, allowing you to translate even without an internet connection. This is a crucial feature for any travel translator, especially in areas with limited connectivity. Offline mode includes pre-downloaded language packs for the most commonly used languages."
  },
  {
    question: "How does the photo translation feature work?",
    answer: "Our photo translation feature uses Google Cloud Vision API to detect text in images, then translates it instantly. Simply take a photo of text (like a menu, sign, or document) and our app will recognize the text and translate it to your chosen language. This works with both printed and handwritten text in most languages."
  },
  {
    question: "Is my privacy protected when using Travel Translator?",
    answer: "Yes, we take your privacy seriously. Travel Translator uses secure connections and does not store your personal translation data. Your audio recordings and images are processed securely and deleted after translation. We have a comprehensive privacy policy that explains how we handle your data. Your trust is paramount as you use the travel translator."
  },
  {
    question: "How does the speech-to-text translation work?",
    answer: "Our speech-to-text translation uses Google Cloud Speech-to-Text API to convert your spoken words into text, then translates that text using Google Cloud Translation API. The process happens in real-time, allowing for natural conversation flow. The system is optimized to handle various accents, background noise, and travel-specific vocabulary."
  },
  {
    question: "Can I save translations for later use?",
    answer: "Yes, Travel Translator allows you to save your translations for offline access. This is particularly useful for common phrases, directions, or important information you might need to reference later. Premium users can create custom phrasebooks and organize saved translations by category or location."
  },
  {
    question: "Is Travel Translator suitable for business travel?",
    answer: "Absolutely! Travel Translator is perfect for business travelers who need to communicate professionally in different languages. Our app supports formal language styles and business terminology, making it ideal for meetings, presentations, and professional interactions abroad."
  }
];

const whyChooseUs = [
  {
    title: "Unmatched Accuracy",
    description: "We leverage Google Cloud's advanced AI translation technology to provide the most accurate translations available. Our travel-specific optimizations ensure precise communication in real-world scenarios, making us the most reliable travel translator for critical situations."
  },
  {
    title: "Ease of Use",
    description: "Our intuitive design ensures that Travel Translator is incredibly easy to use, even for first-time users. With clear visual cues, straightforward controls, and responsive feedback, you can focus on your travel experience rather than struggling with complicated technology."
  },
  {
    title: "Comprehensive Features",
    description: "From speech to photo translation and text-to-speech, Travel Translator packs all essential features into one platform. Our all-in-one approach eliminates the need for multiple apps, streamlining your travel experience with a single, powerful translation solution."
  },
  {
    title: "Travel-Focused",
    description: "Specifically designed for travelers, addressing the unique language challenges faced on the road. Our features and optimizations are tailored to common travel scenarios, from ordering food to navigating transportation, making us the most practical travel translator available."
  },
  {
    title: "Continuous Improvement",
    description: "We regularly update our translation models and add new features based on user feedback and emerging travel trends. Our commitment to continuous improvement ensures that Travel Translator evolves to meet the changing needs of modern travelers."
  },
  {
    title: "Global Community",
    description: "Join thousands of travelers worldwide who trust Travel Translator for their language needs. Our growing community shares tips, feedback, and success stories, creating a supportive network of global explorers who value seamless communication."
  }
];

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('zh-CN');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [translationAudioUrl, setTranslationAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCopyingRecognized, setIsCopyingRecognized] = useState(false);
  const [isCopyingTranslated, setIsCopyingTranslated] = useState(false);
  const [copySuccessRecognized, setCopySuccessRecognized] = useState(false);
  const [copySuccessTranslated, setCopySuccessTranslated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Effect to automatically translate when recognized text changes
  useEffect(() => {
    if (recognizedText) {
      translateText();
    }
  }, [recognizedText]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 检查MediaRecorder和mimeType兼容性
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        options = { mimeType: 'audio/aac' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
      }
      
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        console.log('MediaRecorder initialized with options:', options);
      } catch (err) {
        // 如果指定mime类型失败，尝试不指定mime类型
        console.warn('Failed to initialize MediaRecorder with specified options, trying without mime type');
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          // 检测使用的mime类型
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm;codecs=opus';
          console.log('Recording completed with mime type:', mimeType);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Process speech to text
          await processSpeechToText(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          toast.error('Failed to process recording.');
        }
      };

      // 在Safari上，确保每500ms触发一次dataavailable事件
      mediaRecorderRef.current.start(500);
      console.log('Recording started');
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Reset previous results
      setRecognizedText('');
      setTranslatedText('');
      setTranslationAudioUrl(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processSpeechToText = async (audioBlob: Blob) => {
    try {
      setIsProcessingSpeech(true);
      
      console.log('Processing speech to text with audio blob type:', audioBlob.type);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      // 创建FormData对象，这对所有浏览器都更兼容
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', sourceLanguage);
      
      // 直接发送FormData
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to process speech to text';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (data.text) {
        setRecognizedText(data.text);
      } else {
        toast.warning('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Error processing speech to text:', error);
      toast.error('Failed to process speech. Please try again.');
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  const translateText = async () => {
    if (!recognizedText || isTranslating) return;

    try {
      setIsTranslating(true);
      
      const sourceCode = translationLanguageCodes[sourceLanguage] || 'en';
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
      
      // Get the audio blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setTranslationAudioUrl(url);
      
      // Automatically play the audio
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error('Failed to generate speech. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const copyToClipboard = async (text: string, setCopying: (value: boolean) => void, setSuccess: (value: boolean) => void) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
      setCopying(false);
      setSuccess(true);
      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy text');
      setCopying(false);
    }
  };

  const copyRecognizedText = () => copyToClipboard(recognizedText, setIsCopyingRecognized, setCopySuccessRecognized);
  const copyTranslatedText = () => copyToClipboard(translatedText, setIsCopyingTranslated, setCopySuccessTranslated);

  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">
                Features
              </a>
              <a href="#use-cases" className="text-sm font-medium transition-colors hover:text-primary">
                Use Cases
              </a>
              <Link href="/photo" className="text-sm font-medium transition-colors hover:text-primary">
                Photo Translation
              </Link>
              <a href="#faq" className="text-sm font-medium transition-colors hover:text-primary">
                FAQ
              </a>
            </nav>
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#use-cases" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Use Cases
                </a>
                <Link 
                  href="/photo" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Photo Translation
                </Link>
                <a 
                  href="#faq" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
          
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              The Best Travel Translator in Your Pocket
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Break Language Barriers and Explore the World Effortlessly. Your Ultimate Travel Companion for Seamless Communication.
            </p>
          </div>
        </div>
      </section>

      {/* Translation Tool Section (using our current implementation) */}
      <section className="py-10 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-6 space-y-6">
            {/* Source Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Source Language
              </label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
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

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-8">
              <div className="relative flex flex-col items-center">
                <RecordingButton
            isRecording={isRecording}
                  onClick={handleRecordingClick}
                  disabled={isProcessingSpeech}
                />
                {isRecording && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="text-center text-sm font-medium text-emerald-600">
                      Recording...
                    </div>
                    <div className="text-center text-lg font-semibold text-emerald-600">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recognized Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Recognized Text
                </label>
                {isProcessingSpeech && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
              <div className="relative">
                <Textarea
                  value={recognizedText}
                  onChange={(e) => setRecognizedText(e.target.value)}
                  placeholder="Recognized text will appear here..."
                  className="min-h-[100px] resize-none pr-12"
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
                  className="min-h-[100px] resize-none pr-12"
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
        </div>
      </section>

      {/* What is Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">What is Travel Translator?</h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Travel Translator is your comprehensive all-in-one solution for overcoming language barriers during your travels. Whether you are a seasoned globetrotter or embarking on your first international adventure, our platform provides accurate and instant translation for speech, text, and images using advanced Google Cloud technology. We are dedicated to being the most reliable travel translator, ensuring you can communicate confidently anywhere in the world.
            </p>
            <p>
              More than just a translation tool, Travel Translator is designed to enhance your entire travel experience. From ordering food in local restaurants to navigating foreign streets, from understanding historical sites to making new friends, we empower you to explore without language limitations. Our intuitive interface and powerful features make translation effortless, allowing you to focus on the joy of discovery rather than the frustration of communication barriers.
            </p>
            <p>
              Travel Translator stands out as the best travel translator by combining cutting-edge technology with user-friendly design. Our platform continuously learns and improves, adapting to new languages and dialects to provide increasingly accurate translations. Whether you're traveling for business or leisure, our comprehensive suite of translation tools ensures you'll never feel lost in translation again.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How to Use Travel Translator</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Speech Translation</h3>
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  <li>Select your source language from the dropdown menu</li>
                  <li>Tap the microphone icon to start recording</li>
                  <li>Speak clearly in your native language</li>
                  <li>Tap the stop button when finished</li>
                  <li>View the recognized text and translation</li>
                  <li>Use the speak function to hear the pronunciation</li>
                </ol>
                <p className="text-muted-foreground">
                  Experience the ease of voice communication with the travel translator. Perfect for conversations on the go, asking for directions, or ordering food at restaurants!
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Photo Translation</h3>
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  <li>Navigate to the Photo Translation page</li>
                  <li>Select your target language</li>
                  <li>Tap the camera icon or upload an image</li>
                  <li>Take a clear photo of the text you want to translate</li>
                  <li>View the recognized text and translation</li>
                  <li>Copy or listen to the translation as needed</li>
                </ol>
                <p className="text-muted-foreground">
                  Navigate menus, signs, and more with our incredibly accurate photo translation feature. Ideal for translating written content when you&apos;re on the move or need to understand documents in foreign languages.
                </p>
              </div>
              <Link href="/photo">
                <Button className="w-full">
                  Try Photo Translation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
            <Card className="p-6">
              <div className="mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Text Input Translation</h3>
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  <li>Select your source and target languages</li>
                  <li>Type or paste the text you want to translate</li>
                  <li>View the instant translation results</li>
                  <li>Use the speak function to hear the pronunciation</li>
                  <li>Copy the translation to share or save for later</li>
                </ol>
                <p className="text-muted-foreground">
                  Translate any text with ease using the travel translator. Ideal for translating messages, documents, emails, and any written content you encounter during your travels. Perfect for preparing for meetings or understanding written communications.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features of Travel Translator</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Travel Translator?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20" id="use-cases">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Travel Translator Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-20 bg-muted/50" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Basic Speech Translation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Limited Photo Translations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Standard Language Support
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </Card>
            <Card className="p-6 border-primary">
              <h3 className="text-xl font-semibold mb-4">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Unlimited Speech Translation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Unlimited Photo Translations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> All Languages Supported
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Offline Access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Priority Support
                </li>
              </ul>
              <Button className="w-full">Upgrade to Premium</Button>
            </Card>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-20" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions About Travel Translator
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/icon-192.png" 
                  alt="Travel Translator Logo" 
                  className="h-10 w-10" 
                />
                <h3 className="font-bold">Travel Translator</h3>
              </div>
              <p className="text-muted-foreground">
                Break language barriers and explore the world effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/photo" className="text-muted-foreground hover:text-primary">
                    Photo Translation
                  </a>
                </li>
                
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="text-muted-foreground hover:text-primary">
                  Use Cases
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                  </a>
                </li>
                {/* <li>
                  <a href="#pricing" className="text-muted-foreground hover:text-primary">
                    Pricing
                  </a>
                </li> */}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            © {new Date().getFullYear()} Travel Translator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 