// src/components/DragAndDropUploadArea.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DragAndDropUploadAreaProps {
  onFileUpload: (file: File) => void;
  onValidationError: (message: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DragAndDropUploadArea: React.FC<DragAndDropUploadAreaProps> = ({
  onFileUpload,
  onValidationError,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        // Handle file rejections from dropzone itself (e.g., too many files)
        onValidationError('Only one file can be uploaded at a time.');
        return;
      }

      if (acceptedFiles.length === 0) {
        onValidationError('No files were selected or the selected file is not supported.');
        return;
      }

      const file = acceptedFiles[0];

      // Client-side file type validation (.txt, .pdf)
      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        onValidationError('This file type is not supported. Please try another file.');
        return;
      }

      // Client-side file size validation (max 10MB)
      if (file.size > MAX_FILE_SIZE) {
        onValidationError('File size exceeds 10MB limit.');
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload, onValidationError]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: false, // Only allow one file at a time
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
      `}
    >
      <input {...getInputProps()} data-testid="drag-and-drop-input" />
      {isDragActive ? (
        <p className="text-blue-600">Drop the files here ...</p>
      ) : (
        <p className="text-gray-700">Drag 'n' drop your file here, or click to select file</p>
      )}
      <em className="text-gray-500 text-sm mt-2">
        (.txt, .pdf files, max 10MB)
      </em>
      {fileRejections.length > 0 && (
        <div className="mt-4 text-red-500">
          {fileRejections.map(({ file, errors }) => (
            <li key={file.name}>
              {file.name} - {errors.map(e => e.message).join(', ')}
            </li>
          ))}
        </div>
      )}
    </div>
  );
};
