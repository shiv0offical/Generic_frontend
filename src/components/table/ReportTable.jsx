import { useState } from 'react';
import CommonSearch from '../CommonSearch';
import { Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material';
import { TableRow, TableSortLabel, TablePagination, Paper, CircularProgress } from '@mui/material';

const DEFAULT_LIMIT_OPTIONS = [10, 25, 50, 100];

const headerCellSx = {
  fontWeight: 'bold',
  fontSize: '1rem',
  p: '0.5rem 0.75rem',
  background: '#FAFAFA',
  borderBottom: '1px solid #e0e0e0',
  height: 40,
};

const bodyCellSx = (isFirst) => ({
  fontWeight: isFirst ? 500 : 400,
  fontSize: '1rem',
  p: '0.5rem 0.75rem',
  height: 36,
  verticalAlign: 'middle',
});

const ReportTable = ({
  columns,
  data,
  loading,
  error,
  page,
  setPage,
  limit,
  setLimit,
  searchQuery,
  setSearchQuery,
  limitOptions,
  totalCount = 0,
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const validLimitOptions =
    Array.isArray(limitOptions) && limitOptions.length > 0
      ? limitOptions.filter((opt) => DEFAULT_LIMIT_OPTIONS.includes(opt))
      : DEFAULT_LIMIT_OPTIONS;

  const safeLimit = typeof limit === 'number' && validLimitOptions.includes(limit) ? limit : validLimitOptions[0];

  let sortedData = [...data];
  if (orderBy) {
    sortedData.sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];
      if (typeof valueA === 'string')
        return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }
  const paginatedData = sortedData.slice(page * safeLimit, page * safeLimit + safeLimit);

  return (
    <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4 h-full'>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {typeof setSearchQuery === 'function' && (
          <div className='p-3 pb-0'>
            <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        )}

        <TableContainer sx={{ maxHeight: 720, overflowX: 'auto' }}>
          <Table stickyHeader size='medium'>
            <TableHead>
              <TableRow sx={{ height: 40 }}>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || 'left'} sx={headerCellSx}>
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : 'asc'}
                      onClick={() => {
                        const isAsc = orderBy === col.key && order === 'asc';
                        setOrder(isAsc ? 'desc' : 'asc');
                        setOrderBy(col.key);
                      }}>
                      {col.header}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow sx={{ height: 36 }}>
                  <TableCell colSpan={columns.length} align='center' sx={{ height: 60 }}>
                    <CircularProgress size={28} className='my-2' />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow sx={{ height: 36 }}>
                  <TableCell colSpan={columns.length} align='center' sx={{ height: 60 }}>
                    No data found
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align='center'>
                    <div className='text-red-700 text-center w-full py-2'>{error}</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={row.id || rowIndex} hover sx={{ height: 36 }}>
                    {columns.map((col, colIdx) => (
                      <TableCell key={col.key} align={col.align || 'left'} sx={bodyCellSx(colIdx === 0)}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={validLimitOptions}
          component='div'
          count={totalCount}
          rowsPerPage={safeLimit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            const newLimit = parseInt(e.target.value, 10);
            setLimit(newLimit);
            setPage(0);
          }}
        />
      </Paper>
    </div>
  );
};

export default ReportTable;
