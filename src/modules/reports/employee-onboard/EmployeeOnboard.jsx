import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import moment from 'moment-timezone';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { setPlantData } from '../../../redux/plantSlice';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { setVehicleRoute } from '../../../redux/vehicleRouteSlice';
import { setDepartmentData } from '../../../redux/departmentSlice';
import { fetchAllEmployeeDetails, fetchEmployeeOnboard } from '../../../redux/employeeSlice';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const columns = [
  {
    key: 'onboard_employee',
    header: 'Employee Name',
    render: (_value, row) => row.onboard_employee || row.first_name || '-',
  },
  { key: 'punch_id', header: 'RFID Tag' },
  {
    key: 'punch_time',
    header: 'Punch Time',
    render: (value) => (value ? moment(value).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'punch_status',
    header: 'Punch Status',
    render: (value) => (value === true ? 'In' : value === false ? 'Out' : '-'),
  },
  { key: 'vehicle_name', header: 'Vehicle Name' },
  { key: 'vehicle_number', header: 'Vehicle Number' },
  {
    key: 'location',
    header: 'Location',
    render: (_value, row) =>
      row.latitude && row.longitude ? `${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}` : '-',
  },
  {
    key: 'gmap',
    header: 'Google-map',
    render: (_value, row) =>
      row.latitude && row.longitude ? (
        <a
          href={`https://maps.google.com/?q=${row.latitude},${row.longitude}`}
          target='_blank'
          className='text-blue-700'
          rel='noopener noreferrer'>
          Google Map
        </a>
      ) : (
        ''
      ),
  },
];

function EmployeeOnboard() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { employeeOnboardData, loading, error } = useSelector((state) => state?.employee);

  useEffect(() => {
    dispatch(fetchEmployeeOnboard({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const tableData = Array.isArray(employeeOnboardData?.data)
    ? employeeOnboardData.data.map((row) => ({
        ...row,
        location:
          row.latitude && row.longitude
            ? `${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}`
            : '-',
        gmap: row.latitude && row.longitude ? `https://maps.google.com/?q=${row.latitude},${row.longitude}` : '',
      }))
    : [];

  const departments = useSelector((state) => state?.departments?.departments);
  const { getAllEmployeeDetails } = useSelector((state) => state.employee);

  const today = moment().format('YYYY-MM-DD');

  const [filterData, setFilterData] = useState({
    route: [],
    fromDate: today, // default today
    toDate: today, //default today
    department: '',
    employee: [],
    plants: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [plantOptions, setPlantOptions] = useState([]);

  useEffect(() => {
    getDepartmentData();
  }, []);

  const getDepartmentData = async () => {
    const departmentsData = await ApiService.get(APIURL.DEPARTMENTS);
    if (departmentsData.success) {
      dispatch(setDepartmentData(departmentsData.data.departments));
    }
  };

  useEffect(() => {
    getVehicleRouteData();
  }, []);

  useEffect(() => {
    getPlantData();
  }, []);

  const getPlantData = async () => {
    try {
      const res = await ApiService.get(APIURL.PLANTS);
      if (res.success) {
        dispatch(setPlantData(res.data.plants));
        setPlantOptions(res.data.plants);
      }
    } catch (err) {
      console.log('Something went wrong fetching plant data', err);
    }
  };

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    if (company_id) {
      dispatch(fetchAllEmployeeDetails({ company_id }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (getAllEmployeeDetails?.length) {
      const employeeOpts = getAllEmployeeDetails.map((emp) => ({
        label: `${emp.employee_id} - ${emp.first_name}`,
        value: emp.employee_id,
      }));
      setEmployeeOptions(employeeOpts);
    }
  }, [getAllEmployeeDetails]);

  const getVehicleRouteData = async () => {
    const response = await ApiService.get(APIURL.VEHICLE_ROUTE);
    if (response.success) {
      dispatch(setVehicleRoute(response.data.vehicleRoute));
      const routeOpts = response.data.map((route) => ({
        label: `${route.route_number} - ${route.name}`, //Format here
        value: route.vehicle_id?.toString(),
      }));

      setRouteOptions(routeOpts);
    }
  };

  useEffect(() => {
    const formattedStart = moment(today).format('YYYY-MM-DD');
    const formattedEnd = moment(today).format('YYYY-MM-DD');

    const payload = {
      company_id: localStorage.getItem('company_id'),
      department_id: '',
      start: formattedStart,
      end: formattedEnd,
      employee_id: '',
      vehicle_route_id: '',
      plant_id: '',
    };

    dispatch(fetchEmployeeOnboard(payload)).then((res) => {
      if (res?.payload?.data?.length) {
        setFilteredData(res.payload.data);
      } else {
        setFilteredData([]);
      }
    });
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const formattedStart = moment(filterData.fromDate).format('YYYY-MM-DD');
    const formattedEnd = moment(filterData.toDate).format('YYYY-MM-DD');

    const payload = {
      company_id: localStorage.getItem('company_id'),
      department_id: filterData.department,
      start: formattedStart,
      end: formattedEnd,
      employee_id:
        Array.isArray(filterData.employee) && filterData.employee.length === getAllEmployeeDetails.length
          ? 'All'
          : filterData.employee?.filter(Boolean).join(',') || '',
      vehicle_route_id: Array.isArray(filterData.route) ? filterData.route.filter(Boolean).join(',') : '',
      plant_id: Array.isArray(filterData.plants) ? filterData.plants.filter(Boolean).join(',') : '',
    };

    dispatch(fetchEmployeeOnboard(payload)).then((res) => {
      if (res?.payload?.data?.length) {
        setFilteredData(res.payload.data);
      } else {
        setFilteredData([]);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({
      route: [],
      fromDate: today,
      toDate: today,
      department: '',
      employee: [],
      plants: [],
    });
  };

  const handleExport = () => {
    const exportData = filteredData?.map((row) => {
      const latest = row?.punch_time;
      const lat = row?.employee?.boarding_latitude;
      const lng = row?.employee?.boarding_longitude;
      const gMapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';

      return {
        Date: formatDate(latest),
        'Boarding In': formatDate(row?.boarding_in),
        'Boarding Out': formatDate(row?.boarding_out),
        'Employee Name': `${row?.employee?.first_name || ''} ${row?.employee?.last_name || ''}`.trim(),
        'Employee Id': row?.employee?.employee_id || '',
        Plant: row?.employee?.plant?.plant_name || '',
        Department: row?.employee?.department?.department_name || '',
        'Route Name': row?.employee?.vehicleRoute?.name || '',
        'Route No': row?.employee?.vehicleRoute?.route_number || '',
        Source: row?.employee?.boarding_address || '',
        Destination: row?.plant_name || '',
        'Nearest Location': row?.employee?.nearest_location || '',
        'G-Map': gMapUrl,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 14 }, // Boarding In
      { wch: 14 }, // Boarding Out
      { wch: 25 }, // Employee Name
      { wch: 15 }, // Emp.ID
      { wch: 20 }, // Plant
      { wch: 20 }, // Department
      { wch: 20 }, // Route Name
      { wch: 12 }, // Route No
      { wch: 30 }, // Source
      { wch: 20 }, // Destination
      { wch: 20 }, // Nearest Location
      { wch: 40 }, // G-Map
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees Onboard');
    XLSX.writeFile(workbook, 'employees_onboard.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredData?.map((row) => {
      const latest = row?.punch_time;
      const lat = row?.employee?.boarding_latitude;
      const lng = row?.employee?.boarding_longitude;
      const gMapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';

      return [
        formatDate(latest),
        formatDate(row?.boarding_in),
        formatDate(row?.boarding_out),
        `${row?.employee?.first_name || ''} ${row?.employee?.last_name || ''}`.trim(),
        row?.employee?.employee_id || '',
        row?.employee?.plant?.plant_name || '',
        row?.employee?.department?.department_name || '',
        row?.employee?.vehicleRoute?.name || '',

        row?.employee?.vehicleRoute?.route_number || '',
        row?.employee?.boarding_address || '',
        row?.plant_name || '',
        row?.employee?.nearest_location || '',
        gMapUrl,
      ];
    });

    const tableHeaders = [
      'Date',
      'Boarding In',
      'Boarding Out',
      'Employee Name',
      'Employee ID',
      'Plant',
      'Department',
      'Route Name',
      'Route No',
      'Source',
      'Destination',
      'Nearest Location',
      'G-Map',
    ];

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [7, 22, 61] },
      startY: 20,
      margin: { left: 10, right: 10 },
    });

    doc.save('employees_onboard.pdf');
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Employees On-Board Report</h1>

      <FilterOption
        handleExport={handleExport}
        handleExportPDF={handleExportPDF}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        routes={routeOptions}
        departments={departments}
        employees={employeeOptions}
        plants={plantOptions}
      />
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
        totalCount={employeeOnboardData?.pagination?.total || 0}
      />
    </div>
  );
}

export default EmployeeOnboard;
