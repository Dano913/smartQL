import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useExcelData() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        throw new Error('Unsupported file format. Please upload an Excel or CSV file.');
      }

      setFileName(file.name);
      
      const data = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        throw new Error('The file contains no data.');
      }
      
      // Extract headers
      const headerRow = jsonData[0];
      const extractedHeaders = Object.keys(headerRow);
      
      setHeaders(extractedHeaders);
      setExcelData(jsonData);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the file.');
      setExcelData([]);
      setHeaders([]);
      setFileName('');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error('Failed to read file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file.'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const resetData = () => {
    setExcelData([]);
    setHeaders([]);
    setFileName('');
    setError(null);
  };

  return {
    excelData,
    headers,
    fileName,
    handleFileUpload,
    isLoading,
    error,
    resetData
  };
}