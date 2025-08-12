// tiny auth helper using localStorage
const KEY = 'pg_jwt';
export const setToken = (t) => localStorage.setItem(KEY, t);
export const getToken = () => localStorage.getItem(KEY) || '';
export const clearToken = () => localStorage.removeItem(KEY);
export const isLoggedIn = () => !!getToken();