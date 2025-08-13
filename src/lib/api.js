// src/lib/api.js

let token = null;

const setToken = (newToken) => {
  token = newToken;
};

const clearToken = () => {
  token = null;
};

const getToken = () => token;

const request = async (method, url, data) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const get = (url) => request("GET", url);
const post = (url, data) => request("POST", url, data);
const put = (url, data) => request("PUT", url, data);
const del = (url) => request("DELETE", url);

// The api object that can be imported as default or named
const api = {
  get,
  post,
  put,
  del,
  setToken,
  clearToken,
  getToken,
};

// Default export
export default api;

// Named export (so `{ api }` also works)
export { api, get, post, put, del, setToken, clearToken, getToken };