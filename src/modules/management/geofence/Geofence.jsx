import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import EditIcon from '@mui/icons-material/Edit';
import { CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CommonSearch from '../../../components/CommonSearch';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { fetchVehicleGeoFence } from '../../../redux/geofenceSlice';
import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const columns = [
  { key: 'busName', header: 'Bus Name' },
  { key: 'geofenceName', header: 'Geofence Name' },
  { key: 'geofenceType', header: 'Geofence Type' },
  { key: 'createdAt', header: 'Created At' },
];

function Geofence() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { vehicleGeoFence, loading, error } = useSelector((state) => state.geofence);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.get(APIURL.VEHICLE);
        setVehicles(res?.success && Array.isArray(res.data?.vehicles) ? res.data?.vehicles : []);
        dispatch(fetchVehicleGeoFence({ search: searchQuery, page: page + 1 || 1, limit }));
      } catch (error) {
        dispatch({ type: 'geofence/fetchVehicleGeoFence/rejected', payload: error.message });
      }
    })();
  }, [dispatch, searchQuery, page, limit]);

  const processedGeoFenceData =
    vehicleGeoFence?.map((d, i) => {
      const v = d.vehicle || vehicles.find((v) => v.id === d.vehicle_id);
      return {
        id: i + 1,
        geofenceID: d.id,
        vehicleID: d.vehicle_id,
        typeID: d.type,
        busName: v?.vehicle_name || v?.vehicle_number || '-',
        geofenceName: d.geofence_name,
        geofenceType: d.type || '-',
        coordinates: d.coordinates,
        color: d.color,
        location: d.location,
        createdAt: dayjs(d.created_at).format('YYYY-MM-DD'),
      };
    }) || [];

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...processedGeoFenceData].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string')
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const paginatedData = sortedData.slice(page * limit, page * limit + limit);

  const handleView = (row) => {
    navigate(`/management/geofence/view`, { state: { mode: 'view', rowData: row } });
  };

  const handleEdit = (row) => {
    navigate('/management/geofence/edit', { state: { mode: 'edit', rowData: row } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Geo Fence ?')) return;

    try {
      const response = await ApiService.delete(`${APIURL.GEOFENCE}/${id}`);
      if (response.success) {
        alert(response.message);
        dispatch(fetchVehicleGeoFence());
      } else {
        console.error(response.message);
        alert('Failed to delete Geo Fence');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Geofence</h1>

        <div className='flex gap-x-4'>
          <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Link to='/management/geofence/create'>
            <button className='bg-[#07163d] text-white px-3 py-2 rounded-[3px] cursor-pointer'>Add Bus Geofence</button>
          </Link>
        </div>
      </div>

      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        {error && <div className='text-red-700'>Error: {error}</div>}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center'>
                    <CircularProgress size={28} className='my-4' />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
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
                          onClick={() => handleDelete(row.geofenceID)}>
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
          count={processedGeoFenceData.length}
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

export default Geofence;
