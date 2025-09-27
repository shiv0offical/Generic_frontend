import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import OverSpeedChart from './charts/OverSpeedLineChart';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
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
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const company_id = localStorage.getItem('company_id');

  const { speedOverReportData, loading, error } = useSelector((state) => state?.vehicleReport);

  useEffect(() => {
    dispatch(fetchOverSpeedReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id }));
  }, [dispatch, company_id]);

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);
  const overspeedData = Array.isArray(speedOverReportData?.overspeedData) ? speedOverReportData.overspeedData : [];
  const totalCount = speedOverReportData?.pagination?.total || 0;

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

  const [filterData, setFilterData] = useState({ busRouteNo: '', fromDate: '', toDate: '' });

  const routeOptions = Array.isArray(vehicleRoutes)
    ? vehicleRoutes.map((route) => {
        let routeNumber = 'N/A';
        let routeName = 'N/A';

        if (route?.route_number) routeNumber = route.route_number;
        // Check if it exists in the first employee's vehicleRoute
        else if (route?.Employee?.[0]?.vehicleRoute?.route_number)
          routeNumber = route.Employee[0].vehicleRoute.route_number;

        // Get route name
        if (route?.name) {
          routeName = route.name;
        } else if (route?.Employee?.[0]?.vehicleRoute?.name) {
          routeName = route.Employee[0].vehicleRoute.name;
        }

        return { label: `Route ${routeNumber} - ${routeName}`, value: route.vehicle_id };
      })
    : [];

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = { company_id, vehicle_id: filterData.busRouteNo, from: filterData.fromDate, to: filterData.toDate };
    dispatch(fetchOverSpeedReport(payload)).then((res) => {
      console.log(res, 'res');
      if (res?.payload?.status == 200) {
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ busRouteNo: '', fromDate: '', toDate: '' });
  };

  const handleView = (row) => {
    navigate('/report/overspeed/view', { state: row });
    console.log('Viewing data...', row);
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Over Speed Report</h1>

      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        busRouteNo={routeOptions}
      />

      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <OverSpeedChart data={speedOverReportData} />
      </div>
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
        totalCount={totalCount}
      />
    </div>
  );
}

export default Overspeed;
