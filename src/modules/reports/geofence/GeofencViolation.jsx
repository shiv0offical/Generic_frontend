import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchGeoToGeoFence } from '../../../redux/geofenceSlice';

const columns = [
  {
    key: 'created_at',
    header: 'Date',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  { key: 'vechicleNumber', header: 'Vehicle Number' },
  { key: 'routeDetails', header: 'Routes Details' },
  {
    key: 'vehicle_driver',
    header: 'Driver Name',
    render: (_value, row) => {
      const first = row?.vehicle?.vehicle_driver?.first_name || '';
      const last = row?.vehicle?.vehicle_driver?.last_name || '';
      return `${first} ${last}`.trim() || '-';
    },
  },
  {
    key: 'vehicle_driver',
    header: 'Driver Number',
    render: (_value, row) => {
      const phone = row?.vehicle?.vehicle_driver?.phone_number || '';
      return phone || '-';
    },
  },
  {
    key: 'entry_time',
    header: 'Violation Start Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'exit_time',
    header: 'Violation End Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'total_trip_distance',
    header: 'Violation Distance',
    render: (value) => (value !== undefined && value !== null ? value : '-'),
  },
];

function GeofencViolation() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { GeoToGeoReportData, loading, error } = useSelector((state) => state?.geofence);

  useEffect(() => {
    dispatch(fetchGeoToGeoFence({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const data =
    GeoToGeoReportData?.data?.tripCount?.res && Array.isArray(GeoToGeoReportData.data.tripCount.res)
      ? GeoToGeoReportData.data.tripCount.res
      : [];

  const totalCount = GeoToGeoReportData?.data?.tripCount?.total || 0;

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Geo-fence To Geo-fence Report</h1>
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={totalCount}
      />
    </div>
  );
}

export default GeofencViolation;
