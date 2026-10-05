import axios from "axios";
import { getToken } from "../../util/tokenService";

const backend_url = import.meta.env.VITE_BACKEND_API_URL;

const API = axios.create({
  baseURL: backend_url,
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message;
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'The server is taking longer than usual to respond. Please try again in a moment.';
    } else if (!error.response) {
      message = 'Cannot reach the server. Check your connection and try again.';
    } else {
      message = error.response?.data?.message || error.message || 'Something went wrong';
    }

    return Promise.reject({
      message,
      status: error.response?.status,
    });
  }
);

export const signUp = (userData) => API.post("/signup", userData)
export const signIn = (credentials) => API.post('/login', credentials);
export const verifyEmail = (verificationData) => API.post('/verify-email', verificationData);
export const forGotpassword = (password) => API.post("/for-got-password-send", password);
export const forGotpasswordVerifyOTP = (otpVerify) => API.post("/verify-for-got-password", otpVerify);
export const passwordNewSet = (newPassword) => API.put("/password", newPassword);
export const getUserProfile = () => API.get("/user-profile");
export const getAllProduct = () => API.get("/all-product")
export const productCreate = (newProduct) => API.post("/product-create", newProduct)
export const getProductDetails = (productId) => API.get(`/${productId}/product`);
export const cartProductAdd = (cartProduct) => API.post("/cartProductAdd", cartProduct)
export const productCartAll = () => API.get("/all-cart-product")

export const updateProfileAndEdit = (formData) => {
  const userId = formData.get('userId');
  return API.patch(`/update-profile/${userId}`, formData);
};
