import moment from 'moment-timezone';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchSeatOccupancyReport } from '../../../redux/vehicleReportSlice';

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

  const { seatOccupancyReportData, loading, error } = useSelector((state) => state?.vehicleReport);

  useEffect(() => {
    dispatch(fetchSeatOccupancyReport({ page: page + 1 || 1, limit }));
  }, [dispatch, page, limit]);

  const rows = useMemo(() => {
    const raw = seatOccupancyReportData?.data;
    if (!raw || typeof raw !== 'object') return [];
    const vehicle = raw.vehicle;
    const driver = vehicle?.vehicle_driver;
    const route = vehicle?.Vehicle_Route?.[0];
    const totalSeats = '-';
    const noPunchEmployees = raw?.NoPunchLog?.Employee || [];
    return Object.entries(raw)
      .filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k))
      .map(([key, value]) => {
        const employees = value?.Employee || [];
        const totalAssigned = employees.length + noPunchEmployees.length;
        const totalOccupied = employees.filter(
          (emp) => emp.punch_log && emp.punch_log.some((log) => log.punch_status === true)
        ).length;
        return {
          date: moment(key).format('YYYY-MM-DD'),
          vehicleNo: vehicle?.vehicle_number || 'N/A',
          routeNo: route?.route_number || 'N/A',
          routeName: route?.name || 'N/A',
          driverName: `${driver?.first_name || ''} ${driver?.last_name || ''}`,
          driverNumber: driver?.phone_number || 'N/A',
          totalSeats,
          totalOccupied,
          totalOccupancyRate: totalAssigned > 0 ? Math.round((totalOccupied / totalAssigned) * 100) : 0,
        };
      });
  }, [seatOccupancyReportData]);

  const totalCount = rows.length;
  const tableData = rows.slice(page * limit, page * limit + limit);

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Seat Occupancy Report</h1>
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
