import React from 'react';
import CategoryRow from '../CategoryRow';

// Thin wrapper over the shared shelf. Replaces a full copy of the grid,
// skeleton and card markup that this file used to duplicate.
const Electronic = () => (
  <CategoryRow title="Electronics" category="Electronics" exploreTo="/all-electronic-item" />
);

export default Electronic;
