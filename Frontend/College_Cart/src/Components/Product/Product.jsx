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

const SKELETON_COUNT = 8;

const Product = () => {
  const { searchQuery, products, productsLoading } = useContext(UserDataContext);
  const dispatch = useDispatch();
  const revealRef = useScrollReveal({ stagger: 40 });

  useEffect(() => {
    // The cart endpoint is authenticated. This used to dispatch
    // unconditionally, so every signed-out visitor to the products page spent
    // a request on a guaranteed 401.
    if (getToken()) dispatch({ type: 'cart/initialize' });
  }, [dispatch]);

  // Derived with useMemo instead of being mirrored into state by an effect.
  // The old effect also called window.scrollTo(0, 0) on every run - and it ran
  // on every `searchQuery` change - so typing in the search box yanked the page
  // back to the top after each keystroke.
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products ?? [];
    return (products ?? []).filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

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
      {/* Was `class="stickyHeader"`, which React ignores - the header was not
          actually sticky on this page. */}
      <div className="stickyHeader">
        <Header showSearch={true} showMiddleHeader={true} isProductsPage={true} />
      </div>

      <main className="productPage">
        {/* Driven by the provider's shared flag. The local `loading` state it
            replaced was only ever cleared inside `if (products.length > 0)`, so
            an empty catalogue or a failed request left eight placeholder cards
            shimmering forever. */}
        <div className="productGrid" ref={revealRef}>
          {productsLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                />
              ))}
        </div>

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
