'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (
        selectedFile.type === 'text/plain' ||
        selectedFile.type === 'application/pdf'
      ) {
        if (selectedFile.size <= 10 * 1024 * 1024) {
          setFile(selectedFile);
          setError(null);
        } else {
          setError('File size must be 10MB or less.');
          setFile(null);
        }
      } else {
        setError('This file type is not supported. Please try another file.');
        setFile(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (file) {
      console.log('Uploading file:', file);
      // Upload logic will go here
    } else if (!error) {
      setError('Please select a file to upload.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Upload Your Study Materials</h1>
      <p className="text-lg text-gray-600 mb-8">
        Upload your .txt and .pdf files to get started.
      </p>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose a file
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
