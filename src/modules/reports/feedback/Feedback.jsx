import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchFeedbackReport } from '../../../redux/feedBackReportSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { toast } from 'react-toastify';

const columns = [
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'givenRating', header: 'Given Rating' },
  { key: 'review', header: 'Review' },
  { key: 'dateTime', header: 'Date Time' },
];

function Feedback() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { feedbackReportData, loading, error } = useSelector((state) => state?.feedbackReport);

  useEffect(() => {
    dispatch(fetchFeedbackReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const company_id = localStorage.getItem('company_id');
  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id }));
  }, [dispatch, company_id]);
  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  const routeOptions = Array.isArray(vehicleRoutes)
    ? vehicleRoutes.map((route) => {
        let routeNumber = 'N/A';
        let routeName = 'N/A';

        if (route?.route_number) routeNumber = route.route_number;
        // Check if it exists in the first employee's vehicleRoute
        else if (route?.Employee?.[0]?.vehicleRoute?.route_number) {
          routeNumber = route.Employee[0].vehicleRoute.route_number;
        }

        // Get route name
        if (route?.name) {
          routeName = route.name;
        } else if (route?.Employee?.[0]?.vehicleRoute?.name) {
          routeName = route.Employee[0].vehicleRoute.name;
        }

        return {
          label: `Route ${routeNumber} - ${routeName}`,
          value: route?.id,
        };
      })
    : [];

  const tableData = Array.isArray(feedbackReportData?.feedbacks)
    ? feedbackReportData.feedbacks.map((item) => ({
        employeeName: item.employee
          ? [item.employee.first_name, item.employee.last_name].filter(Boolean).join(' ')
          : '',
        givenRating: typeof item.rating === 'number' ? item.rating.toFixed(1) : '',
        review: item.message || '',
        dateTime: item.created_at ? moment(item.created_at).format('YYYY-MM-DD hh:mm A') : '',
      }))
    : [];

  const [filterData, setFilterData] = useState({
    busRoute: '',
    fromDate: '',
    toDate: '',
  });

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
    setFilterData({
      busRoute: '',
      fromDate: '',
      toDate: '',
    });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>
        Feedback Report (Total: {feedbackReportData?.pagination?.total || 0})
      </h1>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        busRoutes={routeOptions}
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
