import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './pagination.css';

const range = (from, to) => {
  const out = [];
  for (let i = from; i <= to; i += 1) out.push(i);
  return out;
};

const buildPages = (page, totalPages, siblings) => {
  const slots = siblings * 2 + 5;
  if (totalPages <= slots) return range(1, totalPages);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, totalPages);
  const gapLeft = left > 3;
  const gapRight = right < totalPages - 2;

  if (!gapLeft && gapRight) return [...range(1, siblings * 2 + 3), 'gap-right', totalPages];
  if (gapLeft && !gapRight) return [1, 'gap-left', ...range(totalPages - (siblings * 2 + 2), totalPages)];
  return [1, 'gap-left', ...range(left, right), 'gap-right', totalPages];
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  total = 0,
  rangeStart = 0,
  rangeEnd = 0,
  label = 'items',
  siblings = 1,
  scrollTargetRef = null,
  variant = 'default',
}) => {
  if (!totalPages || totalPages < 2) return null;

  const goTo = (next) => {
    if (next === page || next < 1 || next > totalPages) return;
    onPageChange(next);

    const target = scrollTargetRef?.current;
    if (!target) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const pages = buildPages(page, totalPages, siblings);

  return (
    <nav
      className={`cc-pagination cc-pagination--${variant}`}
      role="navigation"
      aria-label={`${label} pagination`}
    >
      {total > 0 && (
        <p className="cc-pagination__summary">
          Showing <span>{rangeStart}</span>&ndash;<span>{rangeEnd}</span> of <span>{total}</span> {label}
        </p>
      )}

      <ul className="cc-pagination__list">
        <li>
          <button
            type="button"
            className="cc-pagination__btn cc-pagination__btn--edge"
            onClick={() => goTo(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            <ChevronsLeft size={17} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="cc-pagination__btn cc-pagination__btn--step"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={17} aria-hidden="true" />
            <span className="cc-pagination__stepText">Prev</span>
          </button>
        </li>

        {pages.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`cc-pagination__btn cc-pagination__btn--page${
                  item === page ? ' is-active' : ''
                }`}
                onClick={() => goTo(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="cc-pagination__gap" aria-hidden="true">
              &hellip;
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className="cc-pagination__btn cc-pagination__btn--step"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <span className="cc-pagination__stepText">Next</span>
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="cc-pagination__btn cc-pagination__btn--edge"
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight size={17} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
