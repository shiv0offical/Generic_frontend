import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import CustomTab from '../vehicle-activity/components/CustomTab';
import { fetchVehicleArrivalData } from '../../../redux/vehicleReportSlice';

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

  useEffect(() => {
    dispatch(fetchVehicleArrivalData({ page: page + 1 || 1, limit }));
  }, [dispatch, page, limit]);

  const { VehicleArrivalTimeReport, loading, error } = useSelector((state) => state?.vehicleReport);

  const rows = Array.isArray(VehicleArrivalTimeReport?.data)
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

  return (
    <div className='w-full h-full p-2'>
      <CustomTab tabs={tabs} />
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehical Arrival Time Report</h1>
      </div>
      <ReportTable
        columns={columns}
        data={rows.slice(page * limit, page * limit + limit)}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={rows.length}
      />
    </div>
  );
}

export default VehicalArrivalTime;
