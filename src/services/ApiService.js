import authMiddleware from '../redux/middleware/authMiddleware';

const resolveBaseUrl = () => {
  return window.location.pathname.startsWith('/dashboard')
    ? import.meta.env.VITE_BASE_URL_OLD
    : import.meta.env.VITE_BASE_URL;
};

const buildUrl = (baseUrl, params) => {
  const query = params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
  return resolveBaseUrl() + baseUrl + query;
};

const getToken = () => localStorage.getItem('authToken');
const jsonHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await res.text();
    console.error('Non-JSON response received:', text.slice(0, 200));
    throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
  }
  return res.json();
};

export default {
  post: async (url, data, params = {}) =>
    fetchJson(await buildUrl(url, params), {
      method: 'POST',
      headers: jsonHeaders(getToken()),
      body: JSON.stringify(data),
    }),

  postFormData: async (url, formData, params = {}) =>
    fetchJson(await buildUrl(url, params), {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }),

  get: async (url, params = {}) => {
    const res = await fetch(await buildUrl(url, params), {
      method: 'GET',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response received:', text.slice(0, 200));
      throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
    }
    if (authMiddleware(res)) return;
    return res.json();
  },

  put: async (url, data, params = {}) =>
    fetchJson(await buildUrl(url, params), {
      method: 'PUT',
      headers: jsonHeaders(getToken()),
      body: JSON.stringify(data),
    }),

  delete: async (url, data, params = {}) =>
    fetchJson(await buildUrl(url, params), {
      method: 'DELETE',
      headers: jsonHeaders(getToken()),
      body: JSON.stringify(data),
    }),
};
