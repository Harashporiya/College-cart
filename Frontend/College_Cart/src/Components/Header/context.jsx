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
  const [productsLoading, setProductsLoading] = useState(true);

  const token = getToken();

  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
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
