import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const statusCode = error.response?.status || 500;
    const apiError = error.response?.data?.error;

    return Promise.reject(new ApiError(
      statusCode,
      apiError?.code || 'NETWORK_ERROR',
      apiError?.message || 'Unable to reach the server'
    ));
  }
);

export default api;
