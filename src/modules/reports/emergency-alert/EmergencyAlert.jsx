import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchEmergencyReportAlert } from '../../../redux/emergencyReportAlertSlice';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

const columns = [
  { key: 'date', header: 'Date', render: (_ignored, row) => formatDate(row?.date) },
  { key: 'vehicleNo', header: 'Vehicle Number' },
  { key: 'routeDetails', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverNumber', header: 'Driver Number' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'employeeId', header: 'Employee ID' },
  { key: 'plant', header: 'Plant' },
  { key: 'department', header: 'Department' },
  {
    key: 'latlong',
    header: 'Lat-Long',
    render: (_i, row) => (row?.latitude && row?.longitude ? `${row.latitude}, ${row.longitude}` : ''),
  },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (value) =>
      value ? (
        <a href={value} target='_blank' className='text-blue-700' rel='noopener noreferrer'>
          G-Map
        </a>
      ) : (
        ''
      ),
  },
  { key: 'issuedRaised', header: 'Issue Raised' },
  { key: 'actionNote', header: 'Action Note' },
  { key: 'updated_at', header: 'Update Date', render: (_ignored, row) => formatDate(row?.updated_at) },
];

function EmergencyAlert() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const company_id = localStorage.getItem('company_id');

  const { emergencyReportAlertData, loading, error } = useSelector((state) => state?.emergencyReportAlert);
  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  useEffect(() => {
    dispatch(fetchEmergencyReportAlert({ page: page + 1, limit }));
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
  }, [dispatch, page, limit, company_id]);

  const vehicleOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Vehicle - ${route?.vehicle?.vehicle_number || 'N/A'}`,
      value: route?.id,
    })) || [];

  const routeOptions =
    vehicleRoutes?.routes?.map((route) => ({
      label: `Route  - ${route?.name || 'N/A'}`,
      value: route?.id,
    })) || [];

  const tableData = Array.isArray(emergencyReportAlertData?.data)
    ? emergencyReportAlertData.data.map((item) => {
        const latitude = item.latitude ?? '';
        const longitude = item.longitude ?? '';
        return {
          date: item.created_at ? item.created_at : '',
          vehicleNo: item.vehicle_number || '',
          // Show route name in routeDetails
          routeDetails: item.name || '',
          driverName: item.driver?.name || '',
          driverNumber: item.driver?.mobile || '', // keep driver number
          employeeName: item.employe?.name || '',
          employeeId: item.employe?.id || '',
          plant: item.plant_name || '',
          department: item.department_name || '',
          latitude,
          longitude,
          latlong: latitude && longitude ? `${latitude}, ${longitude}` : '',
          gmap: latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : '',
          issuedRaised: item.title || '',
          actionNote: item.action_taken || '',
          updated_at: item.updated_at ? item.updated_at : '',
        };
      })
    : [];

  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
  });

  const handleExport = () => {
    // Add your export logic here
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      start: filterData.fromDate ? new Date(filterData.fromDate).toISOString() : '',
      end: filterData.toDate ? new Date(filterData.toDate).toISOString() : '',
    };
    dispatch(fetchEmergencyReportAlert(payload));
  };

  const handleFormReset = () => {
    setFilterData({
      fromDate: '',
      toDate: '',
    });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>
        Emergency Alerts Report (Total: {emergencyReportAlertData?.pagination?.total ?? 0})
      </h1>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        routes={routeOptions}
        buses={vehicleOptions}
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
        totalCount={emergencyReportAlertData?.pagination?.total ?? 0}
      />
    </div>
  );
}

export default EmergencyAlert;
