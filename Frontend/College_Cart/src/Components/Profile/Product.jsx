import React, { useCallback, useContext, useEffect, useState } from 'react';
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

const backend_url = import.meta.env.VITE_BACKEND_API_URL;

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

  // Hoisted out of the effect so it can be called again after an edit or a
  // delete. `silent` skips the loading flag: a refresh triggered by the update
  // modal should leave the existing cards on screen and swap in the new data,
  // not blank the grid back to skeletons.
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

  // Handed to the update and delete modals. Nothing used to happen after a
  // successful edit beyond closing the dialog, so the card kept rendering the
  // values fetched when the page first mounted - the effect that populated it
  // is keyed on the user id, which never changes - and a deleted product stayed
  // in the grid until a manual page reload.
  const refreshProfileProducts = useCallback(() => Promise.all([
    fetchProductData({ silent: true }),
    fetchDataExchangeBook(),
  ]), [fetchProductData, fetchDataExchangeBook]);

  return (
    <>
      <div className={styles.productContainer}>
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
                  {/* <Skeleton variant="rectangular" width={70} height={30} />
                  <Skeleton variant="rectangular" width={70} height={30} /> */}
                </div>
              </div>
            ))
          : products.map((product) => (
              <div key={product._id} className={styles.productWrapper}>
                <div className={styles.productImageContainer}>
                  {/* Was an inline style={{width:"300px"}} wrapper, which pinned the
                      photo to 300px on every screen and cancelled the
                      stylesheet's responsive rules. (Its `justifyItems` was a
                      no-op on a flex container too.) */}
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
                        // The menu used to stay open behind the dialog and was
                        // still there afterwards, so the next click on the
                        // card's badge closed it instead of reopening it.
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
          // Drop the card straight away, then reconcile with the server.
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
          // The API returns the saved document, so the card can show the new
          // values immediately; the refetch behind it keeps the rest of the
          // page (and the exchange listings) in step.
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