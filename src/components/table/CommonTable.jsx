import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonSearch from '../CommonSearch';

const CommonTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onSearch,
  totalCount = 0, // <-- added: total rows from backend
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <CommonSearch
        onChange={(e) => {
          onSearch(e.target.value);
        }}
      />
      <TableContainer sx={{ my: 2 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  className='whitespace-nowrap'
                  key={index}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? order : 'asc'}
                    onClick={() => handleSort(col.key)}>
                    {col.header}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align='center'>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell className='whitespace-nowrap' key={colIndex} align={col.align || 'left'}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell align='center' sx={{ display: 'flex', gap: 1, padding: 2 }}>
                    <button
                      className='bg-green-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                      onClick={() => onEdit(row)}>
                      <EditIcon fontSize='10px' />
                    </button>
                    <button
                      className='bg-red-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                      onClick={() => onDelete(row)}>
                      <DeleteIcon fontSize='10px' />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <p className='text-center text-gray-500 py-6'>No Data Available!</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component='div'
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page - 1}
        onPageChange={(event, newPage) => onPageChange(newpage + 1 || 1)}
        onRowsPerPageChange={(event) => {
          onRowsPerPageChange(parseInt(event.target.value));
        }}
      />
    </Paper>
  );
};

export default CommonTable;
