import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { vehicleGeofenceReport } from '../../../redux/geofenceSlice';

const formatDate = (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '-');
const formatPosition = (v) => {
  if (Array.isArray(v) && v.length === 2) return `${+v[1].toFixed(6)}, ${+v[0].toFixed(6)}`;
  if (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) {
    const [lng, lat] = v.replace(/[{}]/g, '').split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  return '-';
};

const columns = [
  { key: 'created_at', header: 'Date', render: formatDate },
  { key: 'vehicle_number', header: 'Vehicle Number' },
  { key: 'vehicle_name', header: 'Vehicle Name' },
  { key: 'geofence_name', header: 'GeoFence Name' },
  { key: 'geofence_type', header: 'GeoFence Type' },
  { key: 'geofence_location', header: 'GeoFence Location' },
  { key: 'entry_time', header: 'Entry Time', render: formatDate },
  { key: 'entry_position', header: 'Entry Position', render: formatPosition },
  { key: 'exit_time', header: 'Exit Time', render: formatDate },
  { key: 'exit_position', header: 'Exit Position', render: formatPosition },
  { key: 'duration_in_fence', header: 'Duration in Fence', render: (v) => v ?? '-' },
];

function GeofencEntryExit() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const { GeoFenceVehicleReport, loading, error } = useSelector((s) => s?.geofence);

  useEffect(() => {
    dispatch(vehicleGeofenceReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  let data = [];
  let totalCount = 0;

  if (GeoFenceVehicleReport?.reports) {
    data = Array.isArray(GeoFenceVehicleReport.reports)
      ? GeoFenceVehicleReport.reports
      : [GeoFenceVehicleReport.reports];
    totalCount = GeoFenceVehicleReport.pagination?.total ?? data.length;
  } else if (Array.isArray(GeoFenceVehicleReport)) {
    data = GeoFenceVehicleReport;
    totalCount = data.length;
  } else if (GeoFenceVehicleReport) {
    data = [GeoFenceVehicleReport];
    totalCount = 1;
  }

  data = data.map((item, i) => ({ ...item, id: item.id || item._id || i + 1 }));

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>GeoFence Entry-Exit Report</h1>
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

export default GeofencEntryExit;
