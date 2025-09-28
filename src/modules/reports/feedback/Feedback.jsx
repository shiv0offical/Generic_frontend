import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchFeedbackReport } from '../../../redux/feedBackReportSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'vehicleNumber', header: 'Vehicle Number' },
  { key: 'routeDetails', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverNumber', header: 'Driver Number' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'employeeId', header: 'Employee Id' },
  { key: 'givenScore', header: 'Given Score' },
  { key: 'feedback', header: 'Feedback' },
];

function Feedback() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const company_id = localStorage.getItem('company_id');

  const { feedbackReportData, loading, error } = useSelector((state) => state?.feedbackReport);

  useEffect(() => {
    dispatch(fetchFeedbackReport({ page: page + 1, limit }));
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
  }, [dispatch, page, limit, company_id]);

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

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

  const tableData = Array.isArray(feedbackReportData?.feedbacks)
    ? feedbackReportData.feedbacks.map((item) => ({
        date: item.created_at ? moment(item.created_at).format('YYYY-MM-DD HH:mm:ss') : '',
        vehicleNumber: item.vehicle?.vehicle_number || '',
        routeDetails: item.route?.name || '',
        driverName: item.driver ? [item.driver.first_name, item.driver.last_name].filter(Boolean).join(' ') : '',
        driverNumber: item.driver?.phone_number || '',
        employeeName: item.employee
          ? [item.employee.first_name, item.employee.last_name].filter(Boolean).join(' ')
          : '',
        employeeId: item.employee_id || '',
        givenScore: typeof item.rating === 'number' ? item.rating.toFixed(1) : '',
        feedback: item.message || '',
      }))
    : [];

  const [filterData, setFilterData] = useState({ busRoute: '', fromDate: '', toDate: '' });

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      route_id: filterData.busRoute,
      start: filterData.fromDate,
      end: filterData.toDate,
    };
    dispatch(fetchFeedbackReport(payload)).then((res) => {
      if (res?.payload?.status == 200) {
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ busRoute: '', fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold text-[#07163d]'>
          Feedback Report (Total: {feedbackReportData?.pagination?.total || 0})
        </h1>
      </div>
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
        totalCount={feedbackReportData?.pagination?.total || 0}
      />
    </div>
  );
}

export default Feedback;
