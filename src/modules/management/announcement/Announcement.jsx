import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonSearch from '../../../components/CommonSearch';
import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const columns = [
  { key: 'id', header: 'Sr No' },
  { key: 'senderName', header: 'Sender Name' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'title', header: 'Announcement Title' },
  { key: 'message', header: 'Message' },
  { key: 'createdOn', header: 'Created On' },
];

function Announcement() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search: searchQuery, page: page + 1 || 1, limit };
      const response = await ApiService.get(APIURL.ANNOUNCEMENT, params);

      if (response?.success) {
        const formatData = (response.data.announcements || []).map((item, idx) => ({
          id: idx + 1,
          announcementId: item.id,
          senderName: item.senderName,
          employeeName: item.employeeName,
          title: item.title,
          message: item.message,
          createdOn: dayjs(item.created_at).format('YYYY-MM-DD hh:mm A'),
        }));
        setAnnouncements(formatData);
      } else {
        alert(response.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('API call failed:', error?.message || error);
      alert('Something went wrong while fetching announcements data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const sortedData = orderBy
    ? [...announcements].sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];
        if (typeof valueA === 'string')
          return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        return order === 'asc' ? valueA - valueB : valueB - valueA;
      })
    : announcements;

  const paginatedData = sortedData.slice(page * limit, page * limit + limit);

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await ApiService.delete(`${APIURL.ANNOUNCEMENT}/${announcementId}`);
      if (response.success) {
        alert('Announcement deleted successfully!');
        fetchData();
      } else {
        console.error(response.message);
        alert('Failed to delete announcement.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Announcements</h1>
        <div className='flex gap-x-4'>
          <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Link to='/management/announcement/create'>
            <button type='button' className='bg-[#07163d] text-white px-3 py-2 rounded-[3px] cursor-pointer'>
              Create New Announcement
            </button>
          </Link>
        </div>
      </div>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' height='300px'>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
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
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align='center'>
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>{row[col.key]}</TableCell>
                      ))}
                      <TableCell>
                        <div className='flex justify-center gap-3 text-white'>
                          <button
                            className='bg-red-400 py-1.5 p-2 rounded-md cursor-pointer'
                            onClick={() => handleDelete(row.announcementId)}>
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
          count={sortedData.length}
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

export default Announcement;
