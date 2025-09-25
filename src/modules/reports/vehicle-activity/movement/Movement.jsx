import moment from 'moment-timezone';
import tabs from '../components/Tab';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTab from '../components/CustomTab';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../../components/table/ReportTable';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';

const dummyData = [
  {
    created_at: new Date().toISOString(),
    vehicle_type: 'Vehicle',
    vehicle_number: 'KA01AB1234',
    Vehicle_Route: { route_number: 'R1', route_name: 'Main Route' },
    vehicle_driver: { first_name: 'John', last_name: 'Doe', phone_number: '9876543210' },
    source: 'Depot',
    destination: 'Office',
    employCount: 25,
    top_speed: 60,
    start_latitude: '12.9716',
    start_longitude: '77.5946',
    end_latitude: '12.9352',
    end_longitude: '77.6245',
    tripDistance: 15.2,
    total_distance: 15.2,
    start_odometer: 10000,
    end_odometer: 10015.2,
    total_running_time: '00:45:00',
    total_ideal_time: '00:05:00',
    total_parked_time: '00:10:00',
    parking: 2,
    offlineDuration: '00:00:00',
  },
  {
    created_at: new Date(Date.now() - 86400000).toISOString(),
    vehicle_type: 'Van',
    vehicle_number: 'KA02CD5678',
    Vehicle_Route: { route_number: 'R2', route_name: 'Secondary Route' },
    vehicle_driver: { first_name: 'Jane', last_name: 'Smith', phone_number: '9123456780' },
    source: 'Warehouse',
    destination: 'Factory',
    employCount: 10,
    top_speed: 50,
    start_latitude: '12.9718',
    start_longitude: '77.5948',
    end_latitude: '12.9354',
    end_longitude: '77.6247',
    tripDistance: 8.5,
    total_distance: 8.5,
    start_odometer: 20000,
    end_odometer: 20008.5,
    total_running_time: '00:30:00',
    total_ideal_time: '00:02:00',
    total_parked_time: '00:05:00',
    parking: 1,
    offlineDuration: '00:01:00',
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
    render: (_ignored, row) => row.vehicle_driver?.phone_number || '',
  },
  { key: 'source', header: 'Source', render: (_ignored, row) => row.source || '' },
  { key: 'destination', header: 'Destination', render: (_ignored, row) => row.destination || '' },
  { key: 'count', header: 'Employee Count', render: (_ignored, row) => row.employCount || '' },
  { key: 'speed', header: 'Speed', render: (_ignored, row) => row.top_speed || '' },
  {
    key: 'start_lat_long',
    header: 'Start Lat-Long',
    render: (_ignored, row) => `${row?.start_latitude || ''} - ${row?.start_longitude || ''}`,
  },
  {
    key: 'end_lat_long',
    header: 'End Lat-Long',
    render: (_ignored, row) => `${row?.end_latitude || ''} - ${row?.end_longitude || ''}`,
  },
  { key: 'tripDistance', header: 'Trip Distance', render: (_ignored, row) => row.tripDistance || '' },
  { key: 'coveredDistance', header: 'Covered Distance', render: (_ignored, row) => row.total_distance || '' },
  { key: 'start_odometer', header: 'Start Odometer', render: (_ignored, row) => row.start_odometer || '' },
  { key: 'end_odometer', header: 'End Odometer', render: (_ignored, row) => row.end_odometer || '' },
  { key: 'total_distance', header: 'Total Distance', render: (_ignored, row) => row.total_distance || '' },
  { key: 'top_speed', header: 'Top Speed', render: (_ignored, row) => row.top_speed || '' },
  {
    key: 'total_running_time',
    header: 'Total Running Duration',
    render: (_ignored, row) => row.total_running_time || '',
  },
  { key: 'total_ideal_time', header: 'Total Idle Duration', render: (_ignored, row) => row.total_ideal_time || '' },
  { key: 'total_parked_time', header: 'Total Parked Duration', render: (_ignored, row) => row.total_parked_time || '' },
  { key: 'parking', header: 'No. of Parking', render: (_ignored, row) => row.parking || '' },
  { key: 'offlineDuration', header: 'Total Offline Duration', render: (_ignored, row) => row.offlineDuration || '' },
];

function Movement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicleActivityData, loading, error } = useSelector((state) => state?.vehicleActivity || {});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchVehicleActivityData({ page: page + 1 || page, limit }));
  }, [dispatch, page, limit]);

  // const tableData = vehicleActivityData?.data?.length ? vehicleActivityData.data : dummyData;
  const totalCount = vehicleActivityData?.pagination?.total || dummyData.length;

  const handleView = (row) => {
    navigate('/report/movement/view', { state: row });
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Movement Report</h1>
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

export default Movement;
