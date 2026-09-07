import axios from "axios";
import { getToken } from "../../util/tokenService";

const backend_url = import.meta.env.VITE_BACKEND_API_URL;

const API = axios.create({
  baseURL: backend_url,
  withCredentials: true,
  // There was no timeout at all, so a request to a suspended backend instance
  // hung indefinitely and the UI sat on its loading state with nothing to show
  // for it. 60s is deliberately generous: the host cold-starts containers, and
  // cutting a genuine wake-up short would fail a login that was about to work.
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
    // FormData needs the browser to set its own multipart boundary.
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
    // A bare timeout or network drop surfaced as "Network Error", which told
    // the user nothing. These map to something a person can act on.
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
// The request interceptor already attaches the token, so this no longer builds
// its own Authorization header.
export const getProductDetails = (productId) => API.get(`/${productId}/product`);
export const cartProductAdd = (cartProduct) => API.post("/cartProductAdd", cartProduct)
export const productCartAll = () => API.get("/all-cart-product")

export const updateProfileAndEdit = (formData) => {
  const userId = formData.get('userId');
  // Uses the shared instance so it inherits the timeout, the auth header and
  // the error mapping above; it previously called axios directly and bypassed
  // all three.
  return API.patch(`/update-profile/${userId}`, formData);
};
