import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../ui/Skeleton';
import Button from '../Button/Button';
import { UserDataContext } from '../../Header/context';
import { getToken } from '../../../util/tokenService';
import useScrollReveal from '../../../util/useScrollReveal';
import './categoryRow.css';

const PLACEHOLDER_COUNT = 6;

const CardSkeleton = () => (
  <div className="cat-card cat-card--skeleton">
    <Skeleton variant="rectangular" className="cat-card__media" />
    <Skeleton variant="text" width="85%" />
    <Skeleton variant="text" width="55%" />
  </div>
);

/**
 * One horizontal "shelf" of products for a single category.
 *
 * Replaces five near-identical components (Electronics, Books, Clothing,
 * Sports, Grocery) that had been copy-pasted along with their own stylesheets,
 * so every layout fix had to be made five times - and two of those stylesheets
 * (clothing.css, sport.css) were empty files, leaving those rows unstyled.
 *
 * Behaviour changes worth noting:
 *  - The whole section used to carry an onClick that navigated to the category
 *    listing, so clicking a product card could never open that product.
 *    Cards now open their own detail page; only the heading and Explore button
 *    go to the listing.
 *  - Placeholders are driven by the provider's shared `productsLoading` flag.
 *    Each copy previously cleared a local flag only inside
 *    `if (products.length > 0)`, so an empty or failed response left the
 *    skeletons shimmering indefinitely.
 */
const CategoryRow = ({ title, category, exploreTo, limit = PLACEHOLDER_COUNT }) => {
  const navigate = useNavigate();
  const { products, productsLoading } = useContext(UserDataContext);
  const revealRef = useScrollReveal({ stagger: 60 });

  const items = useMemo(
    () => (products ?? []).filter((item) => item.category === category).slice(0, limit),
    [products, category, limit]
  );

  const openProduct = (productId) => {
    // Product details are behind auth, same gate the main product grid uses.
    navigate(getToken() ? `/${productId}/product` : '/login');
  };

  // Nothing loading and nothing to show: drop the section rather than render an
  // empty shelf with a heading over blank space.
  if (!productsLoading && items.length === 0) return null;

  return (
    <section className="cat-section" ref={revealRef} aria-label={title}>
      <div className="cat-header">
        <h2 className="cat-title">
          <button type="button" className="cat-title__link" onClick={() => navigate(exploreTo)}>
            {title}
          </button>
        </h2>
        <span onClick={() => navigate(exploreTo)}>
          <Button />
        </span>
      </div>

      <div className="cat-grid">
        {productsLoading
          ? Array.from({ length: limit }, (_, index) => <CardSkeleton key={index} />)
          : items.map((product) => (
              <article
                key={product._id}
                className="cat-card cc-reveal"
                onClick={() => openProduct(product._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProduct(product._id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="cat-card__media">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="cat-card__image"
                    /* Five of these shelves stack down the home page, so all
                       ~30 images used to be requested during the initial load
                       even though only the first row is ever visible. */
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="cat-card__body">
                  <h3 className="cat-card__name">{product.name}</h3>
                  {product.newAmount != null && (
                    <p className="cat-card__price">
                      <span className="cat-card__currency">&#8377;</span>
                      {product.newAmount}
                    </p>
                  )}
                </div>
              </article>
            ))}
      </div>
    </section>
  );
};

export default CategoryRow;
