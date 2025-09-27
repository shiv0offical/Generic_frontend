import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import IModal from '../../../components/modal/Modal';
import FilterOptions from './components/FilterOption';
import CommonSearch from '../../../components/CommonSearch';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { CircularProgress, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { TableContainer, TableHead, TablePagination, TableSortLabel } from '@mui/material';
import { changeDriverStatus, deleteDriver, fetchDrivers } from '../../../redux/driverSlice';
import { ApiService } from '../../../services';
import { APIURL } from '../../../constants';

const columns = [
  { key: 'id', header: 'Sr No' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverEmail', header: 'Driver Email' },
  { key: 'phoneNumber', header: 'Phone Number' },
  { key: 'dateOfBirth', header: 'Date of Birth' },
  { key: 'address', header: 'Address' },
  { key: 'punchId', header: 'Punch ID' },
  { key: 'drivingLicenceNo', header: 'Driving Licence No' },
  { key: 'drivingLicenceIssueDate', header: 'Licence Issue Date' },
  { key: 'drivingLicenceExpiryDate', header: 'Licence Expiry Date' },
  { key: 'latitude', header: 'Latitude' },
  { key: 'longitude', header: 'Longitude' },
  { key: 'createdAt', header: 'Created At' },
  {
    key: 'status',
    header: 'Status',
    render: (value, row, handleStatusClick) => (
      <button
        onClick={() => handleStatusClick(row)}
        className={`text-white px-2 py-1 rounded text-sm ${value === 1 ? 'bg-green-600' : 'bg-red-600'}`}>
        {value === 1 ? 'Active' : 'Inactive'}
      </button>
    ),
  },
];

const handleSample = () => {
  const sampleFields = [
    { key: 'first_name', header: 'First Name' },
    { key: 'last_name', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone_number', header: 'Phone Number' },
    { key: 'date_of_birth', header: 'Date of Birth' },
    { key: 'address', header: 'Address' },
    { key: 'punch_id', header: 'Punch ID' },
    { key: 'driving_licence', header: 'Driving Licence No' },
    { key: 'driving_licence_issue_date', header: 'Licence Issue Date' },
    { key: 'driving_licence_expire_date', header: 'Licence Expiry Date' },
    { key: 'latitude', header: 'Latitude' },
    { key: 'longitude', header: 'Longitude' },
  ];

  const headers = sampleFields.map((field) => field.header);
  const emptyRow = sampleFields.reduce((acc, field) => {
    acc[field.header] = '';
    return acc;
  }, {});

  const worksheet = XLSX.utils.json_to_sheet([emptyRow], { header: headers });
  worksheet['!cols'] = sampleFields.map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SampleDriver');
  XLSX.writeFile(workbook, 'driver_sample.xlsx');
};

const formatDate = (date) => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

const formatDriver = (info) =>
  info?.map((data, idx) => ({
    id: idx + 1,
    driverName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    driverEmail: data.email || '',
    status: data.active,
    punchId: data.punch_id || '',
    phoneNumber: data.phone_number || '',
    createdAt: formatDate(data.created_at),
    actual_id: data.id,
    dateOfBirth: formatDate(data.date_of_birth),
    drivingLicenceNo: data.driving_licence || '',
    drivingLicenceIssueDate: formatDate(data.driving_licence_issue_date),
    drivingLicenceExpiryDate: formatDate(data.driving_licence_expire_date),
    address: data.address || '',
    latitude: data.latitude !== null && data.latitude !== undefined ? data.latitude : '',
    longitude: data.longitude !== null && data.longitude !== undefined ? data.longitude : '',
  }));

const Driver = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drivers, pagination, loading } = useSelector((state) => state.driver);

  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterData, setFilterData] = useState({ fromDate: '', toDate: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const totalCount = pagination?.total || 0;

  const fetchData = (pageNumber = page + 1, limit = rowsPerPage, filters = filterData, search = searchTerm) => {
    dispatch(fetchDrivers({ page: pageNumber, limit, search, from_date: filters?.fromDate, to_date: filters?.toDate }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, rowsPerPage, searchTerm]);

  const driverValue = useMemo(() => formatDriver(drivers), [drivers]);

  const handleSort = (columnKey) => {
    setOrder((prev) => (orderBy === columnKey && prev === 'asc' ? 'desc' : 'asc'));
    setOrderBy(columnKey);
  };

  const sortedData = useMemo(() => {
    if (!orderBy) return driverValue;
    return [...driverValue].sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return order === 'asc' ? -1 : 1;
      if (valueB == null) return order === 'asc' ? 1 : -1;
      if (typeof valueA === 'string')
        return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [driverValue, order, orderBy]);

  const handleView = (row) => navigate('/master/driver/create', { state: row, action: 'VIEW' });
  const handleEdit = (row) => navigate('/master/driver/create', { state: row, action: 'EDIT' });

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this Driver ?')) return;
    dispatch(deleteDriver(id))
      .unwrap()
      .then((msg) => {
        toast.success(msg || 'Driver deleted successfully!', { position: 'top-right' });
        fetchData(1, rowsPerPage);
      })
      .catch((err) => {
        toast.error(err || 'Failed to delete driver', { position: 'top-right' });
      });
  };

  const handleStatusClick = (driver) => {
    setSelectedDriver(driver);
    setIsStatusModalOpen(true);
  };

  const handleClickFilter = () => {
    setPage(0);
    fetchData(1, rowsPerPage, filterData, searchTerm);
  };

  const handleFormReset = () => {
    const resetFilter = { fromDate: '', toDate: '' };
    setFilterData(resetFilter);
    setPage(0);
    fetchData(1, rowsPerPage, resetFilter, searchTerm);
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
      const res = await ApiService.postFormData(`${APIURL.UPLOAD}?folder=driver`, formData);
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
      const result = await dispatch(
        fetchDrivers({
          page: 1,
          limit: totalCount,
          search: searchTerm,
          from_date: filterData?.fromDate,
          to_date: filterData?.toDate,
        })
      ).unwrap();

      const exportDrivers = result?.data || result?.drivers || [];

      const exportDriverRows = formatDriver(exportDrivers);

      const exportData = exportDriverRows.map((row) => {
        const rowData = {};
        columns.forEach((col) => {
          if (col.key === 'status') {
            rowData[col.header] = row.status === 1 ? 'Active' : 'Inactive';
          } else {
            rowData[col.header] = row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '';
          }
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData, { header: columns.map((col) => col.header) });
      worksheet['!cols'] = columns.map((col) => {
        switch (col.key) {
          case 'id':
            return { wch: 8 };
          case 'driverName':
            return { wch: 25 };
          case 'driverEmail':
            return { wch: 30 };
          case 'phoneNumber':
            return { wch: 15 };
          case 'dateOfBirth':
            return { wch: 15 };
          case 'address':
            return { wch: 20 };
          case 'punchId':
            return { wch: 12 };
          case 'drivingLicenceNo':
            return { wch: 18 };
          case 'drivingLicenceIssueDate':
            return { wch: 18 };
          case 'drivingLicenceExpiryDate':
            return { wch: 18 };
          case 'latitude':
            return { wch: 12 };
          case 'longitude':
            return { wch: 12 };
          case 'createdAt':
            return { wch: 18 };
          case 'status':
            return { wch: 12 };
          default:
            return { wch: 15 };
        }
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Drivers');
      XLSX.writeFile(workbook, 'drivers.xlsx');
    } catch (err) {
      toast.error('Failed to export drivers', { position: 'top-right' });
    }
  };

  const handleStatusChange = () => {
    if (!selectedDriver) return;
    const newStatusId = selectedDriver.status === 1 ? 2 : 1;
    dispatch(changeDriverStatus({ id: selectedDriver.actual_id, newStatusId }))
      .unwrap()
      .then((msg) => {
        toast.success(msg, { position: 'top-right' });
        setIsStatusModalOpen(false);
        setSelectedDriver(null);
        fetchData(1, rowsPerPage);
      })
      .catch((err) => {
        toast.error(err || 'Failed to update status', { position: 'top-right' });
      });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold text-[#07163d]'>Driver (Total: {totalCount})</h1>
        <CommonSearch searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
      </div>
      {isStatusModalOpen && selectedDriver && (
        <IModal toggleModal={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Driver Status</h2>
            <p className='mb-6'>
              Are you sure you want to change status of <strong>{selectedDriver.driverName}</strong> from{' '}
              <strong>{selectedDriver.status === 1 ? 'Active' : 'Inactive'}</strong> to{' '}
              <strong>{selectedDriver.status === 2 ? 'Active' : 'Inactive'}</strong>?
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
        <TableContainer sx={{ maxHeight: 720, overflowX: 'auto', position: 'relative' }}>
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
                    <CircularProgress size={24} />
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
                    {columns.map((column) => (
                      <TableCell className='whitespace-nowrap' key={column.key}>
                        {column.render
                          ? column.render(row[column.key], row, handleStatusClick)
                          : row[column.key] !== null && row[column.key] !== undefined
                          ? row[column.key]
                          : ''}
                      </TableCell>
                    ))}
                    <TableCell>
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
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
};

export default Driver;
