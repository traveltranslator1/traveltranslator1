import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>At Best Travel Translator, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our translation services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p>We collect the following types of information:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Audio recordings when using speech-to-text features</li>
                <li>Images when using photo translation features</li>
                <li>Text input when using text translation features</li>
                <li>Usage data and analytics</li>
                <li>Device information and browser type</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Provide translation services</li>
                <li>Improve our translation accuracy</li>
                <li>Enhance user experience</li>
                <li>Analyze service usage patterns</li>
                <li>Detect and prevent technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Limited employee access to user data</li>
                <li>Secure data storage with industry-standard protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Google Cloud Translation API</li>
                <li>Google Cloud Speech-to-Text API</li>
                <li>Google Cloud Vision API</li>
                <li>Google Analytics</li>
                <li>Google AdSense</li>
              </ul>
              <p className="mt-2">These services have their own privacy policies and data handling practices.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies and Tracking</h2>
              <p>We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Remember your preferences</li>
                <li>Analyze website usage</li>
                <li>Improve our services</li>
                <li>Display relevant advertisements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
              <p>We retain your data for as long as necessary to provide our services and comply with legal obligations. Audio recordings and images are typically deleted after processing.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
              <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">Email: privacy@besttraveltranslator.com</p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 