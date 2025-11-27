// API Configuration
// This file handles the API base URL for different environments

export const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://asap2-o.onrender.com";

// Log the current API URL (only in development)
if (import.meta.env.DEV) {
    console.log("🔗 API Base URL:", API_BASE_URL);
}

export default API_BASE_URL;
