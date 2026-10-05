import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { UserDataContext } from '../Header/context';
import styles from './productCard.module.css';
import { Ellipsis } from 'lucide-react';
import { motion } from 'framer-motion';
import DeleteProduct from './DeleteProduct';
import Skeleton from '../ui/Skeleton';
import { getToken } from '../../util/tokenService';
import UpdateProduct from './UpdateProduct';
import ExchangeBookCard from './ExchangeBookCard';
import usePagination from '../../util/usePagination';
import Pagination from '../ui/Pagination';

const backend_url = import.meta.env.VITE_BACKEND_API_URL;
const PAGE_SIZE = 5;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { data, setUserProduct } = useContext(UserDataContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [exchangeBooks, setExchangeBooks] = useState([])

  const fetchProductData = useCallback(async ({ silent = false } = {}) => {
    if (!data._id) return;
    if (!silent) setIsLoading(true);
    const token = getToken()
    try {
      const res = await axios.get(`${backend_url}/${data._id}/get-all-profile-product`,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setProducts(res.data.products ?? []);
      setUserProduct((res.data.products ?? []).length)
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [data._id, setUserProduct]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const toggleMenu = (productId) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };

  const truncateDescription = (text) => {
    const words = text.split(' ');
    return words.length > 30 ? words.slice(0, 30).join(' ') + '...' : text;
  };

  const fetchDataExchangeBook = useCallback(async () => {
    if (!data._id) return;
    const token = getToken()
    try {
      const response = await axios.get(`${backend_url}/allProduct`,{
        headers:{ 'Content-Type': 'application/json','Authorization':`Bearer ${token}`}
      })
      const findUserBookCreate = (response.data.product ?? []).filter(
        (user)=> data._id === user.userId?._id)

      setExchangeBooks(findUserBookCreate)
    } catch (error) {
      console.error("Error:", error);
    }
  }, [data._id]);

  useEffect(()=>{
   fetchDataExchangeBook()
  },[fetchDataExchangeBook])

  const listRef = useRef(null);
  const { page, setPage, totalPages, pageItems, total, rangeStart, rangeEnd } =
    usePagination(products, PAGE_SIZE);

  const refreshProfileProducts = useCallback(() => Promise.all([
    fetchProductData({ silent: true }),
    fetchDataExchangeBook(),
  ]), [fetchProductData, fetchDataExchangeBook]);

  return (
    <>
      <div className={`${styles.productContainer} cc-page-anchor`} ref={listRef}>
        {isLoading
          ? Array(products.length || 10).fill().map((_, index) => (
              <div key={index} className={styles.skeletonWrapper}>
                <Skeleton 
                  variant="rectangular" 
                  width={500} 
                  height={230} 
                  className={styles.skeletonImageContainer}
                />
                <div className={styles.hrline} />
                <div className={styles.skeletonDetailsContainer}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                </div>
                <div className={styles.skeletonActionsContainer}>
                  <Skeleton variant="rectangular" width={70} height={30} />
                </div>
              </div>
            ))
          : pageItems.map((product) => (
              <div key={product._id} className={styles.productWrapper}>
                <div className={styles.productImageContainer}>
                  <div className={styles.productMedia}>
                  <motion.img
                    whileHover={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 90 }}
                    src={product.image}
                    alt={product.name}
                    className={styles.productImageProfile}
                  />
                    </div>
                  <span className={styles.saleBadge} onClick={() => toggleMenu(product._id)}>
                    <Ellipsis />
                  </span>
                  {openMenuId === product._id && (
                    <div className={styles.popupMenu}>
                      <button className={styles.menuItem}>Edit</button>
                      <button className={styles.menuItem}
                      onClick={()=>{
                        setProductToUpdate(product);
                        setIsUpdateModalOpen(true);
                        setOpenMenuId(null);
                       }
                      }
                      >Update</button>
                      <button
                        className={styles.menuItemDeleteBtn}
                        onClick={() => {
                          setProductToDeleteId(product._id);
                          setIsDeleteModalOpen(true);
                          setOpenMenuId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.hrline} />
                <div className={styles.allProductContainer}>
                  <p className={styles.productName}>
                    <span className={styles.item}>Name: </span> {product.name}
                  </p>
                  <p className={styles.productBrand}>
                    <span className={styles.item}>Brand: </span> {product.brand}
                  </p>
                  <p className={styles.productBrand}>
                    <span className={styles.item}>Quantity: </span> {product.quantity}
                  </p>
                  <p className={styles.productCategory}>
                    <span className={styles.item}>Category: </span> {product.category}
                  </p>
                  <p className={styles.productSelectHostel}>
                    <span className={styles.item}>Choice student: </span> {product.selectHostel}
                  </p>
                  {product.selectHostel === 'Hostler' ? (
                    <>
                      <p className={styles.productHostleName}>
                        <span className={styles.item}>Hostel Name: </span> {product.hostleName}
                      </p>
                      <p className={styles.productRoomNumber}>
                        <span className={styles.item}>Room Number: </span> {product.roomNumber}
                      </p>
                    </>
                  ) : (
                    <p className={styles.productHostleName}>
                      <span className={styles.item}>Contact number: </span> {product.dayScholarContectNumber}
                    </p>
                  )}
                  <p className={styles.productPrevAmount}>
                    <span className={styles.item}>Buy Amount: </span> {product.prevAmount}
                  </p>
                  <p className={styles.productNewAmount}>
                    <span className={styles.item}>Selling Amount: </span> {product.newAmount}
                  </p>
                  <p className={styles.productDescription}>
                    <span className={styles.item}>Description: </span> {truncateDescription(product.description)}
                  </p>
                </div>
              </div>
            ))}
        {!isLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            label={total === 1 ? 'listing' : 'listings'}
            scrollTargetRef={listRef}
            variant="compact"
          />
        )}

           {exchangeBooks.length > 0 && (
          <div>
            <p className='text-2xl pl-10 font-bold'>Exchange Book Products</p>
            <ExchangeBookCard exchangeBooks={exchangeBooks} onChanged={refreshProfileProducts} />
            </div>
          )}
      </div>
      <DeleteProduct
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        productId={productToDeleteId}
        bookId=""
        onDeleted={(deletedId) => {
          setProducts((prev) => prev.filter((product) => product._id !== deletedId));
          setUserProduct((count) => Math.max(0, (count || 1) - 1));
          refreshProfileProducts();
        }}
      />
      <UpdateProduct 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        productData={productToUpdate}
        onUpdated={(updated) => {
          if (updated?._id) {
            setProducts((prev) =>
              prev.map((product) =>
                product._id === updated._id ? { ...product, ...updated } : product
              )
            );
          }
          refreshProfileProducts();
        }}
        />
    </>
  );
};

export default Product;