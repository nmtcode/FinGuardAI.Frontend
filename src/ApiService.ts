// src/services/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const IsDevelopment: boolean = false;
// إنشاء الكائن الأساسي
const apiClient = axios.create({
  baseURL: IsDevelopment
    ? "https://localhost:7082/api"
    : "http://promising-generationapi.runasp.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const ApiService = {
  // جلب البيانات
  async getAll<T>(endpoint: string) {
    try {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  // جلب بيانات واحدة
  async getById<T>(endpoint: string, id: number) {
    try {
      const response = await apiClient.get<T>(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  // إرسال بيانات جديدة
  async post<T>(endpoint: string, data: any) {
    try {
      const response = await apiClient.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  // تحديث بيانات
  async put<T>(endpoint: string, id: number, data: any) {
    try {
      const response = await apiClient.put<T>(`${endpoint}?id=${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  // حذف
  async delete<T>(endpoint: string, id: number) {
    try {
      const response = await apiClient.delete<T>(`${endpoint}?id=${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  // وظيفة بسيطة لطباعة الأخطاء في الكونسول
  handleError(error: any) {
    console.error("API Error:", error.response?.data || error.message);
  },
};

export default ApiService;
