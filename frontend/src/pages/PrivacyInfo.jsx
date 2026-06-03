// PrivacyPolicy.js
import React from 'react';

const PrivacyInfo = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Effective Date: <span className="text-gray-800 font-medium">14 September,2024</span></p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">1. Data Collection</h2>
          <p className="text-gray-600 mb-4">
            We collect and store user data, including avatar,name, email, password (encrypted using bcrypt), institute, and role. Publicly visible information includes your uploaded items, avatar,name, username, email, institute, and role.
          </p>
          <ul className="list-disc ml-8 text-gray-600 space-y-2">
            <li>Personal information is securely stored in MongoDB Atlas.</li>
            <li>Sign-in with Google collects basic profile data.</li>
            <li>No data is shared with third-party services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">2. Data Usage</h2>
          <p className="text-gray-600">
            We use the data to facilitate educational material sharing, personalize user experiences, and improve our services. Your public profile will display the following details:
          </p>
          <ul className="list-disc ml-8 text-gray-600 space-y-2">
            <li>Uploaded materials</li>
            <li>Avatar,username, email, and institute</li>
            <li>Role (student, teacher, etc.)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">3. Data Storage</h2>
          <p className="text-gray-600 mb-4">
            Your data is stored in:
          </p>
          <ul className="list-disc ml-8 text-gray-600 space-y-2">
            <li><strong>Session Tokens:</strong> Stored in sessionStorage.</li>
            <li><strong>Refresh Tokens:</strong> Stored in localStorage.</li>
            <li>No cookies are used directly on the site.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">4. Data Protection</h2>
          <p className="text-gray-600">
            We implement industry-standard security measures, including encryption with bcrypt for password storage. Your data is kept secure and confidential.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">5. Your Rights</h2>
          <p className="text-gray-600">
            You have the right to access, update, or delete your personal data. To exercise your rights, please contact us at <a href="mailto:wisdomhubsmtp@gmail.com" className="text-indigo-600 underline">wisdomhubsmtp@gmail.com</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">6. Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions or concerns about this Privacy Policy, feel free to reach out to us at <a href="mailto:wisdomhubsmtp@gmail.com" className="text-indigo-600 underline">wisdomhubsmtp@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyInfo;
