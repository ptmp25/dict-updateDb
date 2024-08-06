// apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  createNew(wordData) {
    return apiClient.post("/words/save", wordData);
  },
  uploadCSV(formData) {
    return apiClient.post("/words/upload_csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async readList(page, limit, sortField) {
    try {
      const response = await apiClient.get(`/words/read_list/?page=${page}`, {
        params: { limit, sortField },
      });
      console.log(page); // Ensure this logs the correct data
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async getDetails(id) {
    try {
      const response = await apiClient.get(`/words/details/${id}`);
      // console.log(response.data); // Ensure this logs the correct data
      return response; // Ensure to return the response data
    } catch (error) {
      console.error("Error fetching word details:", error);
      throw error; // Re-throw the error to be handled by the calling function
    }
  },
  async updateDetails(id, wordData) {
    try {
      const response = await apiClient.patch(`/words/update/${id}`, wordData);
      return response;
    } catch (error) {
      console.error("Error updating word details:", error);
      throw error;
    }
  },
  async deleteWord(id) {
    try {
      const response = await apiClient.delete(`/words/delete/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting word:", error);
      throw error;
    }
  },
  async exportCSV() {
    try {
      const response = await apiClient.get("/words/export_csv");
      return response;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  },
  async searchWord(searchTerm, language) {
    try {
      const response = await apiClient.get("/words/search", {
        params: { q: searchTerm, language },
      });
      return response;
    } catch (error) {
      console.error("Error searching word:", error);
      throw error;
    }
  },
  // async translateText(text, to) {
  //   try {
  //     const response = await apiClient.post("/translate", { text, to });
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error translating text:", error);
  //     throw error;
  //   }
  // },
  async saveWord(wordData) {
    try {
      console.log("wordData", wordData);
      const response = await axios.post("/api/words/save", wordData);
      return response.data;
    } catch (error) {
      console.error("Error saving word:", error);
      throw error;
    }
  },
  async translateText(sourceText, sourceLang, targetLang) {
    // console.log(sourceText, targetLang, sourceLang);
    const response = await axios.post("/translateText", {
      text: sourceText,
      fromLang: sourceLang,
      toLang: targetLang,
    });
    return response.data;
  },
};
