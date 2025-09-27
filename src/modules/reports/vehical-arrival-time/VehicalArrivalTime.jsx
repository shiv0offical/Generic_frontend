import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import CustomTab from '../vehicle-activity/components/CustomTab';
import { fetchVehicleArrivalData } from '../../../redux/vehicleReportSlice';
import FilterOption from '../../../components/FilterOption';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';

const tabs = [
  { name: 'First Shift', path: '/report/vehicle-arrival-time/1' },
  { name: 'Second Shift', path: '/report/vehicle-arrival-time/2' },
  { name: 'Third Shift', path: '/report/vehicle-arrival-time/3' },
];

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'vehicleNo', header: 'Vehicle Number' },
  { key: 'routeName', header: 'Route Details' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverNumber', header: 'Driver Number' },
  { key: 'targetArrivalTime', header: 'Target Arrival Time' },
  { key: 'actualArrivalTime', header: 'Actual Arrival Time' },
  { key: 'latLong', header: 'Lat-Long' },
  { key: 'gmap', header: 'Google-Map' },
];

function VehicalArrivalTime() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { VehicleArrivalTimeReport, loading, error } = useSelector((state) => state?.vehicleReport);

  useEffect(() => {
    dispatch(fetchVehicleArrivalData({ page: page + 1, limit }));
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

        if (route?.route_number) {
          routeNumber = route.route_number;
        }
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
  const [filterData, setFilterData] = useState({
    busRoute: '',
    fromDate: '',
    toDate: '',
  });
  const navigate = useNavigate();

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      vehicle_route_id: filterData.busRoute,
      start_time: filterData.fromDate,
      end_time: filterData.toDate,
    };
    dispatch(fetchVehicleArrivalData(payload)).then((res) => {
      console.log(res, 'res');
      if (res?.payload?.status == 200) {
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const data = Array.isArray(VehicleArrivalTimeReport?.data)
    ? VehicleArrivalTimeReport.data.map((item) => {
        const stops = item?.vehicle_route?.Vehicle_Route_Stops?.[0] || {};
        const driver = item?.vehicle_route?.vehicle?.vehicle_driver || {};
        const lat = stops.latitude || '';
        const lng = stops.longitude || '';
        return {
          date: item.arrival_time ? moment(item.arrival_time).format('YYYY-MM-DD') : 'N/A',
          vehicleNo: item?.vehicle_route?.vehicle?.vehicle_name || 'N/A',
          routeName: item?.vehicle_route?.name || 'N/A',
          driverName: driver?.name || 'N/A',
          driverNumber: driver?.phone_number || 'N/A',
          targetArrivalTime: stops.shifts?.start_time ? moment(stops.shifts.start_time).format('HH:mm') : 'N/A',
          actualArrivalTime: stops.shifts?.end_time ? moment(stops.shifts.end_time).format('HH:mm') : 'N/A',
          latLong: lat && lng ? `${lat}, ${lng}` : 'N/A',
          gmap:
            lat && lng ? (
              <a
                href={`https://maps.google.com/?q=${lat},${lng}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-700'>
                Google Map
              </a>
            ) : (
              'N/A'
            ),
        };
      })
    : [];

  const totalCount = VehicleArrivalTimeReport?.pagination?.total || 0;

  const handleFormReset = () => {
    setFilterData({ busRoute: '', interval: '', fromDate: '', toDate: '' });
  };

  const handleView = (row) => {
    navigate('/report/stoppage-report', { state: row });
    console.log('Viewing data...', row);
  };

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehical Arrival Time Report</h1>
      </div>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        busRouteNo={routeOptions}
      />
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={totalCount}
      />
    </div>
  );
}

export default VehicalArrivalTime;
