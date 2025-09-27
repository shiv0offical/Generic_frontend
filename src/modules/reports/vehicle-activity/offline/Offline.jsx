import React, { useEffect, useState } from 'react';
import ReportTable from '../../../../components/table/ReportTable';
import FilterOption from '../../../../components/FilterOption';
import CustomTab from '../components/CustomTab';
import tabs from '../components/Tab';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllVehicleData } from '../../../../redux/vehicleReportSlice';
import { fetchVehicleActivityData } from '../../../../redux/vehicleActivitySlice';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

function formatDateTime(isoString) {
  if (!isoString) return '';

  const dateObj = new Date(isoString);

  const date = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const time = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${date} ${time}`;
}

const columns = [
  { key: 'created_at', header: 'Date Time', render: (_ignored, row) => formatDateTime(row?.created_at) },
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
    header: 'Driver Contact No',
    render: (_ignored, row) => row?.vehicle_driver?.phone_number || '',
  },
  {
    key: 'total_offline_duration',
    header: 'Total Offline Duration',
    render: (_ignored, row) => row?.total_offline_duration || '',
  },
  {
    key: 'max_offline_duration',
    header: 'Max Offline Duration',
    render: (_ignored, row) => row?.max_offline_duration || '',
  },
  { key: 'noOffline', header: 'No. of Offline', render: (_ignored, row) => row?.noOffline || '' },
];

function Offline() {
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
        'Total Offline Duration': formatDate(row?.total_offline_duration) || '',
        'Max Offline Duration': formatDate(row?.max_offline_duration) || '',
        'No. of Offline': row?.noOffline || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = new Array(Object.keys(exportData[0] || {}).length).fill({
      wch: 20,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Offline Report');
    XLSX.writeFile(workbook, 'offline_report.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredData.map((row) => {
      return [
        formatDateTime(row?.created_at),
        row?.vehicle_type || '',
        row?.vehicle_number || '',
        row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '',
        `${row?.vehicle_driver?.first_name || ''} ${row?.vehicle_driver?.last_name || ''}`.trim(),
        row?.vehicle_driver?.phone_number || '',
        formatDate(row?.total_offline_duration) || '',
        formatDate(row?.max_offline_duration) || '',
        row?.noOffline || '',
      ];
    });

    const tableHeaders = [
      'Date & Time',
      'Vehicle Type',
      'Vehicle Number',
      'Route Details',
      'Driver Name',
      'Driver Contact Number',
      'Total Offline Duration',
      'Max Offline Duration',
      'No. of Offline',
    ];

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 7 },
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
      //vehicle_id: "cmawix9lz000dui9oehg6rd8m",
      from: moment(filterData.fromDate).format('YYYY-MM-DD'),
      to: moment(filterData.toDate).format('YYYY-MM-DD'),
      type: 'offline',
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
        buses={buses}
      />
      <ReportTable columns={columns} data={filteredData} handleView={handleView} />
    </div>
  );
}

export default Offline;
