import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPolicyPage() {
  const markdown = fs.readFileSync(path.join(process.cwd(), 'docs', 'privacy-policy.md'), 'utf8');

  return (
    <div className="prose lg:prose-xl mx-auto p-4">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
