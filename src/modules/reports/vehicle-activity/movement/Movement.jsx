import jsPDF from 'jspdf';
import moment from 'moment';
import * as XLSX from 'xlsx';
import tabs from '../components/Tab';
import { toast } from 'react-toastify';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTab from '../components/CustomTab';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../../components/FilterOption';
import ReportTable from '../../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../../redux/vehicleRouteSlice';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

const interValOptions = [
  { label: '5 Min', value: '5' },
  { label: '10 Min', value: '10' },
  { label: '20 Min', value: '20' },
  { label: '30 Min', value: '30' },
  { label: '1 Hour', value: '60' },
  { label: '2 Hour', value: '120' },
  { label: '4 Hour', value: '240' },
  { label: '8 Hour', value: '480' },
  { label: '16 Hour', value: '960' },
  { label: '24 Hour', value: '1440' },
];

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
  { key: 'source', header: 'Source', render: (_ignored, row) => row?.source || '' },
  { key: 'destination', header: 'Destination', render: (_ignored, row) => row?.destination || '' },
  { key: 'employCount', header: 'Employee Count', render: (_ignored, row) => row?.employCount || '' },
  { key: 'top_speed', header: 'Speed', render: (_ignored, row) => row?.top_speed || '' },
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
  { key: 'tripDistance', header: 'Trip Distance', render: (_ignored, row) => row?.tripDistance || '' },
  { key: 'total_distance', header: 'Covered Distance', render: (_ignored, row) => row?.total_distance || '' },
  { key: 'start_odometer', header: 'Start Odometer', render: (_ignored, row) => row?.start_odometer || '' },
  { key: 'end_odometer', header: 'End Odometer', render: (_ignored, row) => row?.end_odometer || '' },
  { key: 'total_distance_2', header: 'Total Distance', render: (_ignored, row) => row?.total_distance || '' },
  { key: 'top_speed_2', header: 'Top Speed', render: (_ignored, row) => row?.top_speed || '' },
  {
    key: 'total_running_time',
    header: 'Total Running Duration',
    render: (_ignored, row) => row?.total_running_time || '',
  },
  { key: 'total_ideal_time', header: 'Total Idle Duration', render: (_ignored, row) => row?.total_ideal_time || '' },
  { key: 'total_ideal_time', header: 'Total Idle Duration', render: (_ignored, row) => row.total_ideal_time || '' },
  { key: 'total_parked_time', header: 'Total Parked Duration', render: (_ignored, row) => row.total_parked_time || '' },
  { key: 'parking', header: 'No. of Parking', render: (_ignored, row) => row.parking || '' },
  { key: 'offlineDuration', header: 'Total Offline Duration', render: (_ignored, row) => row.offlineDuration || '' },
];

function Movement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicleActivityData } = useSelector((state) => state?.vehicleActivity || {});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchVehicleActivityData({ page: page + 1 || page, limit }));
  }, [dispatch, page, limit]);

  const totalCount = vehicleActivityData?.pagination?.total;

  const company_id = localStorage.getItem('company_id');

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  const [filterData, setFilterData] = useState({ bus: '', interval: '', fromDate: '', toDate: '' });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (company_id) {
      const today = moment().format('YYYY-MM-DD');
      dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
      dispatch(fetchVehicleActivityData({ company_id, vehicle_id: '', from: today, to: today })).then((res) => {
        if (res?.payload?.status === 200) {
          setFilteredData(res?.payload?.data || []);
        }
      });
    }
  }, [dispatch, company_id]);

  const vehicleOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  const handleExportExcel = () => {
    const exportData = filteredData.map((row) => ({
      'Date & Time': formatDateTime(row?.created_at),
      'Vehicle Type': row?.vehicle_type || '',
      'Vehicle Number': row?.vehicle_number || '',
      'Route Details': row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
      'Driver Name': `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
      'Driver Contact Number': row?.vehicle_driver?.phone_number || '',
      Source: row?.source || '',
      Destination: row?.destination || '',
      'Employee Count': row?.employCount || '',
      Speed: row?.top_speed || '',
      'Start Lat-Long': `${row?.start_latitude || ''} - ${row?.start_longitude || ''}`,
      'End Lat-Long': `${row?.end_latitude || ''} - ${row?.end_longitude || ''}`,
      'Trip Distance': row?.tripDistance || '',
      'Covered Distance': row?.total_distance || '',
      'Start Odometer': row?.start_odometer || '',
      'End Odometer': row?.end_odometer || '',
      'Total Distance': row?.total_distance || '',
      'Top Speed': row?.top_speed || '',
      'Total Running Duration': row?.total_running_time || '',
      'Total Idle Duration': row?.total_ideal_time || '',
      'Total Parked Duration': row?.total_parked_time || '',
      'No. of Parking': row?.parking || '',
      'Total Offline Duration': row?.offlineDuration || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = new Array(Object.keys(exportData[0] || {}).length).fill({ wch: 28 });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movement Report');

    XLSX.writeFile(workbook, 'movement-report.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const headers = [
      [
        'Date & Time',
        'Vehicle Type',
        'Vehicle Number',
        'Route Details',
        'Driver Name',
        'Driver Contact Number',
        'Source',
        'Destination',
        'Employee Count',
        'Speed',
        'Start Lat-Long',
        'End Lat-Long',
        'Trip Distance',
        'Covered Distance',
        'Start Odometer',
        'End Odometer',
        'Total Distance',
        'Top Speed',
        'Total Running Duration',
        'Total Idle Duration',
        'Total Parked Duration',
        'No. of Parking',
        'Total Offline Duration',
      ],
    ];

    const rows = filteredData.map((row) => [
      formatDateTime(row?.created_at),
      row?.vehicle_type || '',
      row?.vehicle_number || '',
      row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
      `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
      row?.vehicle_driver?.phone_number || '',
      row?.source || '',
      row?.destination || '',
      row?.employCount || '',
      row?.top_speed || '',
      `${row?.start_latitude || ''} - ${row?.start_longitude || ''}`,
      `${row?.end_latitude || ''} - ${row?.end_longitude || ''}`,
      row?.tripDistance || '',
      row?.total_distance || '',
      row?.start_odometer || '',
      row?.end_odometer || '',
      row?.total_distance || '',
      row?.top_speed || '',
      row?.total_running_time || '',
      row?.total_ideal_time || '',
      row?.total_parked_time || '',
      row?.parking || '',
      row?.offlineDuration || '',
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 160, 133] },
      startY: 20,
      margin: { left: 5, right: 5 },
    });

    doc.save('movement-report.pdf');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      //vehicle_id: filterData.bus,
      vehicle_id: 'cmawix9lz000dui9oehg6rd8m',
      from: moment(filterData.fromDate).format('YYYY-MM-DD'),
      to: moment(filterData.toDate).format('YYYY-MM-DD'),
    };
    dispatch(fetchVehicleActivityData(payload)).then((res) => {
      if (res?.payload?.status == 200) {
        toast.success(res?.payload?.message);
        setFilteredData(res?.payload?.data);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', interval: '', fromDate: '', toDate: '' });
  };

  const handleView = (row) => {
    navigate('/report/movement/view', { state: row });
    console.log('Viewing data...', row);
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Movement Report</h1>
      </div>
      <FilterOption
        handleExport={handleExportExcel}
        handleExportPDF={handleExportPDF}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        buses={vehicleOptions}
        interValOptions={interValOptions}
      />
      <ReportTable
        columns={columns}
        data={filteredData}
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
