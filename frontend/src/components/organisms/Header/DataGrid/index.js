"use client";

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export const DataGridComponent = ({
  rows,
  columns,
  pageSize = 5,
  autoHeight = true,
  checkboxSelection = false,
  ...otherProps
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        autoHeight={autoHeight}
        checkboxSelection={checkboxSelection}
        {...otherProps}
      />
    </Box>
  );
};
export default DataGridComponent;