# Speech to Text with Translation

A web application that allows users to record speech through a microphone, convert it to text in real-time, and provide multi-language translation capabilities.

## Features

- **Speech Recording**: Record audio from your microphone with clear visual feedback
- **Speech-to-Text Conversion**: Convert recorded speech to text
- **Text Translation**: Translate recognized text into multiple languages
- **Language Selection**: Support for multiple languages for both speech recognition and translation
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **APIs**: Google Speech-to-Text API, Google Translate API (simulated in development)
- **Audio Processing**: Web Audio API, MediaRecorder API

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/traveltranslator1.git
   cd speech2text
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your API keys (for production use):
   ```
   GOOGLE_CREDENTIALS=your-credentials-file.json
   GOOGLE_API_KEY=gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select your source language from the dropdown menu
2. Click the "Start Recording" button and speak into your microphone
3. Click "Stop Recording" when you're finished
4. The recognized text will appear in the text area
5. Select a target language to see the translation
6. You can also edit the recognized text manually to update the translation

## Supported Languages

- English (US)
- Chinese (Simplified)
- Spanish
- French
- German
- Japanese
- Russian

## Production Deployment

For production deployment, you'll need to:

1. Set up a Google Cloud account and enable the Speech-to-Text and Translate APIs
2. Create a service account and download the credentials file
3. Configure environment variables for secure API access
4. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework used
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Google Cloud Platform](https://cloud.google.com/) - For Speech-to-Text and Translation APIs
