import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchGeoToGeoFence, fetchVehicleGeoFence } from '../../../redux/geofenceSlice';
import FilterOption from '../../../components/FilterOption';
import { fetchAllVehicleData } from '../../../redux/vehicleReportSlice';
import { toast } from 'react-toastify';

const columns = [
  {
    key: 'created_at',
    header: 'Date',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  { key: 'vehicle_number', header: 'Vehicle Number', render: (v, row) => row?.vehicle?.vehicle_number || '-' },
  { key: 'route_details', header: 'Route Details', render: (v, row) => row?.route_details || '-' },
  {
    key: 'driver_name',
    header: 'Driver Name',
    render: (_v, row) => {
      const first = row?.vehicle?.vehicle_driver?.first_name || '';
      const last = row?.vehicle?.vehicle_driver?.last_name || '';
      return `${first} ${last}`.trim() || '-';
    },
  },
  {
    key: 'driver_number',
    header: 'Driver Number',
    render: (_v, row) => row?.vehicle?.vehicle_driver?.phone_number || '-',
  },
  {
    key: 'entry_time',
    header: 'Violation Start Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'entry_lat_long',
    header: 'Lat-Long',
    render: (_v, row) =>
      row?.entry_latitude && row?.entry_longitude ? `${row.entry_latitude}, ${row.entry_longitude}` : '-',
  },
  {
    key: 'entry_gmap',
    header: 'G-Map',
    render: (_v, row) =>
      row?.entry_latitude && row?.entry_longitude ? (
        <a
          href={`https://maps.google.com/?q=${row.entry_latitude},${row.entry_longitude}`}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#2563eb', textDecoration: 'underline' }}>
          View
        </a>
      ) : (
        '-'
      ),
  },
  {
    key: 'exit_time',
    header: 'Violation End Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'exit_lat_long',
    header: 'Lat-Long',
    render: (_v, row) =>
      row?.exit_latitude && row?.exit_longitude ? `${row.exit_latitude}, ${row.exit_longitude}` : '-',
  },
  {
    key: 'exit_gmap',
    header: 'G-Map',
    render: (_v, row) =>
      row?.exit_latitude && row?.exit_longitude ? (
        <a
          href={`https://maps.google.com/?q=${row.exit_latitude},${row.exit_longitude}`}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#2563eb', textDecoration: 'underline' }}>
          View
        </a>
      ) : (
        '-'
      ),
  },
  {
    key: 'violation_distance',
    header: 'Violation Distance',
    render: (v, row) =>
      row?.total_trip_distance !== undefined && row?.total_trip_distance !== null ? row.total_trip_distance : '-',
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

  const company_id = localStorage.getItem('company_id');

  const [filterData, setFilterData] = useState({
    bus: '',
    startGeoFence: '',
    endGeoFence: '',
    fromDate: '',
    toDate: '',
  });

  const { allVehicledata } = useSelector((state) => state?.vehicleReport);
  const { vehicleGeoFence } = useSelector((state) => state?.geofence);

  useEffect(() => {
    if (company_id) {
      dispatch(fetchAllVehicleData({ company_id }));
      dispatch(fetchVehicleGeoFence({ company_id }));
    }
  }, [dispatch, company_id]);

  const buses =
    allVehicledata?.data?.map((vehicle) => ({
      label: vehicle.vehicle_number,
      value: vehicle.id,
    })) || [];

  const geofenceOptions =
    vehicleGeoFence?.data?.map((item) => ({
      label: `${item.geofence_name} (${item.location})`,
      value: item.id,
    })) || [];

  // Prepare reportRows for export with only the columns in the table
  const reportRows =
    data.map((item) => ({
      created_at: item.created_at,
      vehicle_number: item?.vehicle?.vehicle_number || '-',
      route_details: item?.route_details || '-',
      driver_name:
        `${item?.vehicle?.vehicle_driver?.first_name || ''} ${item?.vehicle?.vehicle_driver?.last_name || ''}`.trim() ||
        '-',
      driver_number: item?.vehicle?.vehicle_driver?.phone_number || '-',
      entry_time: item.entry_time,
      entry_lat_long:
        item.entry_latitude && item.entry_longitude ? `${item.entry_latitude}, ${item.entry_longitude}` : '-',
      entry_gmap:
        item.entry_latitude && item.entry_longitude
          ? `https://maps.google.com/?q=${item.entry_latitude},${item.entry_longitude}`
          : '-',
      exit_time: item.exit_time,
      exit_lat_long: item.exit_latitude && item.exit_longitude ? `${item.exit_latitude}, ${item.exit_longitude}` : '-',
      exit_gmap:
        item.exit_latitude && item.exit_longitude
          ? `https://maps.google.com/?q=${item.exit_latitude},${item.exit_longitude}`
          : '-',
      violation_distance:
        item.total_trip_distance !== undefined && item.total_trip_distance !== null ? item.total_trip_distance : '-',
    })) || [];

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      company_id,
      vehicle_id: filterData.bus,
      start_geofence: filterData.startGeoFence,
      end_geofence: filterData.endGeoFence,
      start_time: new Date(filterData.fromDate).toISOString(),
      end_time: new Date(filterData.toDate).toISOString(),
    };

    dispatch(fetchGeoToGeoFence(payload)).then((res) => {
      if (res?.payload?.status === 200) {
        toast.success(res?.payload?.message || 'Success');
      } else if (res?.payload?.error) {
        toast.error(res?.payload?.error);
      } else {
        toast.error(res?.payload?.message || 'Something went wrong');
      }
    });
  };

  const handleExport = (rows) => {
    // Only export the columns shown in the table
    if (!Array.isArray(rows) || rows.length === 0 || typeof rows[0] !== 'object') {
      alert('No data available to export.');
      return;
    }

    const headers = [
      'Date',
      'Vehicle Number',
      'Route Details',
      'Driver Name',
      'Driver Number',
      'Violation Start Time',
      'Lat-Long',
      'G-Map',
      'Violation End Time',
      'Lat-Long',
      'G-Map',
      'Violation Distance',
    ];

    const keys = [
      'created_at',
      'vehicle_number',
      'route_details',
      'driver_name',
      'driver_number',
      'entry_time',
      'entry_lat_long',
      'entry_gmap',
      'exit_time',
      'exit_lat_long',
      'exit_gmap',
      'violation_distance',
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of rows) {
      const values = keys.map((key) => {
        const val = row[key];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val !== undefined && val !== null ? val : '';
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'geofence_violation_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', startGeoFence: '', endGeoFence: '', fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Geo-fence Violation Report</h1>
      <FilterOption
        handleExport={() => handleExport(reportRows)}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        buses={buses}
        startGeoFence={geofenceOptions}
        endGeoFence={geofenceOptions}
      />

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
