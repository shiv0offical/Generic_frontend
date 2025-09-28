import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlants } from '../../../redux/plantSlice';
import { useDropdown } from '../../../hooks/useDropdown';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchDepartments } from '../../../redux/departmentSlice';
import { fetchPuchLogReport } from '../../../redux/punchInOutSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchAllEmployeeDetails } from '../../../redux/employeeSlice';

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

function PunchTimelog() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const company_id = localStorage.getItem('company_id');

  // Dropdowns for employees, departments, plants
  const { employee } = useDropdown(company_id);
  const { options: employees } = employee;

  const { departments } = useSelector((state) => state?.department);
  const { plants } = useSelector((state) => state?.plant);
  const { getAllEmployeeDetails } = useSelector((state) => state?.employee);

  useEffect(() => {
    if (company_id) {
      dispatch(fetchVehicleRoutes({ company_id }));
      dispatch(fetchDepartments({ limit: 100 }));
      dispatch(fetchPlants({ limit: 100 }));
      dispatch(fetchAllEmployeeDetails({ company_id, limit: 2000 }));
    }
  }, [dispatch, company_id]);

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  const routeOptions =
    vehicleRoutes?.routes?.map((route) => ({ label: `Route  - ${route?.name || 'N/A'}`, value: route?.id })) || [];

  const busOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  // Plant options
  const plantOptions = (plants || []).map((plant) => ({ label: plant.plant_name || 'N/A', value: plant.id }));
  // Employee options (for multi-select)

  const employeeOptions =
    getAllEmployeeDetails?.employes?.map((emp) => ({
      label: `${emp.employee_id} - ${emp.first_name}`,
      value: emp.employee_id,
    })) ||
    employees ||
    [];

  const [punchlogData, setPunchlogData] = useState([]);
  const [noPunchLogData, setNoPunchLogData] = useState([]);
  const [filterData, setFilterData] = useState({
    employee: [],
    busRoute: '',
    fromDate: '',
    toDate: '',
    department: '',
    plants: [],
  });

  const { punchLogReportData, loading, error } = useSelector((state) => state?.punchInOut);

  useEffect(() => {
    dispatch(fetchPuchLogReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const data = Array.isArray(punchLogReportData?.data) ? punchLogReportData.data : [];

  const tableData = data.map((row) => ({
    ...row,
    location: row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : '-',
    gmap: row.latitude && row.longitude ? `https://maps.google.com/?q=${row.latitude},${row.longitude}` : '',
  }));

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Clean and encode employee IDs
    const employeeIds = filterData?.employee.map((id) => id.trim());

    const filters = {
      company_id,
      id: employeeIds,
      route_id: filterData.busRoute,
      start: filterData.fromDate ? new Date(filterData.fromDate).toISOString() : undefined,
      end: filterData.toDate ? new Date(filterData.toDate).toISOString() : undefined,
      department_id: filterData.department,
      plant_id: Array.isArray(filterData.plants) ? filterData.plants.filter(Boolean).join(',') : '',
    };

    try {
      const response = await ApiService.post(APIURL.PUNCHLOGREPORT, filters);

      if (response.success) {
        toast.success(response.message);
        const { valid = [], noPunchLogs = [] } = response.data;
        const value = response?.data;
        setPunchlogData(value);
        setNoPunchLogData(noPunchLogs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('API call failed:', error);
      toast.error('Failed to fetch punch log report.');
    }
  };

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormReset = () => {
    setFilterData({
      employee: [],
      busRoute: '',
      fromDate: '',
      toDate: '',
      department: '',
      plants: [],
    });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Punch Timelog Report</h1>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        employees={employeeOptions}
        routes={routeOptions}
        buses={busOptions}
        departments={departments}
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
        totalCount={punchLogReportData?.pagination?.total || 0}
      />
    </div>
  );
}

export default PunchTimelog;
