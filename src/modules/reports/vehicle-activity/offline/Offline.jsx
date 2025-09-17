import moment from 'moment-timezone';
import tabs from '../components/Tab';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTab from '../components/CustomTab';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../../components/table/ReportTable';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';

// Dummy data for fallback/demo (structure similar to Movement.jsx)
const dummyData = [
  {
    created_at: new Date().toISOString(),
    vehicle_type: 'Bus',
    vehicle_number: 'KA01AB1234',
    Vehicle_Route: { route_number: 'R1', route_name: 'Main Route' },
    vehicle_driver: { first_name: 'John', last_name: 'Doe', phone_number: '9876543210' },
    total_offline_duration: '00:10:00',
    max_offline_duration: '00:05:00',
    noOffline: 2,
  },
  {
    created_at: new Date(Date.now() - 86400000).toISOString(),
    vehicle_type: 'Van',
    vehicle_number: 'KA02CD5678',
    Vehicle_Route: { route_number: 'R2', route_name: 'Secondary Route' },
    vehicle_driver: { first_name: 'Jane', last_name: 'Smith', phone_number: '9123456780' },
    total_offline_duration: '00:04:00',
    max_offline_duration: '00:02:00',
    noOffline: 1,
  },
];

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

const columns = [
  { key: 'created_at', header: 'Date Time', render: (_ignored, row) => formatDateTime(row?.created_at) },
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
    render: (_ignored, row) => row?.vehicle_driver?.phone_number || '',
  },
  {
    key: 'total_offline_duration',
    header: 'Total Offline Duration',
    render: (_ignored, row) => row?.total_offline_duration || '',
  },
  {
    key: 'max_offline_duration',
    header: 'Max Offline Duration',
    render: (_ignored, row) => row?.max_offline_duration || '',
  },
  { key: 'noOffline', header: 'No. of Offline', render: (_ignored, row) => row?.noOffline || '' },
];

function Offline() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicleActivityData, loading, error } = useSelector((state) => state?.vehicleActivity || {});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchVehicleActivityData({ page: page + 1 || page, limit }));
  }, [dispatch, page, limit]);

  const tableData = vehicleActivityData?.data?.length ? vehicleActivityData.data : dummyData;
  const totalCount = vehicleActivityData?.pagination?.total || dummyData.length;

  const handleView = (row) => {
    navigate('/report/offline/view', { state: row });
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Offline Report</h1>
      </div>
      <ReportTable
        columns={columns}
        data={dummyData}
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

export default Offline;
