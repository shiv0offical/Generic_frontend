import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchOverSpeedReport } from '../../../redux/vehicleReportSlice';

const columns = [
  { key: 'vehicle_name', header: 'Vehicle Name' },
  { key: 'vehicle_number', header: 'Vehicle Number' },
  { key: 'entry_speed', header: 'Entry Speed' },
  {
    key: 'entry_time',
    header: 'Entry Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  { key: 'exit_speed', header: 'Exit Speed' },
  {
    key: 'exit_time',
    header: 'Exit Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  { key: 'max_speed', header: 'Max Speed' },
  { key: 'speed_duration', header: 'Speed Duration' },
  { key: 'max_speed_distance', header: 'Max Speed Distance' },
  {
    key: 'location',
    header: 'Location',
    render: (_value, row) =>
      row.latitude && row.longitude ? `${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}` : '-',
  },
  {
    key: 'gmap',
    header: 'Google-Map',
    render: (_value, row) =>
      row.latitude && row.longitude ? (
        <a
          href={`https://maps.google.com/?q=${row.latitude},${row.longitude}`}
          target='_blank'
          className='text-blue-700'
          rel='noopener noreferrer'>
          Google-Map
        </a>
      ) : (
        ''
      ),
  },
];

function Overspeed() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { speedOverReportData, loading, error } = useSelector((state) => state?.vehicleReport);

  useEffect(() => {
    dispatch(fetchOverSpeedReport({ page: page + 1 || 1, limit }));
  }, [dispatch, page, limit]);

  const overspeedData = Array.isArray(speedOverReportData?.overspeedData) ? speedOverReportData.overspeedData : [];

  const tableData = overspeedData.map((item) => ({
    vehicle_name: item.vehicle_name || '-',
    vehicle_number: item.vehicle_number || '-',
    entry_speed: item.entry_speed ?? '-',
    entry_time: item.entry_time || '-',
    exit_speed: item.exit_speed ?? '-',
    exit_time: item.exit_time || '-',
    max_speed: item.max_speed ?? '-',
    speed_duration: item.speed_duration ?? '-',
    max_speed_distance: item.max_speed_distance ?? '-',
    latitude: item.latitude || '-',
    longitude: item.longitude || '-',
    location:
      item.latitude && item.longitude
        ? `${Number(item.latitude).toFixed(6)}, ${Number(item.longitude).toFixed(6)}`
        : '-',
    gmap: item.latitude && item.longitude ? `https://maps.google.com/?q=${item.latitude},${item.longitude}` : '',
  }));

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Over Speed Report</h1>
      <ReportTable
        columns={columns}
        data={tableData}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={speedOverReportData?.pagination?.total || 0}
      />
    </div>
  );
}

export default Overspeed;
