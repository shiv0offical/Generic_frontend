import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterOptions from './components/FilterOption';
import { ApiService } from '../../../services';
import { APIURL } from '../../../constants';
import dayjs from 'dayjs';
import IModal from '../../../components/modal/Modal';
import CommonSearch from '../../../components/CommonSearch';

function Employee() {
  const companyID = localStorage.getItem('company_id');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [filterData, setFilterData] = useState({
    company_id: companyID,
    fromDate: '',
    toDate: '',
    department: '',
  });

  const [empData, setEmpData] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchQuery, setSearchQuery] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleStatusClick = (emp) => {
    setSelectedEmp(emp);
    setIsStatusModalOpen(true);
  };

  const formatEmp = (info) => {
    return info?.map((data, idx) => {
      const formattedDojDate = data.date_of_joining ? dayjs(data.date_of_joining).format('YYYY-MM-DD') : '';

      const formattedDobDate = data.date_of_birth ? dayjs(data.date_of_birth).format('YYYY-MM-DD') : '';
      return {
        id: idx + 1,
        actual_id: data.id,
        email: data.email,
        punchId: data.punch_id,
        employeeName: `${data.first_name} ${data.last_name}`,
        employee_id: data.employee_id,
        plant: data.plant?.plant_name,
        plantId: data.plant_id,
        department: data.department?.department_name || '',
        departmentId: data.department_id,
        doj: formattedDojDate,
        dob: formattedDobDate,
        gender: data.gender?.gender_name,
        mobileNumber: data.phone_number,
        routeId: data.vehicle_route_id,
        routeName: data.vehicleRoute?.name,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        routeNumber: data.vehicleRoute?.route_number,
        boardingTime: '10:00 AM',
        status: data.status,
      };
    });
  };

  const columns = [
    {
      key: 'srNo',
      header: 'Sr No',
      render: (_row, _index) => _index + 1,
    },
    { key: 'employeeName', header: 'Employee Name' },
    { key: 'employee_id', header: 'Employee ID' },
    {
      key: 'plant',
      header: 'Plant',
      render: (row) => {
        return row?.plant || '-';
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row?.department || '-',
    },
    {
      key: 'date_of_joining',
      header: 'DOJ',
      render: (row) => row?.doj || '-',
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (row) => row?.gender || '-',
    },
    {
      key: 'mobileNumber',
      header: 'Mobile Number',
      render: (row) => row?.mobileNumber || '-',
    },
    {
      key: 'routeName',
      header: 'Route Name',
      render: (row) => row?.routeName || '-',
    },
    {
      key: 'routeNumber',
      header: 'Route Number',
      render: (row) => row?.routeNumber || '-',
    },
    { key: 'boardingTime', header: 'Boarding Time' },
    {
      key: 'status_id',
      header: 'Status',
      render: (row) => {
        return (
          <button
            onClick={() => handleStatusClick(row)}
            className={`text-white px-2 py-1 rounded text-sm ${
              row.status === 'active' ? 'bg-green-600' : 'bg-red-600'
            }`}>
            {row.status}
          </button>
        );
      },
    },
  ];

  const departmentOption = Array.from(
    new Map(empData.map((item) => [item.department_id, { label: item.department, value: item.department_id }])).values()
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await ApiService.get(APIURL.EMPLOYEE, {
      page: page,
      limit: rowsPerPage,
      search: searchQuery,
    });

    if (res?.success) {
      const formatData = formatEmp(res.data.employes);
      setEmpData(formatData);
      setSearchQuery(formatData);
    }
  };

  const handleSearch = (value) => {
    const search = value.toLowerCase().trim();

    if (!search) {
      setSearchQuery(empData);
      return;
    }

    const filtered = empData.filter((emp) => emp.employeeName.toLowerCase().includes(search));

    // console.log("🚀 ~ handleSearch ~ filtered:", filtered);
    setSearchQuery(filtered);
  };

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...searchQuery].sort((a, b) => {
    // const sortedData = [...empData].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleView = (row) => {
    navigate('/master/employee/view', {
      state: { mode: 'view', rowData: row },
    });
  };

  const handleEdit = (row) => {
    navigate('/master/employee/edit', {
      state: { mode: 'edit', rowData: row },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Employee ?')) return;

    try {
      const response = await ApiService.delete(`${APIURL.EMPLOYEE}/${id}`);
      if (response.success) {
        alert('Employee deleted successfully!');
        fetchData();
      } else {
        console.error(response.message);
        alert('Failed to delete Employee ');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  const handleClickFilter = async () => {
    console.log('filter', filterData);
    const Filters = {
      company_id: filterData.company_id,
      department_id: filterData.department,
      from_date: filterData.fromDate,
      to_date: filterData.toDate,
    };

    try {
      const res = await ApiService.get(APIURL.EMPLOYEE, Filters);

      if (res?.success) {
        const formatData = formatEmp(res.data);
        setEmpData(formatData);
      } else {
        console.error('Failed to fetch Employee data:', res.message || 'Unknown error');
        alert(res.message || 'Failed to fetch Employee data');
      }
    } catch (error) {
      console.error('Error fetching Employee:', error);
    }
  };

  const handleFormReset = () => {
    setFilterData({
      fromDate: '',
      toDate: '',
      department: '',
    });
    fetchData();
    // setFilteredEmployees(employees);
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
      const res = await ApiService.postFormData(`${APIURL.EMPLOYEE}/bulk`, formData, { company_id: companyID });

      if (res.success) {
        console.log('🚀 ~ EmployeeForm.jsx:165 ~ handleFormSubmit ~ res:', res);
        alert(res.message);

        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        fetchData();
      } else {
        alert(res.message || 'Something went wrong.');
        console.error(response.message);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Something went wrong while uploading.');
    }
  };

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleStatusChange = async () => {
    if (!selectedEmp) return;

    const newStatusId = selectedEmp.status === 'Active' ? 2 : 1;

    try {
      const res = await ApiService.put(`${APIURL.EMPLOYEE}/${selectedEmp.actual_id}?company_id=${companyID}`, {
        status_id: newStatusId,
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
      alert('An error occurred while updating status.');
    }
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Employee</h1>
      </div>

      {isStatusModalOpen && selectedEmp && (
        <IModal toggleModal={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Employee Status</h2>
            <p className='mb-6'>
              Are you sure you want to change status of <strong>{selectedEmp.employeeName}</strong> from{' '}
              <strong>{selectedEmp.status}</strong> to{' '}
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
        // filterData={empData}
        fileInputRef={fileInputRef}
        filterData={filterData}
        handleFormReset={handleFormReset}
        handleFileUpload={handleFileUpload}
        setFile={setFile}
        file={file}
        handleExport={handleExport}
        departments={departmentOption}
      />
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <CommonSearch onChange={(e) => handleSearch(e.target.value)} />
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
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    {columns.map((column) => (
                      <TableCell className='whitespace-nowrap' key={column.key}>
                        {column.render ? column.render(row, index) : row[column.key]}
                      </TableCell>
                    ))}
                    <TableCell key={row.id}>
                      <div className='flex flex-nowrap justify-center gap-2'>
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
          count={empData.length}
          // count={filteredEmployees.length}
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
}

export default Employee;
