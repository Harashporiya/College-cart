import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import { UserDataContext } from '../../Header/context';
import { getToken } from '../../../util/tokenService';
import useScrollReveal from '../../../util/useScrollReveal';
import usePagination from '../../../util/usePagination';
import Pagination from '../../ui/Pagination';
import './categoryListing.css';

const SKELETON_COUNT = 8;
const PAGE_SIZE = 12;

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

const CategoryListing = ({ title, category }) => {
  const navigate = useNavigate();
  const { products, productsLoading, data } = useContext(UserDataContext);
  const revealRef = useScrollReveal({ stagger: 45 });

  const items = useMemo(
    () => (products ?? []).filter((item) => item.category === category),
    [products, category]
  );

  const { page, setPage, totalPages, pageItems, total, rangeStart, rangeEnd } =
    usePagination(items, PAGE_SIZE, category);

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
          {!productsLoading && (
            <p className="listing-count">
              {items.length} {items.length === 1 ? 'item' : 'items'} available
            </p>
          )}
        </header>

        <div className="listing-grid cc-page-anchor" ref={revealRef}>
          {productsLoading ? (
            Array.from({ length: SKELETON_COUNT }, (_, i) => <CardSkeleton key={i} />)
          ) : (
            pageItems.map((item) => {
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

        {!productsLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            label={total === 1 ? 'item' : 'items'}
            scrollTargetRef={revealRef}
          />
        )}

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
