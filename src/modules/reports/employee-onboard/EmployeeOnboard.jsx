import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import moment from 'moment-timezone';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlants } from '../../../redux/plantSlice';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchDepartments } from '../../../redux/departmentSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchAllEmployeeDetails, fetchEmployeeOnboard } from '../../../redux/employeeSlice';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '');

const columns = [
  {
    key: 'onboard_employee',
    header: 'Employee Name',
    render: (_v, r) => r.onboard_employee || r.first_name || '-',
  },
  { key: 'punch_id', header: 'RFID Tag' },
  {
    key: 'punch_time',
    header: 'Punch Time',
    render: (v) => (v ? moment(v).format('YYYY-MM-DD hh:mm:ss A') : '-'),
  },
  {
    key: 'punch_status',
    header: 'Punch Status',
    render: (v) => (v === true ? 'In' : v === false ? 'Out' : '-'),
  },
  { key: 'vehicle_name', header: 'Vehicle Name' },
  { key: 'vehicle_number', header: 'Vehicle Number' },
  {
    key: 'location',
    header: 'Location',
    render: (_v, r) =>
      r.latitude && r.longitude ? `${Number(r.latitude).toFixed(6)}, ${Number(r.longitude).toFixed(6)}` : '-',
  },
  {
    key: 'gmap',
    header: 'Google-map',
    render: (_v, r) =>
      r.latitude && r.longitude ? (
        <a
          href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
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
  const { employeeOnboardData, loading, error } = useSelector((s) => s.employee);

  const { departments } = useSelector((s) => s.department);
  const { getAllEmployeeDetails } = useSelector((s) => s.employee);
  const { vehicleRoutes } = useSelector((s) => s.vehicleRoute);
  const { plants } = useSelector((s) => s.plant);

  const today = moment().format('YYYY-MM-DD');
  const [filterData, setFilterData] = useState({
    route: [],
    busRoute: '',
    fromDate: today,
    toDate: today,
    department: '',
    employee: [],
    plants: [],
  });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Fetch paginated onboard data for table
    dispatch(fetchEmployeeOnboard({ page: page + 1, limit }));

    // Fetch departments
    dispatch(fetchDepartments({ limit: 100 }));

    // Fetch vehicle routes
    dispatch(fetchVehicleRoutes({ limit: 100 }));

    // Fetch plants
    dispatch(fetchPlants({ limit: 100 }));

    // Fetch all employees
    const company_id = localStorage.getItem('company_id');
    if (company_id) dispatch(fetchAllEmployeeDetails({ company_id, limit: 2000 }));

    // Fetch filtered onboard data for export
    const payload = {
      company_id: localStorage.getItem('company_id'),
      department_id: '',
      start: today,
      end: today,
      employee_id: '',
      vehicle_route_id: '',
      plant_id: '',
    };
    dispatch(fetchEmployeeOnboard(payload)).then((res) => setFilteredData(res?.payload?.data || []));
  }, [dispatch, page, limit, today]);

  const employeeOptions =
    getAllEmployeeDetails.employes?.map((emp) => ({
      label: `${emp.employee_id} - ${emp.first_name}`,
      value: emp.employee_id,
    })) || [];
  const routeOptions =
    vehicleRoutes.routes?.map((route) => ({ label: `Route  - ${route?.name || 'N/A'}`, value: route?.id })) || [];
  const busOptions =
    vehicleRoutes.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];
  const plantOptions = (plants || []).map((plant) => ({ label: plant.plant_name || 'N/A', value: plant.id }));

  const tableData =
    employeeOnboardData?.data?.map((row) => ({
      ...row,
      location:
        row.latitude && row.longitude ? `${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}` : '-',
      gmap: row.latitude && row.longitude ? `https://maps.google.com/?q=${row.latitude},${row.longitude}` : '',
    })) || [];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { fromDate, toDate, department, employee, route, busRoute, plants: plantArr } = filterData;
    const payload = {
      company_id: localStorage.getItem('company_id'),
      department_id: department,
      start: moment(fromDate).format('YYYY-MM-DD'),
      end: moment(toDate).format('YYYY-MM-DD'),
      employee_id:
        Array.isArray(employee) && employee.length === getAllEmployeeDetails.employes?.length
          ? 'All'
          : employee?.filter(Boolean).join(',') || '',
      vehicle_route_id: Array.isArray(route) ? route.filter(Boolean).join(',') : '',
      bus_route_id: busRoute,
      plant_id: Array.isArray(plantArr) ? plantArr.filter(Boolean).join(',') : '',
    };
    dispatch(fetchEmployeeOnboard(payload)).then((res) => setFilteredData(res?.payload?.data || []));
  };

  const handleFormReset = () =>
    setFilterData({
      route: [],
      busRoute: '',
      fromDate: today,
      toDate: today,
      department: '',
      employee: [],
      plants: [],
    });

  const handleExport = () => {
    const exportData = filteredData?.map((row) => {
      const emp = row?.employee || {};
      const gMapUrl =
        emp.boarding_latitude && emp.boarding_longitude
          ? `https://www.google.com/maps?q=${emp.boarding_latitude},${emp.boarding_longitude}`
          : '';
      return {
        Date: formatDate(row?.punch_time),
        'Boarding In': formatDate(row?.boarding_in),
        'Boarding Out': formatDate(row?.boarding_out),
        'Employee Name': `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        'Employee Id': emp.employee_id || '',
        Plant: emp.plant?.plant_name || '',
        Department: emp.department?.department_name || '',
        'Route Name': emp.vehicleRoute?.name || '',
        'Route No': emp.vehicleRoute?.route_number || '',
        Source: emp.boarding_address || '',
        Destination: row?.plant_name || '',
        'Nearest Location': emp.nearest_location || '',
        'G-Map': gMapUrl,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 40 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees Onboard');
    XLSX.writeFile(workbook, 'employees_onboard.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredData?.map((row) => {
      const emp = row?.employee || {};
      const gMapUrl =
        emp.boarding_latitude && emp.boarding_longitude
          ? `https://www.google.com/maps?q=${emp.boarding_latitude},${emp.boarding_longitude}`
          : '';
      return [
        formatDate(row?.punch_time),
        formatDate(row?.boarding_in),
        formatDate(row?.boarding_out),
        `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        emp.employee_id || '',
        emp.plant?.plant_name || '',
        emp.department?.department_name || '',
        emp.vehicleRoute?.name || '',
        emp.vehicleRoute?.route_number || '',
        emp.boarding_address || '',
        row?.plant_name || '',
        emp.nearest_location || '',
        gMapUrl,
      ];
    });
    autoTable(doc, {
      head: [
        [
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
        ],
      ],
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
        buses={busOptions}
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
