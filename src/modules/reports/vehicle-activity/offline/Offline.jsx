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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

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
    render: (_ignored, row) => formatDateTime(row?.start_time),
  },
  {
    key: 'end_time',
    header: 'End Time',
    render: (_ignored, row) => formatDateTime(row?.end_time),
  },
  {
    key: 'duration',
    header: 'Duration',
    render: (_ignored, row) => row?.duration || '',
  },
  {
    key: 'lat_long',
    header: 'Lat-Long',
    render: (_ignored, row) => {
      if (row?.lastVehicleData?.latitude && row?.lastVehicleData?.longitude) {
        return `${row.lastVehicleData.latitude} - ${row.lastVehicleData.longitude}`;
      }
      return '';
    },
  },
  {
    key: 'nearest_location',
    header: 'Nearest Location',
    render: (_ignored, row) => row?.loaction || '',
  },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (_ignored, row) => {
      if (row?.lastVehicleData?.latitude && row?.lastVehicleData?.longitude) {
        const url = `https://www.google.com/maps?q=${row.lastVehicleData.latitude},${row.lastVehicleData.longitude}`;
        return (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#1a73e8', textDecoration: 'underline' }}>
            View
          </a>
        );
      }
      return '';
    },
  },
];

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

function Offline() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const company_id = localStorage.getItem('company_id');
  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  // vehicleOptions similar to Parked.jsx
  const vehicleOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  const [filterData, setFilterData] = useState({ bus: '', interval: '', fromDate: '', toDate: '' });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (company_id) {
      dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
      const today = moment().format('YYYY-MM-DD');
      dispatch(fetchVehicleActivityData({ company_id, vehicle_id: '', from: today, to: today, type: 'offline' })).then(
        (res) => {
          if (res?.payload?.status === 200) {
            setFilteredData(res?.payload?.data || []);
          } else {
            console.error('API Error:', res?.payload?.message);
            setFilteredData([]); // clear on error if needed
          }
        }
      );
    }
  }, [dispatch, company_id]);

  const handleExport = () => {
    const exportData = filteredData.map((row) => {
      const lat = row?.lastVehicleData?.latitude || '';
      const lng = row?.lastVehicleData?.longitude || '';
      const gmapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';
      return {
        'Date & Time': formatDateTime(row?.created_at),
        'Vehicle Type': row?.vehicle_type || '',
        'Vehicle Number': row?.vehicle_number || '',
        'Route Details': row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
        'Driver Name': `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
        'Driver Contact Number': row?.vehicle_driver?.phone_number || '',
        'Start Time': formatDate(row?.start_time) || '',
        'End Time': formatDate(row?.end_time) || '',
        'Total Offline Duration': row?.total_offline_duration || '',
        'Max Offline Duration': row?.max_offline_duration || '',
        'No. of Offline': row?.noOffline || '',
        'Lat-Long': `${lat} - ${lng}`,
        'Nearest Location': row?.loaction || '',
        'G-Map': gmapUrl,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = new Array(Object.keys(exportData[0] || {}).length).fill({ wch: 25 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Offline Report');
    XLSX.writeFile(workbook, 'offline_report.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableHeaders = [
      'Date & Time',
      'Vehicle Type',
      'Vehicle Number',
      'Route Details',
      'Driver Name',
      'Driver Contact Number',
      'Start Time',
      'End Time',
      'Total Offline Duration',
      'Max Offline Duration',
      'No. of Offline',
      'Lat-Long',
      'Nearest Location',
      'G-Map',
    ];

    const tableData = filteredData.map((row) => {
      const lat = row?.lastVehicleData?.latitude || '';
      const lng = row?.lastVehicleData?.longitude || '';
      const gmapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';
      return [
        formatDateTime(row?.created_at),
        row?.vehicle_type || '',
        row?.vehicle_number || '',
        row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
        `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
        row?.vehicle_driver?.phone_number || '',
        formatDate(row?.start_time) || '',
        formatDate(row?.end_time) || '',
        row?.total_offline_duration || '',
        row?.max_offline_duration || '',
        row?.noOffline || '',
        `${lat} - ${lng}`,
        row?.loaction || '',
        gmapUrl,
      ];
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 6 },
      headStyles: { fillColor: [7, 22, 61] },
      startY: 20,
      margin: { left: 10, right: 10 },
    });

    doc.save('offline_report.pdf');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      vehicle_id: filterData.bus,
      from: moment(filterData.fromDate).format('YYYY-MM-DD'),
      to: moment(filterData.toDate).format('YYYY-MM-DD'),
      type: 'offline',
      interval: filterData.interval,
    };
    dispatch(fetchVehicleActivityData(payload)).then((res) => {
      if (res?.payload?.status == 200) {
        setFilteredData(res?.payload?.data);
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({
      bus: '',
      interval: '',
      fromDate: '',
      toDate: '',
    });
  };

  const handleView = (row) => {
    navigate('/report/offline/view', { state: row });
    console.log('Viewing data...', row);
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Offline Report</h1>
      </div>
      <FilterOption
        handleExport={handleExport}
        handleExportPDF={handleExportPDF}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        buses={vehicleOptions}
        interValOptions={interValOptions}
      />
      <ReportTable columns={columns} data={filteredData} handleView={handleView} />
    </div>
  );
}

export default Offline;
