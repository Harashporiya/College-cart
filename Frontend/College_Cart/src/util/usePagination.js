import { useEffect, useMemo, useState } from 'react';

export const usePagination = (items, pageSize = 12, resetKey = '') => {
  const list = useMemo(() => items ?? [], [items]);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    setPage((current) => (current > totalPages ? totalPages : current));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  const pageItems = useMemo(
    () => list.slice(start, start + pageSize),
    [list, start, pageSize]
  );

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    total,
    pageSize,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
  };
};

export default usePagination;
