import React, { useContext } from 'react';
import './ProductCard.css';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../Header/context';
import { getToken } from '../../util/tokenService';

const ProductCard = ({ product, handleAddToCart }) => {
  const navigate = useNavigate();
  const { data } = useContext(UserDataContext);

  const isAuthenticated = Boolean(data && data._id);

  const decDescription = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > 20 ? `${words.slice(0, 20).join(' ')}...` : text;
  };

  const discount =
    product.prevAmount > product.newAmount
      ? Math.round(((product.prevAmount - product.newAmount) / product.prevAmount) * 100)
      : 0;

  const handleNavigate = () => {
    navigate(getToken() && isAuthenticated ? `/${product._id}/product` : '/login');
  };

  return (
    // The framer-motion wrappers here (whileHover on the card and a spring
    // scale on the image) have been replaced by CSS transitions in
    // ProductCard.css. Motion had to re-render and recompute a style object for
    // every card on every pointer move; the CSS version runs on the compositor
    // and costs nothing on a grid of dozens of cards.
    // `cc-reveal` opts this card into the grid's scroll-reveal cascade
    // (see useScrollReveal in Product.jsx).
    <article className="product-card cc-reveal">
      <div className="product-image-wrapper" onClick={handleNavigate} role="button" tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
          }
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          decoding="async"
        />
        {discount > 0 && <div className="discount-badge">-{discount}%</div>}
      </div>

      <div className="product-content">
        <h2 className="product-title" onClick={handleNavigate}>{product.name}</h2>

        <div className="rating-container">
          <div className="stars" aria-hidden="true">★★★★☆</div>
          <span className="rating-count">1,234</span>
        </div>

        <div className="pricing-section">
          <div className="price-container">
            <span className="rupee-symbol">&#8377;</span>
            <span className="main-price">{product.newAmount}</span>
          </div>
          {product.prevAmount !== product.newAmount && (
            <div className="original-price-container">
              <span className="mrp">M.R.P.:</span>
              <span className="original-price">&#8377; {product.prevAmount}</span>
            </div>
          )}
        </div>

        <p className="product-description">{decDescription(product.description)}</p>
      </div>

      <button
        className="add-to-cart-button"
        onClick={() => (isAuthenticated ? handleAddToCart(product) : navigate('/login'))}
      >
        Add to Cart
      </button>
    </article>
  );
};

export default ProductCard;
