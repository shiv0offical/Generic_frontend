import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../../services';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import CommonSearch from '../../../components/CommonSearch';
import { CircularProgress, Table, TableBody, TableCell } from '@mui/material';
import { TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'vehicleNo', header: 'Vehicle Number' },
  { key: 'routeName', header: 'Route Name' },
  { key: 'title', header: 'Title' },
  { key: 'message', header: 'Message' },
  { key: 'actionTaken', header: 'Action Taken' },
];

function EmergencyAlert() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line
  }, [searchQuery, page, limit]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.get(APIURL.EMERGENCY, { search: searchQuery, page: page + 1, limit });
      console.log(res);
      if (res && res.success && Array.isArray(res.data?.alerts)) {
        setAlerts(
          res.data.alerts.map((item, idx) => ({
            id: item?.id || idx + 1 + page * limit,
            emergencyID: item?.id,
            date: dayjs(item.created_at).format('YYYY-MM-DD'),
            vehicleNo: item?.vehicle_number,
            routeNo: item?.route_number,
            routeName: item?.route_name,
            driverName: item?.driver?.name || '',
            employeeName: item?.employee?.name || '',
            title: item?.title,
            message: item?.message,
            actionTaken: item?.action_taken,
            longitude: item?.longitude,
            latitude: item?.latitude,
          }))
        );
        setTotalCount(
          typeof res.data?.pagination?.total === 'number' ? res.data.pagination.total : res.data.alerts.length
        );
      } else if (res && res.success && Array.isArray(res.data)) {
        setAlerts(
          res.data.map((item, idx) => ({
            id: item?.id || idx + 1 + page * limit,
            emergencyID: item?.id,
            date: dayjs(item.created_at).format('YYYY-MM-DD'),
            vehicleNo: item?.vehicle_number,
            routeNo: item?.route_number,
            routeName: item?.route_name,
            driverName: item?.driver?.name || '',
            employeeName: item?.employee?.name || '',
            title: item?.title,
            message: item?.message,
            actionTaken: item?.action_taken,
            longitude: item?.longitude,
            latitude: item?.latitude,
          }))
        );
        setTotalCount(res.data.length);
      } else {
        setAlerts([]);
        setTotalCount(0);
      }
    } catch {
      setAlerts([]);
      setTotalCount(0);
      alert('Failed to fetch Emergency Alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = orderBy
    ? [...alerts].sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];
        if (typeof valueA === 'string' && typeof valueB === 'string')
          return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        if (typeof valueA === 'number' && typeof valueB === 'number')
          return order === 'asc' ? valueA - valueB : valueB - valueA;
        return 0;
      })
    : alerts;

  const paginatedData = sortedData;

  const handleEdit = (row) => {
    navigate('/management/emergency-alert/edit', { state: row });
  };

  const handleDelete = async (emergencyID) => {
    if (!window.confirm('Are you sure you want to delete this Alert?')) return;
    try {
      const response = await ApiService.delete(`${APIURL.EMERGENCY}/${emergencyID}`);
      if (response && response.success) {
        alert('Alert deleted successfully!');
        if (paginatedData.length === 1 && page > 0) setPage(page - 1);
        else fetchAlerts();
      } else {
        alert('Failed to delete alert.');
      }
    } catch {
      alert('An error occurred while deleting.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Emergency Alerts</h1>
        <div className='flex gap-x-4'>
          <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      </div>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <CircularProgress />
          </div>
        ) : (
          <>
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
                          <div className='flex justify-center gap-2'>
                            <button
                              className='bg-[#00c0ef] p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                              onClick={() => {
                                if (row?.latitude && row?.longitude) {
                                  const gmapUrl = `https://www.google.com/maps?q=${row?.latitude},${row?.longitude}`;
                                  window.open(gmapUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  alert('Location not available');
                                }
                              }}>
                              <FmdGoodIcon fontSize='10px' />
                            </button>
                            <button
                              className='bg-green-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                              onClick={() => handleEdit(row)}>
                              <EditIcon fontSize='10px' />
                            </button>
                            <button
                              className='bg-red-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                              onClick={() => handleDelete(row.emergencyID)}>
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
            <TablePagination
              rowsPerPageOptions={[10, 15, 20, 25, 30]}
              component='div'
              count={totalCount}
              rowsPerPage={limit}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default EmergencyAlert;
