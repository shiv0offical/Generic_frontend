import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiService } from '../../services';
import { APIURL } from '../../constants';

const columns = [
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'punchId', header: 'Punch ID' },
  { key: 'punchTime', header: 'Punch Time' },
];

const data = [
  {
    firstName: 'John',
    lastName: 'Doe',
    punchId: 'P123',
    punchTime: '2022-01-01 09:00:00',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    punchId: 'P456',
    punchTime: '2022-01-01 10:00:00',
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    punchId: 'P789',
    punchTime: '2022-01-01 11:00:00',
  },
];

function EmployeePunchDetails() {
  const location = useLocation();
  const { selectedVehicle } = location.state || {};
  const companyId = localStorage.getItem('company_id');

  console.log(
    '🚀 ~ EmployeePunchDetails.jsx:45 ~ EmployeePunchDetails ~ selectedVehicle:',
    selectedVehicle.vehicle_name
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [punhcData, setPunchData] = useState([]);

  const fetchData = async () => {
    const res = await ApiService.get(APIURL.PUNCHINMULTITRACK, {
      company_id: companyId,
      vehicle_name: selectedVehicle.vehicle_name,
    });

    if (res.success) {
      console.log('🚀 ~ EmployeePunchDetails.jsx:65 ~ fetchData ~ res:', res.data);

      const formatData = res.data.employees.map((item, idx) => {
        console.log('🚀 ~ EmployeePunchDetails.jsx:71 ~ fetchData ~ item:', item);
        return {
          id: idx + 1,
          firstName: item.first_name,
          lastName: item.last_name,
          punchId: item.punch_id,
          punchTime: item.punch_time
            ? new Date(item.punch_time).toLocaleString()
            : item.mssg || 'Punch data not available',
        };
      });
      setPunchData(formatData);
    }
  };
  console.log('🚀 ~ EmployeePunchDetails.jsx:58 ~ EmployeePunchDetails ~ punhcData:', punhcData);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...punhcData].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string')
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <div className='p-4'>
          <h3 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehicle Details</h3>
          <ul className='list-disc list-inside'>
            <li>Vehicle Name:TN87E6249</li>
            <li>Vehicle Number : TN87E6249</li>
            <li>Speed : 0</li>
            <li>Total Onboarded Employee : 0</li>
          </ul>
        </div>
        <div className='flex justify-between items-center p-4'>
          <h2 className='text-2xl font-bold mb-4 text-[#07163d]'>Employee Punch Details</h2>
          <button
            type='button'
            className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
            onClick={handleExport}>
            Export
          </button>
        </div>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell className='whitespace-nowrap' key={column.key}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 15, 20, 25, 30]}
          component='div'
          count={data.length}
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

export default EmployeePunchDetails;
