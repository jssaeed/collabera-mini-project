import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default client;
