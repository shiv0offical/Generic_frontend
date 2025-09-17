import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import FilterOptions from './components/FilterOption';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import IModal from '../../../components/modal/Modal';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { changeVehicleStatus, deleteVehicle, fetchVehicles } from '../../../redux/vehiclesSlice';

const Vehicle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicles, pagination, loading } = useSelector((state) => state.vehicles);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
  });
  const [file, setFile] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const formatVehicle = (info) => {
    return info?.map((data, idx) => {
      const formattedDate = dayjs(data.created_at).format('YYYY-MM-DD');
      const formattedUpdate = dayjs(data.updated_at).format('YYYY-MM-DD');
      return {
        id: idx + 1,
        busNumber: data.vehicle_number,
        simNumber: data.sim_number,
        imeiNumber: data.imei_number,
        routeNumber: data?.routes?.route_number || '-',
        routeName: data?.routes?.route_name || '-',
        dirverID: data?.driver?.id,
        drivername: data?.driver?.first_name ? `${data?.driver?.first_name} ${data?.driver?.last_name}` : '-',
        contactNumber: data?.driver?.phone_number ? `${data.driver?.phone_number}` : '-',
        speedLimit: data.speed_limit,
        seatCount: data.seats,
        busName: data.vehicle_name,
        status: data.status || (data.vehicle_status_id === 1 ? 'Active' : 'Inactive'),
        createdAt: formattedDate,
        actual_id: data.id,
        updatedOn: formattedUpdate,
      };
    });
  };

  const getVehicleslist = (pageNumber = page + 1, limit = rowsPerPage, filters = filterData) => {
    dispatch(
      fetchVehicles({
        page: pageNumber,
        limit,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      })
    );
  };

  useEffect(() => {
    getVehicleslist();
  }, [page, rowsPerPage]);

  const vehilceData = formatVehicle(vehicles);
  const totalCount = pagination?.total || 0;

  const columns = [
    { key: 'id', header: 'Sl No' },
    { key: 'busNumber', header: 'Bus Number' },
    { key: 'routeNumber', header: 'Route Number' },
    { key: 'routeName', header: 'Route Name' },
    { key: 'drivername', header: 'Driver Name' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'speedLimit', header: 'Speed Limit' },
    { key: 'seatCount', header: 'Seat Count' },
    // { key: "busId", header: "Bus ID" },
    { key: 'busName', header: 'Bus Name' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        return (
          <button
            onClick={() => handleStatusClick(row)}
            className={`text-white px-2 py-1 rounded text-sm ${
              row.status === 'Active' ? 'bg-green-600' : 'bg-red-600'
            }`}>
            {row.status}
          </button>
        );
      },
    },
    { key: 'createdAt', header: 'Scaned At' },
    { key: 'updatedOn', header: 'UpdatedOn' },
  ];

  const handleStatusClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsStatusModalOpen(true);
  };

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...vehilceData].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const handleView = (row) => {
    // navigate("/master/vehicle/view", { state: row, action: "VIEW" });
    navigate('/master/vehicle/view', { state: { ...row, action: 'VIEW' } });
  };

  const handleEdit = (row) => {
    navigate('/master/vehicle/edit', { state: row, action: 'EDIT' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this Vehicle?')) return;

    dispatch(deleteVehicle(id))
      .unwrap()
      .then(() => {
        toast.success('Vehicle deleted successfully!', { position: 'top-right' });
        dispatch(
          fetchVehicles({ page: page, limit: rowsPerPage, fromDate: filterData.fromDate, toDate: filterData.toDate })
        );
      })
      .catch((err) => {
        toast.error(err || 'Failed to delete vehicle.', {
          position: 'top-right',
        });
      });
  };

  const handleClickFilter = () => {
    setPage(0);
    getVehicleslist(1, rowsPerPage, filterData);
  };

  const handleFormReset = () => {
    const resetFilter = { fromDate: '', toDate: '' };
    setFilterData(resetFilter);
    setPage(0);
    getVehicleslist(1, rowsPerPage, resetFilter);
  };

  const handleFileUpload = (event) => {
    // Add your file upload logic here
  };

  const handleExport = async () => {
    try {
      const res = await dispatch(
        fetchVehicles({ page: 1, limit: totalCount, fromDate: filterData.fromDate, toDate: filterData.toDate })
      ).unwrap();
      const fullData = formatVehicle(res?.vehicles || []);

      if (!fullData?.length) return toast.warning('No data available to export.', { position: 'top-right' });

      const cols = columns.filter((c) => c.key !== 'action');
      const headers = cols.map((c) => c.header);

      const rows = fullData?.map((row, i) =>
        cols.map((col) => (col.key === 'srNo' ? i + 1 : col.key === 'status' ? row.status : row[col.key] ?? ''))
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
        dispatch(getVehicleslist({ page: 1, limit: rowsPerPage }));
      })
      .catch((err) => {
        toast.error(err || 'Failed to update status', { position: 'top-right' });
      });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehicles</h1>
      </div>

      {isStatusModalOpen && selectedVehicle && (
        <IModal toggleModal={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Employee Status</h2>
            <p className='mb-6'>
              Are you sure you want to change status of <strong>{selectedVehicle.busName}</strong> from{' '}
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
              ) : vehilceData.length > 0 ? (
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
                        {/* <Link to={"/playback/" + row.id}>
                        <button className="bg-[#f39c12] p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center">
                          <PlayCircleIcon fontSize="10px" />
                        </button>
                      </Link> */}
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
