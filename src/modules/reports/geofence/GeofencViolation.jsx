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

  const reportRows =
    GeoToGeoReportData?.data?.tripCount?.res?.map((item) => ({
      ...item,
      duration: moment.utc(moment(item.exit_time).diff(moment(item.entry_time))).format('HH:mm'),
      tripCount: GeoToGeoReportData?.data?.tripCount?.tripCount ?? '-',
      total_trip_distance: GeoToGeoReportData?.data?.tripCount?.total_trip_distance ?? '-',
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
    // Strong null and length check
    if (!Array.isArray(rows) || rows.length === 0 || typeof rows[0] !== 'object') {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of rows) {
      const values = headers.map((header) => {
        const val = row[header];
        if (Array.isArray(val)) return `"${val.join(',')}"`;
        return `"${val !== undefined && val !== null ? val : ''}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'geoToGeoFence_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', startGeoFence: '', endGeoFence: '', fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Geo-fence To Geo-fence Report</h1>
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
