const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : '/api';

export const api = {
  async login(data) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async register(data) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async uploadResource(formData) {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // ... 其他 API 方法
}; 