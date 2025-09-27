import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchSeatOccupancyReport } from '../../../redux/vehicleReportSlice';
import { toast } from 'react-toastify';

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'vehicleNo', header: 'Vehicle Number' },
  { key: 'routeName', header: 'Route Detail' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'driverNumber', header: 'Driver Number' },
  { key: 'totalSeats', header: 'Total Seats' },
  { key: 'totalOccupied', header: 'Occupied' },
  { key: 'totalOccupancyRate', header: 'Occupancy Rate' },
];

function SeatOccupancy() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const company_id = localStorage.getItem('company_id');

  const { seatOccupancyReportData, loading, error } = useSelector((state) => state?.vehicleReport);

  useEffect(() => {
    dispatch(fetchSeatOccupancyReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const tableData = Array.isArray(seatOccupancyReportData?.data)
    ? seatOccupancyReportData.data.map((item) => ({
        date: item.date ? moment(item.date).format('YYYY-MM-DD') : '-',
        vehicleNo: item.vehicle?.vehicle_number || 'N/A',
        routeName: item.vehicle?.Vehicle_Route?.[0]?.name || 'N/A',
        driverName: `${item.vehicle?.vehicle_driver?.first_name || ''} ${
          item.vehicle?.vehicle_driver?.last_name || ''
        }`,
        driverNumber: item.vehicle?.vehicle_driver?.phone_number || 'N/A',
        totalSeats: item.vehicle?.total_seats ?? '-',
        totalOccupied: typeof item.totalOccupied === 'number' ? item.totalOccupied : '-',
        totalOccupancyRate:
          typeof item.totalAssigned === 'number' && item.totalAssigned > 0 && typeof item.totalOccupied === 'number'
            ? Math.round((item.totalOccupied / item.totalAssigned) * 100)
            : 0,
      }))
    : [];

  const totalCount = seatOccupancyReportData?.pagination?.total || 0;

  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id }));
  }, [dispatch, company_id]);

  const { vehicleRoutes } = useSelector((state) => state?.vehicleRoute);

  const routeOptions = Array.isArray(vehicleRoutes?.routes)
    ? vehicleRoutes.routes.map((route) => {
        const vehicleNumber = route?.vehicle?.vehicle_number || route?.route_number || 'N/A';
        const routeName = route?.name || 'N/A';
        return { label: `Route ${vehicleNumber} - ${routeName}`, value: route?.id };
      })
    : [];

  const [filterData, setFilterData] = useState({ busRouteNo: '', fromDate: '', toDate: '' });

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const payload = {
      company_id,
      route_id: filterData.busRouteNo,
      start: filterData.fromDate,
      end: filterData.toDate,
    };

    dispatch(fetchSeatOccupancyReport(payload)).then((res) => {
      if (res?.payload?.status == 200) {
        toast.success(res?.payload?.message);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ busRouteNo: '', fromDate: '', toDate: '' });
  };

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Seat Occupancy Report</h1>
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
        data={tableData}
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

export default SeatOccupancy;
