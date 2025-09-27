import moment from 'moment';
import { useState } from 'react';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';

const columns = [
  { key: 'dateTime', header: 'Date' },
  { key: 'vehicleNo', header: 'Vehicle No.' },
  { key: 'routeNo', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'contactNumber', header: 'Driver Contact Number' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'employeeId', header: 'Employee ID' },
  { key: 'plant', header: 'Plant' },
  { key: 'department', header: 'Department' },
  { key: 'latLong', header: 'Lat-Long' },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (value, row) =>
      row?.latLong ? (
        <a
          href={`https://maps.google.com/?q=${row.latLong}`}
          target='_blank'
          className='text-blue-700 underline'
          rel='noopener noreferrer'>
          G-Map
        </a>
      ) : (
        '-'
      ),
  },
  { key: 'arrivalTime', header: 'Arrival Time @ Destination' },
];

const data = [];

function DestinationArrivalFemale() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const paginatedData = data.slice(page * limit, page * limit + limit);

  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
  });

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Add your form submission logic here
    const fromDate = moment(filterData.fromDate).format('YYYY-MM-DD HH:mm:ss');
    const toDate = moment(filterData.toDate).format('YYYY-MM-DD HH:mm:ss');
    const formData = { ...filterData, fromDate, toDate };
    console.log('Form submitted', formData);
  };

  const handleFormReset = () => {
    setFilterData({ fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Arrival History Of Female Employees @ Destination</h1>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
      />
      <ReportTable
        columns={columns}
        data={paginatedData}
        loading={false}
        error={null}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={data?.length}
      />
    </div>
  );
}

export default DestinationArrivalFemale;
