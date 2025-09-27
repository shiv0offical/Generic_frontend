import moment from 'moment';
import tabs from '../components/Tab';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import CustomTab from '../components/CustomTab';
import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { fetchVehicleMissingInflux } from '../../../../redux/vehicleActivitySlice';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';

const columns = [
  {
    key: 'vehicleType',
    header: 'Vehicle Type',
    render: (_ignored, row) => {
      return row.vehicleType;
    },
  },
  { key: 'vehicle_number', header: 'Vechicle Number' },
  {
    key: 'vehicle_driver',
    header: 'Driver Number',
    render: (row) => {
      return row?.vehicle_driver?.phone_number;
    },
  },
  {
    key: 'vehicle_driver_name',
    header: 'Driver Name',
    render: (row) => {
      const firstName = row?.vehicle_driver?.first_name || '';
      const lastName = row?.vehicle_driver?.last_name || '';
      return `${firstName} ${lastName}`;
    },
  },
  {
    key: 'routeDetails',
    header: 'Route Details',
    render: (row) => {
      const routeDetails = row.vehicle_route || '';
      return `${routeDetails}`;
    },
  },
  { key: 'imei_number', header: 'IMEI Number' },
  { key: 'sim_number', header: 'SIM Number' },
  {
    key: 'imei',
    header: 'Installation Date',
    render: (row) => {
      const createdDate = row.created_at;
      return createdDate ? moment(createdDate).format('DD-MM-YYYY hh:mm A') : '-';
    },
  },
];

function NewDevice() {
  const company_id = localStorage.getItem('company_id');
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [vehicleData, setVehicleData] = useState([]);

  const handleSort = (key) => {
    const isAsc = orderBy === key && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(key);
  };

  const getValueByKey = (row, key) => {
    switch (key) {
      case 'vehicle_driver':
        return row?.vehicle_driver?.phone_number || '';
      case 'vehicle_driver_name': {
        const first = row?.vehicle_driver?.first_name || '';
        const last = row?.vehicle_driver?.last_name || '';
        return `${first} ${last}`.trim();
      }
      case 'routeDetails':
        return row?.vehicle_route || '';
      default:
        return row[key] ?? '';
    }
  };

  const sortedData = [...vehicleData].sort((a, b) => {
    if (!orderBy) return 0;

    const valueA = getValueByKey(a, orderBy);
    const valueB = getValueByKey(b, orderBy);

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    }

    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      if (company_id) {
        const response = await dispatch(
          fetchVehicleMissingInflux({
            company_id,
            page: page,
            limit: rowsPerPage,
          })
        );
        console.log('response', response);
        if (response?.payload?.status === 200) {
          setVehicleData(response.payload?.data?.vehicles || []);
        }
      }
    };

    fetchData();
  }, [dispatch, company_id, page, rowsPerPage]);

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>New Device Report</h1>
      </div>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
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
              {paginatedData.map((row, index) => (
                <TableRow hover key={row.id || index}>
                  {columns.map((column) => (
                    <TableCell className='whitespace-nowrap' key={column.key}>
                      {column.render ? column.render(row, index) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component='div'
          count={vehicleData.length}
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

export default NewDevice;
