'use client';

import React, { useState, useEffect } from 'react';

type SummaryFormat = 'paragraph' | 'bullet_points';

interface SummaryOptionsStepProps {
  onSelectOptions: (options: { format: SummaryFormat }) => void;
  initialFormat?: SummaryFormat;
}

const SummaryOptionsStep: React.FC<SummaryOptionsStepProps> = ({ onSelectOptions, initialFormat = 'paragraph' }) => {
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>(initialFormat);

  useEffect(() => {
    onSelectOptions({ format: selectedFormat });
  }, [selectedFormat, onSelectOptions]);

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFormat(e.target.value as SummaryFormat);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">Summary Options</h3>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Summary Format:</label>
          <div className="mt-2 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-blue-600"
                name="summaryFormat"
                value="paragraph"
                checked={selectedFormat === 'paragraph'}
                onChange={handleFormatChange}
              />
              <span className="ml-2 text-gray-700">Paragraph</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-blue-600"
                name="summaryFormat"
                value="bullet_points"
                checked={selectedFormat === 'bullet_points'}
                onChange={handleFormatChange}
              />
              <span className="ml-2 text-gray-700">Bullet Points</span>
            </label>
          </div>
        </div>
        {/* Add more options here later if needed */}
      </div>
    </div>
  );
};

export default SummaryOptionsStep;