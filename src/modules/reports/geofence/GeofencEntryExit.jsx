import * as XLSX from 'xlsx';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchAllVehicleData } from '../../../redux/vehicleReportSlice';
import { fetchGeofenceType, vehicleGeofenceReport } from '../../../redux/geofenceSlice';

const formatDate = (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '-');
const formatPosition = (v) => {
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
  { key: 'geofence_name', header: 'GeoFence Name', render: (v) => v ?? '-' },
  { key: 'geofence_type', header: 'GeoFence Type', render: (v) => v ?? '-' },
  { key: 'geofence_location', header: 'GeoFence Location', render: (v) => v ?? '-' },
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
  }

  data = data.map((item, i) => ({ ...item, id: item.id || item._id || i + 1 }));

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchAllVehicleData({ company_id }));
  }, [dispatch]);

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchGeofenceType({ company_id }));
  }, [dispatch]);

  const { geofenceType } = useSelector((state) => state?.geofence);
  const { allVehicledata } = useSelector((state) => state?.vehicleReport);

  const buses = allVehicledata?.data?.map((vehicle) => ({ label: vehicle.vehicle_name, value: vehicle.id })) || [];

  const geofenceTypes = geofenceType?.data?.map((type) => ({ label: type.name, value: type.id })) || [];

  const transformedData = GeoFenceVehicleReport?.data?.map((item) => ({
    date: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
    fenceEntryTime: item.entry_time ? moment(item.entry_time).format('HH:mm:ss') : '-',
    entryPosition: item.entry_position?.length ? `${item.entry_position[1]}, ${item.entry_position[0]}` : '-',
    durationInFence: item.duration_in_fence ?? '-',
    fenceExitTime: item.exit_time ? moment(item.exit_time).format('HH:mm:ss') : '-',
    exitPosition: item.exit_position?.length ? `${item.exit_position[1]}, ${item.exit_position[0]}` : '-',
  }));

  const [selectedRows, setSelectedRows] = useState([]);

  // Callback to receive selected rows from table
  const handleSelectRows = (rows) => {
    setSelectedRows(rows);
  };

  const handleSelectAllRows = () => {
    setSelectedRows(transformedData);
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

    const company_id = localStorage.getItem('company_id');

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
        buses={buses}
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
