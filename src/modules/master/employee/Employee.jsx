import dayjs from 'dayjs';
import { APIURL } from '../../../constants';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../../services';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import IModal from '../../../components/modal/Modal';
import FilterOptions from './components/FilterOption';
import CommonSearch from '../../../components/CommonSearch';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

function Employee() {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const companyID = localStorage.getItem('company_id');

  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState('asc');
  const [empData, setEmpData] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayData, setDisplayData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({ company_id: companyID, fromDate: '', toDate: '', department: '' });

  const exportHeaders = [
    { key: 'srNo', header: 'Sr No' },
    { key: 'employeeName', header: 'Employee Name' },
    { key: 'employee_id', header: 'Employee ID' },
    { key: 'punch_id', header: 'Punch ID' },
    { key: 'email', header: 'Email' },
    { key: 'phone_number', header: 'Phone Number' },
    { key: 'plant', header: 'Plant' },
    { key: 'department', header: 'Department' },
    { key: 'doj', header: 'Date of Joining' },
    { key: 'dob', header: 'Date of Birth' },
    { key: 'gender', header: 'Gender' },
    { key: 'vehicle_route_id', header: 'Vehicle Route ID' },
    { key: 'address', header: 'Address' },
    { key: 'boarding_latitude', header: 'Boarding Latitude' },
    { key: 'boarding_longitude', header: 'Boarding Longitude' },
    { key: 'boarding_address', header: 'Boarding Address' },
    { key: 'created_at', header: 'Created On' },
    { key: 'status', header: 'Status' },
  ];

  const formatEmp = (info, offset = 0) =>
    info?.map((data, idx) => ({
      id: offset + idx + 1,
      actual_id: data.id,
      employeeName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      employee_id: data.employee_id || '-',
      punch_id: data.punch_id || '-',
      email: data.email || '-',
      phone_number: data.phone_number || '-',
      plant: data.plant?.plant_name || '-',
      plantId: data.plant_id || '-',
      department: data.department?.department_name || '-',
      departmentId: data.department_id || '-',
      doj: data.date_of_joining ? dayjs(data.date_of_joining).format('YYYY-MM-DD') : '-',
      dob: data.date_of_birth ? dayjs(data.date_of_birth).format('YYYY-MM-DD') : '-',
      gender: data.gender ? (typeof data.gender === 'object' ? data.gender.gender_name || '-' : data.gender) : '-',
      vehicle_route_id: data.vehicle_route_id || '-',
      address: data.address || '-',
      boarding_latitude: data.boarding_latitude ? Number(data.boarding_latitude).toFixed(7) : '-',
      boarding_longitude: data.boarding_longitude ? Number(data.boarding_longitude).toFixed(7) : '-',
      boarding_address: data.boarding_address || '-',
      status:
        (data.status || data.active === 1 ? 'Active' : 'Inactive').toString().toLowerCase() === 'active'
          ? 'Active'
          : 'Inactive',
      active: data.active,
      created_at: data.created_at ? dayjs(data.created_at).format('YYYY-MM-DD HH:mm') : '-',
    }));

  const fetchData = async (customPage = page, customRowsPerPage = rowsPerPage, customSearch = searchQuery) => {
    try {
      const apiPage = customPage + 1;
      const params = {
        page: apiPage,
        limit: customRowsPerPage,
        search: customSearch?.trim() || undefined,
        company_id: filterData.company_id,
        department_id: filterData.department,
        from_date: filterData.fromDate,
        to_date: filterData.toDate,
      };
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
      const res = await ApiService.get(APIURL.EMPLOYEE, params);
      if (res?.success) {
        const offset = (apiPage - 1) * customRowsPerPage;
        const formatted = formatEmp(res.data?.employes || [], offset);
        setEmpData(formatted);
        setDisplayData(formatted);
        setTotalCount(res.data?.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Employee?')) return;
    try {
      const res = await ApiService.delete(`${APIURL.EMPLOYEE}/${id}`);
      if (res.success) {
        alert('Employee deleted successfully!');
        fetchData();
      } else {
        alert(res.message || 'Failed to delete Employee');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedEmp) return;
    const newStatus = selectedEmp.status === 'Active' ? 2 : 1;

    try {
      const res = await ApiService.put(`${APIURL.EMPLOYEE}/${selectedEmp.actual_id}?company_id=${companyID}`, {
        status_id: newStatus,
      });
      if (res.success) {
        fetchData();
        setSelectedEmp(null);
        setIsStatusModalOpen(false);
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleClickFilter = async () => {
    try {
      const apiPage = 1;
      const params = {
        company_id: filterData.company_id,
        department_id: filterData.department,
        from_date: filterData.fromDate,
        to_date: filterData.toDate,
        page: apiPage,
        limit: rowsPerPage,
        search: searchQuery?.trim() || undefined,
      };
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
      const res = await ApiService.get(APIURL.EMPLOYEE, params);

      if (res?.success) {
        const offset = 0;
        const formatted = formatEmp(res.data?.employes || [], offset);
        setEmpData(formatted);
        setDisplayData(formatted);
        setTotalCount(res.data?.pagination?.total || 0);
        setPage(0);
      }
    } catch (error) {
      console.error('Error filtering employees:', error);
    }
  };

  const handleFormReset = () => {
    setFilterData({ company_id: companyID, fromDate: '', toDate: '', department: '' });
    setPage(0);
    setSearchQuery('');
    fetchData(0, rowsPerPage, '');
  };

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...displayData].sort((a, b) => {
    if (!orderBy) return 0;
    const valA = a[orderBy] ?? '';
    const valB = b[orderBy] ?? '';
    return typeof valA === 'string'
      ? order === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
      : order === 'asc'
      ? valA - valB
      : valB - valA;
  });

  const paginatedData = sortedData;

  const handleView = (row) => navigate('/master/employee/view', { state: { mode: 'view', rowData: row } });

  const handleEdit = (row) => navigate('/master/employee/edit', { state: { mode: 'edit', rowData: row } });

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await ApiService.postFormData(`${APIURL.UPLOAD}?folder=employee`, formData);
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
      const params = {
        company_id: filterData.company_id,
        department_id: filterData.department,
        from_date: filterData.fromDate,
        to_date: filterData.toDate,
        page: 1,
        limit: totalCount,
        search: searchQuery?.trim() || undefined,
      };
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
      const res = await ApiService.get(APIURL.EMPLOYEE, params);

      const fullData = formatEmp(res?.data?.employes || []);

      if (!fullData?.length) return alert('No data available to export.');

      const cols = exportHeaders;
      const headers = cols.map((c) => c.header);

      const rows = fullData.map((row, i) =>
        cols.map((col) => {
          if (col.key === 'srNo') return i + 1;
          return row[col.key] ?? '';
        })
      );

      const csv = [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'employees.csv',
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export employees:', err);
      alert('Failed to export employees.');
    }
  };

  const handleSample = () => {
    const columns = [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'employee_id', label: 'Employee ID' },
      { key: 'punch_id', label: 'Punch ID' },
      { key: 'email', label: 'Email' },
      { key: 'phone_number', label: 'Phone Number' },
      { key: 'date_of_joining', label: 'Date of Joining (YYYY-MM-DD)' },
      { key: 'date_of_birth', label: 'Date of Birth (YYYY-MM-DD)' },
      { key: 'gender', label: 'Gender (Male/Female/Other)' },
      { key: 'vehicle_route_id', label: 'Vehicle Route ID' },
      { key: 'address', label: 'Address' },
      { key: 'boarding_latitude', label: 'Boarding Latitude' },
      { key: 'boarding_longitude', label: 'Boarding Longitude' },
      { key: 'boarding_address', label: 'Boarding Address' },
    ];
    const keys = columns.map((col) => col.key);
    const labels = columns.map((col) => col.label);
    const row = keys.map(() => '');
    const csv = [labels, row]
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'employee_sample.csv',
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchData(page, rowsPerPage, searchQuery);
    // eslint-disable-next-line
  }, [
    page,
    rowsPerPage,
    searchQuery,
    filterData.company_id,
    filterData.department,
    filterData.fromDate,
    filterData.toDate,
  ]);

  const columns = [
    ...exportHeaders.map((col) => {
      if (col.key === 'status') {
        return {
          ...col,
          render: (row) => (
            <button
              onClick={() => {
                setSelectedEmp(row);
                setIsStatusModalOpen(true);
              }}
              className={`text-white px-2 py-1 rounded text-sm 
                ${row.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`}>
              {row.status}
            </button>
          ),
        };
      }
      if (col.key === 'srNo') return { ...col, render: (_row) => _row.id };
      return col;
    }),
  ];

  const departmentOption = Array.from(
    new Map(empData.map((e) => [e.departmentId, { label: e.department, value: e.departmentId }])).values()
  ).filter((opt) => opt.value);

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold text-[#07163d]'>Employee</h1>
        <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {isStatusModalOpen && selectedEmp && (
        <IModal open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Employee Status</h2>
            <p className='mb-6'>
              Change status of <strong>{selectedEmp.employeeName}</strong> from <strong>{selectedEmp.status}</strong> to{' '}
              <strong>{selectedEmp.status === 'Active' ? 'Inactive' : 'Active'}</strong>?
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
        fileInputRef={fileInputRef}
        setFile={setFile}
        file={file}
        handleExport={handleExport}
        handleSample={handleSample}
        departments={departmentOption}
      />

      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
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
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.render ? col.render(row, index) : row[col.key]}</TableCell>
                    ))}
                    <TableCell>
                      <div className='flex gap-2'>
                        <button
                          className='bg-blue-400 p-2 text-white rounded flex items-center justify-center'
                          onClick={() => handleView(row)}>
                          <RemoveRedEyeIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-green-400 p-2 text-white rounded flex items-center justify-center'
                          onClick={() => handleEdit(row)}>
                          <EditIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-red-400 p-2 text-white rounded flex items-center justify-center'
                          onClick={() => handleDelete(row.actual_id)}>
                          <DeleteIcon fontSize='10px' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center' style={{ padding: '20px' }}>
                    No data found
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
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
}

export default Employee;
