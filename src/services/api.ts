import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this interceptor to automatically add the token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('Adding token to request:', token);
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Now you can simplify your favorites functions
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites/');
    console.log('Raw favorites response:', response);
    
    // Check the structure of the response data
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object with results property, return that
      if (Array.isArray(response.data.results)) {
        return response.data.results;
      }
      // Otherwise return the object itself, the component will handle it
      return response.data;
    }
    
    // Fallback to empty array if we can't determine the structure
    console.warn('Unexpected favorites data structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const toggleFavorite = async (laptopId: string) => {
  try {
    const response = await api.post('/favorites/toggle/', { laptop_id: laptopId });
    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getFavoriteLaptopIds = async () => {
  try {
    const response = await api.get('/favorites/laptop_ids/');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite laptop IDs:', error);
    return [];
  }
};

// Keep your existing functions
export const getLaptops = async (filters = {}) => {
  try {
    const response = await api.get('/laptops/', { params: filters });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching laptops:', error);
    throw error;
  }
};

export const getLaptopById = async (id: string) => {
  try {
    const response = await api.get(`/laptops/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching laptop with id ${id}:`, error);
    throw error;
  }
};

export const getBrands = async () => {
  try {
    const response = await api.get('/laptops/brands/');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/laptops/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};