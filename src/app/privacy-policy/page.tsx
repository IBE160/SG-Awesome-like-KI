<<<<<<< HEAD
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPolicyPage() {
  const markdown = fs.readFileSync(path.join(process.cwd(), 'docs', 'privacy-policy.md'), 'utf8');

  return (
    <div className="prose lg:prose-xl mx-auto p-4">
      <ReactMarkdown>{markdown}</ReactMarkdown>
=======
import { promises as fs } from 'node:fs';
import path from 'path';
import Markdown from 'react-markdown';

export default async function PrivacyPolicyPage() {
  let content = '';
  try {
    const filePath = path.join(process.cwd(), 'docs', 'privacy-policy.md');
    content = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('Failed to read privacy policy file:', error);
    content = 'Privacy policy not found.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-4 prose">
        <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>
        <Markdown>{content}</Markdown>
        <div className="text-center mt-6">
          <a href="/profile" className="text-blue-600 hover:underline">Back to Profile</a>
        </div>
      </div>
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
    </div>
  );
}
