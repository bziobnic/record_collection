import axios from 'axios';

// Types
export interface Record {
  id: number;
  title: string;
  artist: string;
  year: number;
  genre_id: number;
  cover_image?: string;
  notes?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface RecordFormData {
  title: string;
  artist: string;
  year: number;
  genre_id: number;
  cover_image?: string;
  notes?: string;
}

// API base URL
const API_BASE_URL = '/api';

// Record API functions
export const getRecords = async (): Promise<Record[]> => {
  const response = await axios.get(`${API_BASE_URL}/records/`);
  return response.data;
};

export const getRecord = async (id: number): Promise<Record> => {
  const response = await axios.get(`${API_BASE_URL}/records/${id}/`);
  return response.data;
};

export const createRecord = async (recordData: RecordFormData): Promise<Record> => {
  const response = await axios.post(`${API_BASE_URL}/records/`, recordData);
  return response.data;
};

export const updateRecord = async (id: number, recordData: RecordFormData): Promise<Record> => {
  const response = await axios.put(`${API_BASE_URL}/records/${id}/`, recordData);
  return response.data;
};

export const deleteRecord = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/records/${id}/`);
};

// Genre API functions
export const getGenres = async (): Promise<Genre[]> => {
  const response = await axios.get(`${API_BASE_URL}/genres/`);
  return response.data;
}; 