import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useExcelData } from './src/hooks/useExcelData';

export default function App() {
  const {
    excelData,
    fileName,
    headers,
    handleFileUpload,
    isLoading,
    error,
    resetData,
  } = useExcelData();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ]
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        handleFileUpload(file);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Excel to SQL Generator
        </Text>

        {!excelData.length ? (
          <TouchableOpacity
            onPress={pickDocument}
            style={{
              padding: 20,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#ccc',
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 16, color: '#666' }}>
              Tap to select Excel file
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              File: {fileName}
            </Text>
            {/* Add your QueryGenerator component here */}
          </ScrollView>
        )}

        {isLoading && (
          <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        )}

        {error && (
          <Text style={{ marginTop: 10, color: 'red' }}>{error}</Text>
        )}
      </View>
    </View>
  );
}