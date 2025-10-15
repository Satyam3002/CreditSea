import axios from 'axios';

// Get API base URL from environment variables or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://creditsea-pp7h.onrender.com/api';

console.log('🚀 Using API Base URL:', API_BASE_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized
        console.error('Unauthorized access');
      } else if (status >= 500) {
        // Handle server errors
        console.error('Server error:', data?.message || 'Internal server error');
      }
      
      return Promise.reject({
        status,
        message: data?.message || data?.error || 'An error occurred',
        details: data?.details
      });
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        details: null
      });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        details: null
      });
    }
  }
);

// API methods
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Upload endpoints
  async uploadXMLFile(file) {
    const formData = new FormData();
    formData.append('xmlFile', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadMultipleFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('xmlFiles', file);
    });
    
    const response = await api.post('/upload/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getSampleXML() {
    const response = await api.get('/upload/sample', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Reports endpoints
  async getReports(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/reports?${queryParams.toString()}`);
    return response.data;
  },

  async getReportById(id) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  async getReportByPAN(pan) {
    const response = await api.get(`/reports/pan/${pan}`);
    return response.data;
  },

  async deleteReport(id) {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Statistics endpoints
  async getSummaryStats() {
    const response = await api.get('/reports/stats/summary');
    return response.data;
  },

  async getCreditScoreDistribution() {
    const response = await api.get('/reports/stats/credit-score-distribution');
    return response.data;
  },
};

export default api;

