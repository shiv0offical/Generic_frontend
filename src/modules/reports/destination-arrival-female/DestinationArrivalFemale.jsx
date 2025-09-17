import { useState } from 'react';
import ReportTable from '../../../components/table/ReportTable';

const columns = [
  { key: 'dateTime', header: 'Date' },
  { key: 'vehicleNo', header: 'Vehicle No.' },
  { key: 'routeNo', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverName', header: 'Contact Number' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'employeeId', header: 'Employee ID' },
  { key: 'plant', header: 'Plant' },
  { key: 'department', header: 'Department' },
  { key: 'routeName', header: 'Lat-Long' },
  {
    key: 'gmap',
    header: 'Google-Map',
    render: (value) => (
      <a href={value} target='_blank' className='text-blue-700' rel='noopener noreferrer'>
        Google Map
      </a>
    ),
  },
  { key: 'arrivalTime', header: 'Arrival Time @ Destination' },
];

const data = [
  {
    dateTime: '2025-02-11 08:30:00',
    vehicleNo: 'MH12AB1234',
    routeNo: 'R101',
    routeName: 'Pune-Mumbai',
    driverName: 'Ramesh Kumar',
    employeeName: 'Neha Verma',
    employeeId: 'EMP002',
    plant: 'Plant A',
    department: 'Operations',
    gmap: 'https://maps.google.com/?q=18.5204,73.8567',
    arrivalTime: '10:15:00',
    imeiNumber: '354820113859213',
  },
  {
    dateTime: '2025-02-11 10:00:00',
    vehicleNo: 'DL10PQ7890',
    routeNo: 'R203',
    routeName: 'Delhi-Gurgaon',
    driverName: 'Manoj Yadav',
    employeeName: 'Priya Sharma',
    employeeId: 'EMP007',
    plant: 'Plant B',
    department: 'Logistics',
    gmap: 'https://maps.google.com/?q=28.7041,77.1025',
    arrivalTime: '11:45:00',
    imeiNumber: '865432198765432',
  },
];

function DestinationArrivalFemale() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Arrival History Of Female Employees @ Destination</h1>
      <ReportTable
        columns={columns}
        data={data}
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
