import axios from 'axios';
import { AlbumInfo, Record, RecordFormData, SearchResults } from '../types';

// Create axios instance with base URL and CORS settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Set to true if your API requires credentials
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Records API
export const getRecords = async (page = 1, limit = 10): Promise<Record[]> => {
  const skip = (page - 1) * limit;
  const response = await api.get(`/records/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getRecord = async (id: number): Promise<Record> => {
  const response = await api.get(`/records/${id}`);
  return response.data;
};

export const createRecord = async (record: RecordFormData): Promise<Record> => {
  console.log('Creating record with data:', record);
  try {
    const response = await api.post('/records/', record);
    console.log('Record created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
};

export const updateRecord = async (id: number, record: Partial<RecordFormData>): Promise<Record> => {
  console.log('Updating record with data:', record);
  try {
    const response = await api.put(`/records/${id}`, record);
    console.log('Record updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};

export const deleteRecord = async (id: number): Promise<boolean> => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};

export const searchRecords = async (query: string, page = 1, limit = 10): Promise<SearchResults> => {
  const skip = (page - 1) * limit;
  const response = await api.get(`/records/search?q=${query}&skip=${skip}&limit=${limit}`);
  return response.data;
};

// Genres API
export const getGenres = async (): Promise<string[]> => {
  const response = await api.get('/genres/');
  return response.data.map((genre: { name: string }) => genre.name);
};

// Album Info API
export const fetchAlbumInfo = async (artist: string, title: string): Promise<AlbumInfo> => {
  const response = await api.get(`/fetch-album-info?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
  return response.data;
}; 