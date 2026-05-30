import axios from 'axios';
import { auth } from '../firebase';

export const axiosPlantumlParserInstance = axios.create({
  baseURL: import.meta.env.VITE_PLANTUML_PARSER_SERVER_PORT,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const axiosBackendInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const authInitialized = new Promise<void>((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    unsubscribe();
    resolve();
  });
});

axiosBackendInstance.interceptors.request.use(
  async (config) => {
    await authInitialized;

    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Temporary for Python backend development:
      config.headers['x-user-id'] = auth.currentUser?.uid || 'test-user-id';
    } else {
      config.headers['x-user-id'] = 'test-user-id';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
