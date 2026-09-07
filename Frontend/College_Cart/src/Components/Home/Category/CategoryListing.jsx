import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import { UserDataContext } from '../../Header/context';
import { getToken } from '../../../util/tokenService';
import useScrollReveal from '../../../util/useScrollReveal';
import './categoryListing.css';

const SKELETON_COUNT = 8;

const money = (value) => (typeof value === 'number' ? value.toLocaleString('en-IN') : value);

const CardSkeleton = () => (
  <div className="listing-card listing-card--skeleton">
    <div className="listing-card__media cc-skeleton" />
    <div className="listing-card__body">
      <div className="cc-skeleton cc-skeleton--text" style={{ width: '80%' }} />
      <div className="cc-skeleton cc-skeleton--text" style={{ width: '45%' }} />
      <div className="cc-skeleton cc-skeleton--text" style={{ width: '35%', height: '1.5em' }} />
    </div>
  </div>
);

/**
 * Full listing page for one category.
 *
 * Replaces five copy-pasted pages (ExploreBooks, ExploreElectronices,
 * ExploreClothings, ExploreSports, ExploreGrocery) that differed only in a
 * heading string and a filter value. Each of them also declared its card and
 * skeleton components *inside* the page body, so React saw a brand-new
 * component type on every render and threw away and rebuilt the entire grid
 * rather than updating it.
 */
const CategoryListing = ({ title, category }) => {
  const navigate = useNavigate();
  const { products, productsLoading, data } = useContext(UserDataContext);
  const revealRef = useScrollReveal({ stagger: 45 });

  const items = useMemo(
    () => (products ?? []).filter((item) => item.category === category),
    [products, category]
  );

  const handleNavigate = (item) => {
    const token = getToken();
    navigate(token && data && data._id ? `/${item._id}/product` : '/login');
  };

  return (
    <div className="listing-page">
      <div className="stickyHeader"><Header /></div>

      <main className="listing-main">
        <header className="listing-head">
          <h1 className="listing-title">{title}</h1>
          {/* Only meaningful once the count is real, so it waits for the fetch. */}
          {!productsLoading && (
            <p className="listing-count">
              {items.length} {items.length === 1 ? 'item' : 'items'} available
            </p>
          )}
        </header>

        <div className="listing-grid" ref={revealRef}>
          {productsLoading ? (
            Array.from({ length: SKELETON_COUNT }, (_, i) => <CardSkeleton key={i} />)
          ) : (
            items.map((item) => {
              const hasDiscount = item.prevAmount && item.prevAmount > item.newAmount;
              return (
                <article
                  key={item._id}
                  className="listing-card cc-reveal"
                  onClick={() => handleNavigate(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigate(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="listing-card__media">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="listing-card__image"
                      loading="lazy"
                      decoding="async"
                    />
                    {hasDiscount && (
                      <span className="listing-card__badge">
                        {Math.round(((item.prevAmount - item.newAmount) / item.prevAmount) * 100)}% off
                      </span>
                    )}
                  </div>

                  <div className="listing-card__body">
                    <h2 className="listing-card__name">{item.name}</h2>
                    {item.brand && <p className="listing-card__brand">{item.brand}</p>}

                    <div className="listing-card__prices">
                      <span className="listing-card__price">&#8377;{money(item.newAmount)}</span>
                      {hasDiscount && (
                        <span className="listing-card__was">&#8377;{money(item.prevAmount)}</span>
                      )}
                    </div>

                    {hasDiscount && (
                      <p className="listing-card__save">
                        Save &#8377;{money(item.prevAmount - item.newAmount)}
                      </p>
                    )}

                    <p className="listing-card__stock">In stock</p>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* The old pages rendered an empty grid in this case, which looked like
            a page that had failed to load. */}
        {!productsLoading && items.length === 0 && (
          <p className="listing-empty">
            Nothing listed under {title} just yet. Check back soon.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryListing;
