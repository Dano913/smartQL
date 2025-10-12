import React, { useRef, useState } from 'react';
import { FileUp, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isLoading,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="rounded-lg shadow-md p-8 transition-all duration-300 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        Upload Excel File
      </h2>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center  ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        } cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        <FileUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />

        <p className="text-lg mb-2 font-medium text-gray-700">
          {isDragging
            ? 'Drop your file here'
            : 'Drag & drop your Excel file here'}
        </p>

        <p className="text-gray-500 mb-4">or</p>

        <button
          className="px-6 py-3 bg-blue-400 dark:bg-blue-900 text-white rounded-md shadow-sm hover:bg-blue-800 transition-colors"
          type="button"
        >
          Browse Files
        </button>

        <p className="mt-3 text-sm text-gray-500">
          Supported formats: .xlsx, .xls, .csv
        </p>
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Processing your file...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
