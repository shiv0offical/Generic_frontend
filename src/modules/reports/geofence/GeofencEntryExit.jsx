import * as XLSX from 'xlsx';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchGeofenceType, vehicleGeofenceReport } from '../../../redux/geofenceSlice';

const columns = [
  { key: 'created_at', header: 'Date', render: (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '-') },
  { key: 'vehicle_number', header: 'Vehicle Number', render: (v) => v ?? '-' },
  { key: 'route_details', header: 'Route Details', render: (v) => v ?? '-' },
  { key: 'driver_name', header: 'Driver Name', render: (v) => v ?? '-' },
  { key: 'driver_number', header: 'Driver Number', render: (v) => v ?? '-' },
  { key: 'geofence_name', header: 'Geofence Name', render: (v) => v ?? '-' },
  { key: 'geofence_type', header: 'Geofence Type', render: (v) => v ?? '-' },
  { key: 'no_of_visit', header: 'No. Of Visit', render: (v) => v ?? '-' },
];

function GeofencEntryExit() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const company_id = localStorage.getItem('company_id');

  const { GeoFenceVehicleReport, loading, error } = useSelector((s) => s?.geofence);
  const { geofenceType } = useSelector((state) => state?.geofence);
  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);
  console.log(geofenceType);

  useEffect(() => {
    dispatch(vehicleGeofenceReport({ page: page + 1, limit }));
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
  }, [dispatch, page, limit, company_id]);

  useEffect(() => {
    if (company_id) dispatch(fetchGeofenceType({ company_id }));
  }, [dispatch, company_id]);

  let data = [];
  let totalCount = 0;
  if (GeoFenceVehicleReport?.reports) {
    data = Array.isArray(GeoFenceVehicleReport.reports)
      ? GeoFenceVehicleReport.reports
      : [GeoFenceVehicleReport.reports];
    totalCount = GeoFenceVehicleReport.pagination?.total ?? data.length;
  }

  data = data.map((item, i) => ({
    ...item,
    id: item.id || item._id || i + 1,
    created_at: item.created_at,
    vehicle_number: item.vehicle_number,
    route_details: item.route_details ?? '-',
    driver_name: item.driver_name ?? '-',
    driver_number: item.driver_number ?? '-',
    geofence_name: item.geofence_name ?? '-',
    geofence_type: item.geofence_type ?? '-',
    no_of_visit: item.no_of_visit ?? '-',
  }));

  const vehicleOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  const geofenceTypes = geofenceType?.data?.map((type) => ({ label: type.name, value: type.id })) || [];

  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAllRows = () => {
    setSelectedRows(data);
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GeoFence Report');
    XLSX.writeFile(workbook, 'geofence_report.xlsx');
  };

  const [filterData, setFilterData] = useState({
    bus: [],
    geofenceType: '',
    fromDate: '',
    toDate: '',
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!filterData.bus.length || !filterData.geofenceType || !filterData.fromDate || !filterData.toDate) {
      alert('Please fill in all filter fields.');
      return;
    }

    const payload = {
      company_id,
      vehicle_id: filterData.bus,
      type_id: filterData.geofenceType,
      from_date: new Date(filterData.fromDate).toISOString(),
      to_date: new Date(filterData.toDate).toISOString(),
    };

    dispatch(vehicleGeofenceReport(payload));
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', geofenceType: '', fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>GeoFence Entry-Exit Report</h1>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        handleSelectAllRows={handleSelectAllRows}
        buses={vehicleOptions}
        geofenceTypes={geofenceTypes}
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

export default GeofencEntryExit;
