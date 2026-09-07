import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import axios from 'axios';
import { getToken } from '../../util/tokenService';
import { warmBackend } from '../../util/warmBackend';

const backend_url = import.meta.env.VITE_BACKEND_API_URL;
const UserDataContext = createContext();

const UserDataProvider = ({ children }) => {
  const [userProduct, setUserProduct] = useState();
  const [data, setData] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [products, setProducts] = useState([]);
  const [productId, setProductIdBy] = useState([]);
  const [exchangeProduct, setExchangeProduct] = useState([]);
  // Exposed so listing sections can stop showing skeletons even when the
  // response is empty or fails. They previously cleared their own local
  // `loading` flag only inside `if (products.length > 0)`, so an empty catalogue
  // or a failed request left placeholder cards shimmering forever.
  const [productsLoading, setProductsLoading] = useState(true);

  // `getToken()` reads a cookie and localStorage on every call. Both effects
  // below used to pass the *call* as their dependency - `[getToken()]` - so it
  // re-ran on every render of the provider, which wraps the whole app.
  const token = getToken();

  // Start the API container waking as early as possible, in parallel with the
  // two fetches below rather than behind them.
  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
    // Aborted on unmount and on token change so a slow in-flight response
    // cannot overwrite fresher state.
    const controller = new AbortController();

    const fetchProductData = async () => {
      setProductsLoading(true);
      const apiUrl = token ? `${backend_url}/all-product` : `${backend_url}/public-products`;
      try {
        const res = await axios.get(apiUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        setProducts(res.data.products ?? []);
      } catch (error) {
        if (!axios.isCancel(error) && error.name !== 'CanceledError') {
          console.error('Failed to load products:', error.message);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false);
      }
    };

    fetchProductData();
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    // This endpoint is authenticated. It used to fire regardless, so every
    // logged-out visitor spent a request on a guaranteed 401 before the page
    // could settle.
    if (!token) {
      setExchangeProduct([]);
      return;
    }

    const controller = new AbortController();

    const fetchExchangeProducts = async () => {
      try {
        const res = await axios.get(`${backend_url}/allProduct`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setExchangeProduct(res.data.product ?? []);
      } catch (error) {
        if (!axios.isCancel(error) && error.name !== 'CanceledError') {
          console.error('Failed to load exchange products:', error.message);
        }
      }
    };

    fetchExchangeProducts();
    return () => controller.abort();
  }, [token]);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  // The provider sits above every route, so an unmemoised object literal here
  // handed each consumer a new value on every render and re-rendered the whole
  // tree - including all the product grids - on each keystroke in the search box.
  const value = useMemo(
    () => ({
      data, setData,
      searchQuery, setSearchQuery, clearSearch,
      totalQuantity, setTotalQuantity,
      products, setProducts, productsLoading,
      productId, setProductIdBy,
      userProduct, setUserProduct,
      exchangeProduct, setExchangeProduct,
    }),
    [data, searchQuery, clearSearch, totalQuantity, products, productsLoading, productId, userProduct, exchangeProduct]
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export { UserDataContext, UserDataProvider };
