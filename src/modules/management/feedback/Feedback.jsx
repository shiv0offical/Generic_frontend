import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonSearch from '../../../components/CommonSearch';
import { Box, CircularProgress, Table, TableBody, TableCell } from '@mui/material';
import { TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const columns = [
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'rating', header: 'Rating' },
  { key: 'message', header: 'Message' },
  { key: 'createdAt', header: 'Created At' },
];

function Feedback() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackData, setFeedbackData] = useState([]);

  const companyID = localStorage.getItem('company_id');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, [searchQuery, page, limit]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = { company_id: companyID, search: searchQuery, page: page + 1, limit };
      const res = await ApiService.get(APIURL.FEEDBACK, params);
      if (res?.success) {
        const list = Array.isArray(res.data?.feedbacks) ? res.data.feedbacks : [];
        setFeedbackData(
          list.map((item) => ({
            id: item.id,
            employeeName: `${item?.employee?.first_name || ''} ${item?.employee?.last_name || ''}`.trim(),
            rating: item?.rating,
            message: item?.message,
            createdAt: dayjs(item.created_at).format('YYYY-MM-DD'),
            raw: item,
          }))
        );
        setTotalCount(typeof res.data?.pagination?.total === 'number' ? res.data.pagination.total : list.length);
      } else {
        setFeedbackData([]);
        setTotalCount(0);
      }
    } catch (e) {
      setFeedbackData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setOrder(orderBy === key && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(key);
  };

  const sortedData = orderBy
    ? [...feedbackData].sort((a, b) => {
        const va = a[orderBy] ?? '',
          vb = b[orderBy] ?? '';
        if (typeof va === 'string') return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return order === 'asc' ? va - vb : vb - va;
      })
    : feedbackData;

  const handleEdit = (row) => navigate('/management/feedback/edit', { state: row.raw });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await ApiService.delete(`${APIURL.FEEDBACK}/${id}`);
      if (res.success) {
        alert('Feedback deleted successfully!');
        if (sortedData.length === 1 && page > 0) setPage(page - 1);
        else fetchFeedbacks();
      } else alert('Failed to delete this Feedback.');
    } catch {
      alert('An error occurred while deleting.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Feedbacks (Total: {totalCount})</h1>
        <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' height='300px'>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 720, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.key} align='left' sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : 'asc'}
                        onClick={() => handleSort(col.key)}>
                        {col.header}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align='center' sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align='center'>
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>{row[col.key]}</TableCell>
                      ))}
                      <TableCell align='center'>
                        <div className='flex justify-center gap-3 text-white'>
                          <button
                            className='bg-green-400 py-1.5 p-2 rounded-md cursor-pointer'
                            onClick={() => handleEdit(row)}>
                            <EditIcon fontSize='10px' />
                          </button>
                          <button
                            className='bg-red-400 py-1.5 p-2 rounded-md cursor-pointer'
                            onClick={() => handleDelete(row.id)}>
                            <DeleteIcon fontSize='10px' />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[10, 15, 20, 25, 30]}
          component='div'
          count={totalCount || sortedData.length}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
}

export default Feedback;
