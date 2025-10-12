// App.tsx
import React from 'react';
import FileUploader from './components/FileUploader';
import QueryGenerator from './components/QueryGenerator';
import { useExcelData } from './hooks/useExcelData';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const {
    excelData,
    fileName,
    headers,
    handleFileUpload,
    isLoading,
    error,
    resetData,
  } = useExcelData();

  return (
    <ThemeProvider>
      <Layout showReset={excelData.length > 0} onReset={resetData}>
        {!excelData.length ? (
          <FileUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <QueryGenerator
            excelData={excelData}
            fileName={fileName}
            headers={headers}
          />
        )}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
