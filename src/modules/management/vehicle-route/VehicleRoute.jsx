import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import CommonSearch from '../../../components/CommonSearch';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { setVehicleRoute } from '../../../redux/vehicleRouteSlice';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, CircularProgress } from '@mui/material';

const shifts = [
  { id: '2f7d76b8-87a9-4dc1-822a-a39e99b314e9', name: 'Night' },
  { id: '1b0b7594-c88c-470b-a956-f8f79918fd36', name: 'Day' },
];

const getShiftName = (shiftId) => {
  const found = shifts.find((s) => s.id === shiftId);
  return found ? found.name : '-';
};

const columns = [
  { key: 'busNumber', header: 'Vehicle Number' },
  { key: 'routeName', header: 'Route Name' },
  { key: 'busDriver', header: 'Vehicle Driver' },
  { key: 'shift', header: 'Shift' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Created At' },
];

const VehicleRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { vehicleRoutes, loading, error } = useSelector((state) => state.vehicleRoute);
  const totalCount = vehicleRoutes?.pagination?.total || 0;

  useEffect(() => {
    ApiService.get(APIURL.VEHICLE_ROUTE, { search: searchQuery, page: page + 1, limit }).then(
      (res) => res.success && dispatch(setVehicleRoute(res.data))
    );
  }, [dispatch, searchQuery, page, limit]);

  const processedData =
    vehicleRoutes?.routes?.map((item, i) => {
      const shiftId = Array.isArray(item.stops) && item.stops.length > 0 ? item.stops[0].shift_id : '-';
      return {
        id: page * limit + i + 1,
        routeID: item.id,
        busNumber: item.vehicle?.vehicle_number || item.vehicle?.vehicle_name || '-',
        vehicleID: item.vehicle_id,
        routeName: item.name,
        shiftId: shiftId,
        shift: getShiftName(shiftId),
        routeStops: item.routes,
        busDriver: item.vehicle?.driver
          ? `${item.vehicle.driver.first_name ?? ''} ${item.vehicle.driver.last_name ?? ''}`.trim() || '-'
          : '-',
        status: typeof item.status === 'string' ? item.status : item.active === 1 ? 'Active' : 'Inactive',
        createdAt: item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD') : '-',
        row: item,
      };
    }) || [];

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = orderBy
    ? [...processedData].sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];
        if (typeof valueA === 'string')
          return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        return order === 'asc' ? valueA - valueB : valueB - valueA;
      })
    : processedData;

  const handleView = (row) =>
    navigate('/management/vehicle-route/view', { state: { mode: 'view', rowData: row.row || row } });
  const handleEdit = (row) =>
    navigate('/management/vehicle-route/edit', { state: { mode: 'edit', rowData: row.row || row } });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Vehicle Route ?')) return;
    try {
      const response = await ApiService.delete(`${APIURL.VEHICLE_ROUTE}/${id}`);
      alert(response.message || (response.success ? 'Deleted' : 'Failed to delete Vehicle Route'));
      if (response.success) {
        const res = await ApiService.get(APIURL.VEHICLE_ROUTE, { search: searchQuery, page: page + 1, limit });
        if (res.success) dispatch(setVehicleRoute(res.data));
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Vehicle Route (Total: {totalCount})</h1>
        <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        {error && <div className='text-red-700'>Error: {error}</div>}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center'>
                    <CircularProgress size={28} className='my-4' />
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
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
                    <TableCell>
                      <div className='flex justify-center gap-3 text-white'>
                        <button
                          className='bg-blue-400 py-1.5 p-2 rounded-md cursor-pointer'
                          onClick={() => handleView(row)}>
                          <RemoveRedEyeIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-green-400 py-1.5 p-2 rounded-md cursor-pointer'
                          onClick={() => handleEdit(row)}>
                          <EditIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-red-400 py-1.5 p-2 rounded-md cursor-pointer'
                          onClick={() => handleDelete(row.routeID)}>
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
};

export default VehicleRoute;
