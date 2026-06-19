const API_BASE = '/api/v1';

async function fetcher<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

export const api = {
  get: <T>(url: string) => fetcher<T>(`${API_BASE}${url}`),
  
  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  put: async <T>(url: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, { 
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },
};
