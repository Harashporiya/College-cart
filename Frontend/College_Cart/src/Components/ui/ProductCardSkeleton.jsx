import './productCardSkeleton.css';

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
          style={{ width: `${100 - i * 14}%` }}
        />
      ))}
    </div>
    <div className="cc-skeleton pcs__button" />
  </div>
);

export default ProductCardSkeleton;
