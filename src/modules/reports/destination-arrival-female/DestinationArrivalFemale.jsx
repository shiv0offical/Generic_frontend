import moment from 'moment';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlants } from '../../../redux/plantSlice';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchDepartments } from '../../../redux/departmentSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchAllEmployeeDetails } from '../../../redux/employeeSlice';

const columns = [
  { key: 'dateTime', header: 'Date' },
  { key: 'vehicleNo', header: 'Vehicle No.' },
  { key: 'routeNo', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'contactNumber', header: 'Driver Contact Number' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'employeeId', header: 'Employee ID' },
  { key: 'plant', header: 'Plant' },
  { key: 'department', header: 'Department' },
  { key: 'latLong', header: 'Lat-Long' },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (value, row) =>
      row?.latLong ? (
        <a
          href={`https://maps.google.com/?q=${row.latLong}`}
          target='_blank'
          className='text-blue-700 underline'
          rel='noopener noreferrer'>
          G-Map
        </a>
      ) : (
        '-'
      ),
  },
  { key: 'arrivalTime', header: 'Arrival Time @ Destination' },
];

const data = [];

function DestinationArrivalFemale() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Fetch vehicle routes, departments, plants, employees for options
  const company_id = localStorage.getItem('company_id');
  useEffect(() => {
    if (company_id) {
      dispatch(fetchVehicleRoutes({ company_id }));
      dispatch(fetchDepartments({ limit: 100 }));
      dispatch(fetchPlants({ limit: 100 }));
      dispatch(fetchAllEmployeeDetails({ company_id, limit: 2000 }));
    }
  }, [dispatch, company_id]);

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);
  const { departments } = useSelector((state) => state?.department);
  const { plants } = useSelector((state) => state?.plant);
  const { getAllEmployeeDetails } = useSelector((state) => state?.employee);

  const routeOptions =
    vehicleRoutes?.routes?.map((route) => ({ label: `Route  - ${route?.name || 'N/A'}`, value: route?.id })) || [];

  const busOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  const plantOptions = (plants || []).map((plant) => ({ label: plant.plant_name || 'N/A', value: plant.id }));

  const employeeOptions =
    getAllEmployeeDetails?.employes?.map((emp) => ({
      label: `${emp.employee_id} - ${emp.first_name}`,
      value: emp.employee_id,
    })) || [];

  const paginatedData = data.slice(page * limit, page * limit + limit);

  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
    busRoute: '',
    bus: '',
    department: '',
    employee: [],
    plants: [],
  });

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Add your form submission logic here
    const fromDate = filterData.fromDate ? moment(filterData.fromDate).format('YYYY-MM-DD HH:mm:ss') : '';
    const toDate = filterData.toDate ? moment(filterData.toDate).format('YYYY-MM-DD HH:mm:ss') : '';
    const formData = { ...filterData, fromDate, toDate };
    console.log('Form submitted', formData);
  };

  const handleFormReset = () => {
    setFilterData({
      fromDate: '',
      toDate: '',
      busRoute: '',
      bus: '',
      department: '',
      employee: [],
      plants: [],
    });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Arrival History Of Female Employees @ Destination</h1>
      </div>
      <FilterOption
        handleExport={handleExport}
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
        data={paginatedData}
        loading={false}
        error={null}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={data?.length}
      />
    </div>
  );
}

export default DestinationArrivalFemale;
