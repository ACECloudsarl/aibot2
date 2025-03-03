// services/R2StorageService.js
import { v4 as uuidv4 } from 'uuid';

export default class R2StorageService {
  constructor() {
    this.publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  }

  async uploadFile(file, fileType, isGenerated = false) {
    console.log(`Uploading file via server: ${file.name || 'unnamed'}, type: ${fileType}`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('isGenerated', isGenerated ? 'true' : 'false');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Upload successful, URL: ${data.url}`);
      
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadBase64Image(base64Data, fileType, isGenerated = false) {
    try {
      console.log(`Converting base64 to Blob, length: ${base64Data.length}`);
      
      // Convert base64 to Blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });
      
      console.log(`Blob created, size: ${blob.size} bytes`);
      
      // Upload using server-side method
      return this.uploadFile(blob, fileType, isGenerated);
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      throw new Error(`Failed to convert base64: ${error.message}`);
    }
  }

  
}