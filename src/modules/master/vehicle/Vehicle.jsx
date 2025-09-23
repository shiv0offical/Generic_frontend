import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IModal from '../../../components/modal/Modal';
import { Link, useNavigate } from 'react-router-dom';
import FilterOptions from './components/FilterOption';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { useDispatch, useSelector } from 'react-redux';
import CommonSearch from '../../../components/CommonSearch';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { CircularProgress, Table, TableBody, TableCell } from '@mui/material';
import { changeVehicleStatus, deleteVehicle, fetchVehicles } from '../../../redux/vehiclesSlice';
import { TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const vehicleSampleFields = [
  { key: 'vehicle_name', header: 'Vehicle Name' },
  { key: 'vehicle_number', header: 'Vehicle Number' },
  { key: 'sim_number', header: 'SIM Number' },
  { key: 'imei_number', header: 'IMEI Number' },
  { key: 'speed_limit', header: 'Speed Limit' },
  { key: 'seats', header: 'Seat Count' },
];

const handleSample = () => {
  const headers = vehicleSampleFields.map((f) => f.header);
  const values = vehicleSampleFields.map(() => '');

  const csv = [headers, values]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'vehicle_sample.csv',
  });
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const Vehicle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({ fromDate: '', toDate: '' });

  const { vehicles, pagination, loading } = useSelector((state) => state.vehicles);

  const formatVehicle = (info) => {
    return (
      info?.map((data, idx) => {
        const formattedDate = data.created_at ? dayjs(data.created_at).format('YYYY-MM-DD') : '-';
        const driverFirstName = data.driver?.first_name || '';
        const driverLastName = data.driver?.last_name || '';
        const driverName = driverFirstName || driverLastName ? `${driverFirstName} ${driverLastName}`.trim() : '-';
        return {
          slNo: idx + 1,
          id: data.id,
          vehicleName: data.vehicle_name,
          vehicleNumber: data.vehicle_number,
          simNumber: data.sim_number,
          imeiNumber: data.imei_number,
          speedLimit: data.speed_limit,
          seatCount: data.seats,
          createdAt: formattedDate,
          driverName: driverName,
          driverEmail: data.driver?.email || '-',
          driverPhoneNumber: data.driver?.phone_number || '-',
          routeNumber:
            Array.isArray(data.routes) && data.routes.length > 0 && data.routes[0]?.route_number
              ? data.routes[0].route_number
              : '-',
          routeName:
            Array.isArray(data.routes) && data.routes.length > 0 && data.routes[0]?.route_name
              ? data.routes[0].route_name
              : '-',
          status: data.vehicle_status_id === 1 ? 'Active' : 'Inactive',
          actual_id: data.id,
        };
      }) || []
    );
  };

  const getVehicleslist = (pageNumber, limit, filters, search) => {
    dispatch(fetchVehicles({ page: pageNumber, limit, fromDate: filters.fromDate, toDate: filters.toDate, search }));
  };

  useEffect(() => {
    getVehicleslist(page + 1, rowsPerPage, filterData, searchQuery);
    // eslint-disable-next-line
  }, [page, rowsPerPage, filterData, searchQuery]);

  const vehicleData = formatVehicle(vehicles);
  const totalCount = pagination?.total || 0;

  const columns = [
    { key: 'slNo', header: 'Sl No' },
    { key: 'vehicleName', header: 'Vehicle Name' },
    { key: 'vehicleNumber', header: 'Vehicle Number' },
    { key: 'simNumber', header: 'SIM Number' },
    { key: 'imeiNumber', header: 'IMEI Number' },
    { key: 'speedLimit', header: 'Speed Limit' },
    { key: 'seatCount', header: 'Seat Count' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'driverName', header: 'Driver Name' },
    { key: 'driverEmail', header: 'Driver Email' },
    { key: 'driverPhoneNumber', header: 'Driver Phone Number' },
    { key: 'routeNumber', header: 'Route Number' },
    { key: 'routeName', header: 'Route Name' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleStatusClick(row)}
          className={`text-white px-2 py-1 rounded text-sm ${row.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`}>
          {row.status}
        </button>
      ),
    },
  ];

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...vehicleData].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string' && typeof valueB === 'string')
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    return order === 'asc' ? (valueA ?? 0) - (valueB ?? 0) : (valueB ?? 0) - (valueA ?? 0);
  });

  const handleView = (row) => navigate('/master/vehicle/view', { state: { ...row, action: 'VIEW' } });
  const handleEdit = (row) => navigate('/master/vehicle/edit', { state: { ...row, action: 'EDIT' } });

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this Vehicle?')) return;
    dispatch(deleteVehicle(id))
      .unwrap()
      .then(() => {
        toast.success('Vehicle deleted successfully!', { position: 'top-right' });
        dispatch(
          fetchVehicles({
            page: page + 1,
            limit: rowsPerPage,
            fromDate: filterData.fromDate,
            toDate: filterData.toDate,
            search: searchQuery,
          })
        );
      })
      .catch((err) => {
        toast.error(err || 'Failed to delete vehicle.', { position: 'top-right' });
      });
  };

  const handleStatusClick = (row) => {
    setSelectedVehicle(row);
    setIsStatusModalOpen(true);
  };

  const handleClickFilter = () => {
    setPage(0);
    getVehicleslist(1, rowsPerPage, filterData, searchQuery);
  };

  const handleFormReset = () => {
    const resetFilter = { fromDate: '', toDate: '' };
    setFilterData(resetFilter);
    setPage(0);
    getVehicleslist(1, rowsPerPage, resetFilter, searchQuery);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await ApiService.postFormData(`${APIURL.UPLOAD}?folder=vehicle`, formData);
      if (res.success) {
        alert(res.message);
        if (fileInputRef.current) fileInputRef.current.value = null;
        fetchData();
      } else {
        alert(res.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed.');
    }
  };

  const handleExport = async () => {
    try {
      const res = await dispatch(
        fetchVehicles({
          page: 1,
          limit: totalCount || 1000,
          fromDate: filterData.fromDate,
          toDate: filterData.toDate,
          search: searchQuery,
        })
      ).unwrap();
      const fullData = formatVehicle(res?.vehicles || []);

      if (!fullData?.length) return toast.warning('No data available to export.', { position: 'top-right' });

      const cols = columns;
      const headers = cols.map((c) => c.header);

      const rows = fullData?.map((row, i) =>
        cols.map((col) => {
          if (col.key === 'slNo') return i + 1;
          if (col.key === 'status') return row.status;
          if (typeof row[col.key] === 'boolean') return row[col.key] ? 'Yes' : 'No';
          return row[col.key] ?? '';
        })
      );

      const csv = [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'vehicles.csv',
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to export vehicles.', { position: 'top-right' });
    }
  };

  const handleStatusChange = () => {
    if (!selectedVehicle) return;

    const newStatusId = selectedVehicle.status === 'Active' ? 2 : 1;

    dispatch(changeVehicleStatus({ id: selectedVehicle.actual_id, newStatusId }))
      .unwrap()
      .then((res) => {
        setIsStatusModalOpen(false);
        setSelectedVehicle(null);
        toast.success('Vehicle updated successfully', { position: 'top-right' });
        dispatch(
          fetchVehicles({
            page: 1,
            limit: rowsPerPage,
            fromDate: filterData.fromDate,
            toDate: filterData.toDate,
            search: searchQuery,
          })
        );
      })
      .catch((err) => {
        toast.error(err || 'Failed to update status', { position: 'top-right' });
      });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehicles</h1>
        <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {isStatusModalOpen && selectedVehicle && (
        <IModal toggleModal={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Vehicle Status</h2>
            <p className='mb-6'>
              Are you sure you want to change status of <strong>{selectedVehicle.vehicleName}</strong> from{' '}
              <strong>{selectedVehicle.status}</strong> to{' '}
              <strong>{selectedVehicle.status === 'Active' ? 'Inactive' : 'Active'}</strong>?
            </p>
            <div className='flex justify-end gap-3'>
              <button
                className='px-4 py-2 rounded bg-gray-300 text-[#07163d] hover:bg-gray-400'
                onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </button>
              <button
                className='px-4 py-2 rounded bg-[#07163d] text-white hover:bg-[#0a1a4a]'
                onClick={handleStatusChange}>
                Confirm
              </button>
            </div>
          </div>
        </IModal>
      )}
      <FilterOptions
        handleClickFilter={handleClickFilter}
        setFilterData={setFilterData}
        filterData={filterData}
        handleFormReset={handleFormReset}
        handleFileUpload={handleFileUpload}
        setFile={setFile}
        file={file}
        handleExport={handleExport}
        handleSample={handleSample}
      />
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
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
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center'>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : vehicleData.length > 0 ? (
                sortedData.map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    {columns.map((column) => (
                      <TableCell className='whitespace-nowrap' key={column.key}>
                        {column.render ? column.render(row, index) : row[column.key]}
                      </TableCell>
                    ))}
                    <TableCell key={row.id}>
                      <div className='flex flex-nowrap justify-center gap-1'>
                        <button
                          className='bg-blue-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleView(row)}>
                          <RemoveRedEyeIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-green-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleEdit(row)}>
                          <EditIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-red-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleDelete(row.actual_id)}>
                          <DeleteIcon fontSize='10px' />
                        </button>
                        <Link to={'/live-tracking/' + row.id}>
                          <button className='bg-[#00c0ef] p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'>
                            <FmdGoodIcon fontSize='10px' />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center'>
                    No Data Found
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
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
};

export default Vehicle;
