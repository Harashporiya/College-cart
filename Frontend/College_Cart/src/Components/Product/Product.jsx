import React, { useContext, useEffect, useMemo } from 'react';
import Header from '../Header/Header';
import './product.css';
import ProductCard from './CardProduct';
import ProductCardSkeleton from '../ui/ProductCardSkeleton';
import Footer from '../Footer/Footer';
import { UserDataContext } from '../Header/context';
import { getToken } from '../../util/tokenService';
import { useDispatch } from 'react-redux';
import { addToCart } from '../Redux/Slice';
import { cartAdd } from '../SagaRedux/Slice';
import store from '../SagaRedux/Store';
import useScrollReveal from '../../util/useScrollReveal';
import usePagination from '../../util/usePagination';
import Pagination from '../ui/Pagination';

const SKELETON_COUNT = 8;
const PAGE_SIZE = 12;

const Product = () => {
  const { searchQuery, products, productsLoading } = useContext(UserDataContext);
  const dispatch = useDispatch();
  const revealRef = useScrollReveal({ stagger: 40 });

  useEffect(() => {
    if (getToken()) dispatch({ type: 'cart/initialize' });
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products ?? [];
    return (products ?? []).filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const { page, setPage, totalPages, pageItems, total, rangeStart, rangeEnd } =
    usePagination(filteredProducts, PAGE_SIZE, searchQuery.trim().toLowerCase());

  const handleAddToCart = (product1) => {
    dispatch(addToCart(product1));
    const totalQuantity = store.getState().cart.totalQuantity;

    const updatedState = store.getState().cart.itemList;
    const storeItem = updatedState.find((item) => item._id === product1._id);
    if (storeItem) {
      const cartItem = {
        productId: storeItem._id,
        name: storeItem.name,
        brand: storeItem.brand,
        category: storeItem.category,
        selectHostel: storeItem.selectHostel,
        hostleName: storeItem.hostleName,
        roomNumber: storeItem.roomNumber,
        dayScholarContectNumber: storeItem.dayScholarContectNumber,
        price: storeItem.price,
        prevPrice: storeItem.prevPrice,
        totalPrice: storeItem.totalPrice,
        image: storeItem.image,
        productQuantity: storeItem.productQuantity,
        quantity: storeItem.quantity,
        totalQuantity: totalQuantity,
      };
      dispatch(cartAdd(cartItem));
    }
  };

  return (
    <>
      <div className="stickyHeader">
        <Header showSearch={true} showMiddleHeader={true} isProductsPage={true} />
      </div>

      <main className="productPage">
        <div className="productGrid cc-page-anchor" ref={revealRef}>
          {productsLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : pageItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                />
              ))}
        </div>

        {!productsLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            label={total === 1 ? 'product' : 'products'}
            scrollTargetRef={revealRef}
          />
        )}

        {!productsLoading && filteredProducts.length === 0 && (
          <p className="productEmpty">
            {searchQuery.trim()
              ? `No results for "${searchQuery.trim()}". Try a different keyword or explore other items on College Cart.`
              : 'No products listed yet. Check back soon.'}
          </p>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Product;
