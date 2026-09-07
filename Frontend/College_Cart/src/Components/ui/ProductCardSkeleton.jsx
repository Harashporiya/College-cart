import './productCardSkeleton.css';

/**
 * Placeholder card shown while a product grid loads.
 *
 * Replaces two long inline blocks (in Product.jsx and the exchange-book
 * listing) that laid this out with MUI <Box sx={{...}}> wrappers - a JS style
 * object recomputed for every placeholder on every render. The shape is now
 * plain CSS.
 *
 * @param {{ mediaHeight?: number|string, lines?: number }} props
 *   mediaHeight - matches the image area of the real card it stands in for.
 */
const ProductCardSkeleton = ({ mediaHeight = 200, lines = 3 }) => (
  <div className="pcs" aria-hidden="true">
    <div
      className="cc-skeleton pcs__media"
      style={{ height: typeof mediaHeight === 'number' ? `${mediaHeight}px` : mediaHeight }}
    />
    <div className="cc-skeleton cc-skeleton--text pcs__title" />
    <div className="pcs__meta">
      <div className="cc-skeleton cc-skeleton--text pcs__chip" />
      <div className="cc-skeleton cc-skeleton--text pcs__chip pcs__chip--sm" />
    </div>
    <div className="cc-skeleton cc-skeleton--text pcs__price" />
    <div className="pcs__lines">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="cc-skeleton cc-skeleton--text"
          // Ragged line lengths read as text far better than uniform bars.
          style={{ width: `${100 - i * 14}%` }}
        />
      ))}
    </div>
    <div className="cc-skeleton pcs__button" />
  </div>
);

export default ProductCardSkeleton;
