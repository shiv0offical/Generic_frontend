import { useEffect, useState } from 'react';
import ReportTable from '../../../../components/table/ReportTable';
import moment from 'moment-timezone';
import FilterOption from '../../../../components/FilterOption';
import CustomTab from '../components/CustomTab';
import tabs from '../components/Tab';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllVehicleData } from '../../../../redux/vehicleReportSlice';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

const columns = [
  { key: 'created_at', header: 'Date & Time', render: (_ignored, row) => formatDateTime(row?.created_at) },
  { key: 'vehicleType', header: 'Vehicle Type', render: (_ignored, row) => (row?.vehicle_type || '').trim() },
  { key: 'vehicleNumber', header: 'Vehicle Number', render: (_ignored, row) => (row?.vehicle_number || '').trim() },
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
    render: (_ignored, row) => row.vehicle_driver?.phone_number || '',
  },
  { key: 'total_parked_time', header: 'Total Parked Duration', render: (_ignored, row) => row.total_parked_time || '' },
  {
    key: 'max_parked_duration',
    header: 'Max Parked Duration',
    render: (_ignored, row) => row.max_parked_duration || '',
  },
  { key: 'no_of_parking', header: 'No of Parking', render: (_ignored, row) => row.no_of_parking || '' },
];

const interValOptions = [
  { label: '1M', value: '1' },
  { label: '5M', value: '5' },
  { label: '10M', value: '10' },
  { label: '25M', value: '25' },
];

function Parked() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const company_id = localStorage.getItem('company_id');
  const { allVehicledata } = useSelector((state) => state?.vehicleReport);

  const buses =
    allVehicledata?.data?.map((vehicle, index) => ({
      label: vehicle.vehicle_name || vehicle.vehicle_number,
      value: vehicle.id,
    })) || [];

  const [filterData, setFilterData] = useState({ bus: '', interval: '', fromDate: '', toDate: '' });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (company_id) {
      const today = moment().format('YYYY-MM-DD');
      dispatch(fetchAllVehicleData({ company_id }));
      dispatch(fetchVehicleActivityData({ company_id, vehicle_id: '', from: today, to: today })).then((res) => {
        if (res?.payload?.status === 200) {
          setFilteredData(res?.payload?.data || []);
        } else {
          console.error('API Error:', res?.payload?.message);
          setFilteredData([]); // clear on error if needed
        }
      });
    }
  }, [dispatch, company_id]);

  const handleExport = () => {
    const exportData = filteredData.map((row) => {
      return {
        'Date & Time': formatDateTime(row?.created_at),
        'Vehicle Type': row?.vehicle_type || '',
        'Vehicle Number': row?.vehicle_number || '',
        'Route Details': row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
        'Driver Name': `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
        'Driver Contact Number': row?.vehicle_driver?.phone_number || '',
        'Start Time': formatDate(row?.start_time) || '',
        'End Time': formatDate(row?.end_time) || '',
        'Total Parked Duration': row?.total_parked_time || '',
        'Lat-Long': `${row?.lastVehicleData?.latitude || ''} - ${row?.lastVehicleData?.longitude || ''}`,
        'Nearest Location': row?.loaction || '',
        'G-Map':
          row?.lastVehicleData?.latitude && row?.lastVehicleData?.longitude
            ? `https://www.google.com/maps?q=${row.lastVehicleData.latitude},${row.lastVehicleData.longitude}`
            : '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = new Array(Object.keys(exportData[0] || {}).length).fill({ wch: 25 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parked Report');
    XLSX.writeFile(workbook, 'parked_report.xlsx');
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
      'Total Parked Duration',
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
        row?.total_parked_time || '',
        `${lat} - ${lng}`,
        row?.loaction || '',
        gmapUrl,
      ];
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 6 },
      headStyles: { fillColor: [22, 45, 90] },
      startY: 20,
      margin: { left: 10, right: 10 },
    });

    doc.save('parked_report.pdf');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      vehicle_id: filterData.bus,
      // vehicle_id: "cmawix9lz000dui9oehg6rd8m",
      from: moment(filterData.fromDate).format('YYYY-MM-DD'),
      to: moment(filterData.toDate).format('YYYY-MM-DD'),
      type: 'parked',
    };
    dispatch(fetchVehicleActivityData(payload)).then((res) => {
      console.log(res, 'res');
      if (res?.payload?.status == 200) {
        setFilteredData(res?.payload?.data);
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', interval: '', fromDate: '', toDate: '' });
  };

  const handleView = (row) => {
    navigate('/report/parked/view', { state: row });
    console.log('Viewing data...', row);
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Parked Report</h1>
      </div>
      <FilterOption
        handleExport={handleExport}
        handleExportPDF={handleExportPDF}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        buses={buses}
        interValOptions={interValOptions}
      />
      <ReportTable columns={columns} data={filteredData} handleView={handleView} />
    </div>
  );
}

export default Parked;
