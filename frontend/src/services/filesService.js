import { api } from "@services/apiClient";

/**
 * Upload a single file to the server
 * @param {File} file - The file to upload
 * @param {string} type - File type: "audio" or "image"
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export const uploadFile = async (file, type = "image") => {
  const formData = new FormData();
  
  // Backend expects: File (IFormFile) and Type (string - "audio" or "image")
  formData.append("File", file);
  formData.append("Type", type);
  
  console.log("Uploading file:", {
    name: file.name, 
    type: file.type, 
    size: file.size,
    fileType: type,
    formDataKeys: Array.from(formData.keys())
  });
  
  try {
    const response = await api.post("/api/files/upload", formData);
    
    console.log("Upload response:", response.data);
    
    // Backend returns ApiResponse<string> with data property
    return response.data.data || response.data;
  } catch (error) {
    console.error("Upload error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error;
  }
};


export const deleteFiles = async (urls) => {
  if (!urls || urls.length === 0) return;
  
  const response = await api.delete("/api/files/delete", {
    data: { urls },
  });
  
  return response.data;
};

