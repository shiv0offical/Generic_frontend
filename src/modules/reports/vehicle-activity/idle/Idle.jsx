import moment from 'moment-timezone';
import tabs from '../components/Tab';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTab from '../components/CustomTab';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../../components/table/ReportTable';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

const columns = [
  { key: 'created_at', header: 'Date & Time', render: (_ignored, row) => formatDateTime(row?.created_at) },
  { key: 'vehicle_type', header: 'Vehicle Type', render: (_ignored, row) => (row?.vehicle_type || '').trim() },
  { key: 'vehicle_number', header: 'Vehicle Number', render: (_ignored, row) => (row?.vehicle_number || '').trim() },
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
    header: 'Driver Contact Number',
    render: (_ignored, row) => row?.vehicle_driver?.phone_number || '',
  },
  {
    key: 'start_time',
    header: 'Start Time',
    render: (_ignored, row) => (row?.start_time ? formatDateTime(row.start_time) : ''),
  },
  {
    key: 'end_time',
    header: 'End Time',
    render: (_ignored, row) => (row?.end_time ? formatDateTime(row.end_time) : ''),
  },
  { key: 'duration', header: 'Duration', render: (_ignored, row) => row?.duration || '' },
  { key: 'lat_long', header: 'Lat-Long', render: (_ignored, row) => row?.lat_long || '' },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (_ignored, row) =>
      row?.lat_long ? (
        <a
          href={`https://maps.google.com/?q=${row.lat_long}`}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#1976d2', textDecoration: 'underline' }}
          onClick={(e) => e.stopPropagation()}>
          View
        </a>
      ) : (
        ''
      ),
  },
];

function Idle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicleActivityData } = useSelector((state) => state?.vehicleActivity || {});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchVehicleActivityData({ page: page + 1 || page, limit }));
  }, [dispatch, page, limit]);

  const tableData = vehicleActivityData?.data || [];
  const totalCount = vehicleActivityData?.pagination?.total || 0;

  const handleView = (row) => {
    navigate('/report/idle/view', { state: row });
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Idle Report</h1>
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

export default Idle;
