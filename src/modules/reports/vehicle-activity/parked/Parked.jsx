import moment from 'moment-timezone';
import tabs from '../components/Tab';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTab from '../components/CustomTab';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../../components/table/ReportTable';
import { fetchAllVehicleData } from '../../../../redux/vehicleReportSlice';

// Dummy data for demonstration, similar to Movement.jsx
const dummyData = [
  {
    created_at: new Date().toISOString(),
    vehicle_type: 'Vehicle',
    vehicle_number: 'KA01AB1234',
    Vehicle_Route: { route_number: 'R1', route_name: 'Main Route' },
    vehicle_driver: { first_name: 'John', last_name: 'Doe', phone_number: '9876543210' },
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    total_parked_time: '00:10:00',
    lastVehicleData: { latitude: '12.9716', longitude: '77.5946' },
    loaction: 'MG Road, Bangalore',
  },
  {
    created_at: new Date(Date.now() - 86400000).toISOString(),
    vehicle_type: 'Van',
    vehicle_number: 'KA02CD5678',
    Vehicle_Route: { route_number: 'R2', route_name: 'Secondary Route' },
    vehicle_driver: { first_name: 'Jane', last_name: 'Smith', phone_number: '9123456780' },
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() - 86300000).toISOString(),
    total_parked_time: '00:05:00',
    lastVehicleData: { latitude: '12.9352', longitude: '77.6245' },
    loaction: 'Brigade Road, Bangalore',
  },
];

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

const columns = [
  { key: 'created_at', header: 'Date & Time', render: (_ignored, row) => formatDateTime(row?.created_at) },
  { key: 'vehicleType', header: 'Vehicle Type', render: (_ignored, row) => (row?.vehicle_type || '').trim() },
  { key: 'vehicleNumber', header: 'Vehicle Number', render: (_ignored, row) => (row?.vehicle_number || '').trim() },
  {
    key: 'Vehicle_Route',
    header: 'Route Details',
    render: (_ignored, row) => (row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '').trim(),
  },
  {
    key: 'vehicle_driver',
    header: 'Driver Name',
    render: (_ignored, row) => {
      const firstName = row?.vehicle_driver?.first_name || '';
      const lastName = row?.vehicle_driver?.last_name || '';
      return `${firstName} ${lastName}`.trim();
    },
  },
  {
    key: 'driverContact',
    header: 'Driver Contact No',
    render: (_ignored, row) => row.vehicle_driver?.phone_number || '',
  },
  {
    key: 'start_time',
    header: 'Start Time',
    render: (_ignored, row) => formatDate(row.start_time) || '',
  },
  {
    key: 'end_time',
    header: 'End Time',
    render: (_ignored, row) => formatDate(row.end_time) || '',
  },
  {
    key: 'total_parked_time',
    header: 'Total Parked Duration',
    render: (_ignored, row) => row.total_parked_time || '',
  },
  {
    key: 'lastVehicleData',
    header: 'Lat-Long',
    render: (_ignored, row) => {
      const lat = row?.lastVehicleData?.latitude || '';
      const long = row?.lastVehicleData?.longitude || '';
      return `${lat} - ${long}`;
    },
  },
  {
    key: 'location',
    header: 'Nearest Location',
    render: (_ignored, row) => row.loaction || '',
  },
  {
    key: 'lastVehicleData',
    header: 'Google-Map',
    render: (_ignored, row) => {
      const lat = row?.lastVehicleData?.latitude;
      const lng = row?.lastVehicleData?.longitude;
      if (!lat || !lng) return '';
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      return (
        <a href={mapUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>
          Google-Map
        </a>
      );
    },
  },
];

function Parked() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allVehicledata } = useSelector((state) => state?.vehicleReport || {});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const company_id = localStorage.getItem('company_id');

  useEffect(() => {
    if (company_id) {
      dispatch(fetchAllVehicleData({ company_id }));
    }
  }, [dispatch, company_id]);

  // For demo, use dummyData if no API data, similar to Movement.jsx
  // In real use, replace dummyData with API data as needed
  const tableData = dummyData;
  const totalCount = dummyData.length;

  const handleView = (row) => {
    navigate('/report/parked/view', { state: row });
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Parked Report</h1>
      </div>
      <ReportTable
        columns={columns}
        data={tableData}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={totalCount}
        handleView={handleView}
      />
    </div>
  );
}

export default Parked;
