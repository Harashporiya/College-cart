import React from 'react';
import CategoryListing from '../../CategoryListing';

// Thin wrapper over the shared listing page; the grid, card and skeleton
// markup this file used to duplicate now lives in one place.
const Books = () => <CategoryListing title="Books" category="Books" />;

export default Books;
