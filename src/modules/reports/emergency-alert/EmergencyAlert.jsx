import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchEmergencyReportAlert } from '../../../redux/emergencyReportAlertSlice';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

const columns = [
  { key: 'date', header: 'Date', render: (_ignored, row) => formatDate(row?.date) },
  { key: 'vehicleNo', header: 'Vehicle Number' },
  { key: 'routeNo', header: 'Route Number' },
  { key: 'route_name', header: 'Route Name' },
  { key: 'driverName', header: 'Driver Name' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'plant', header: 'Plant' },
  { key: 'department', header: 'Department' },
  {
    key: 'location',
    header: 'Location',
    render: (_i, row) => (row?.latitude && row?.longitude ? `${row.latitude}, ${row.longitude}` : ''),
  },
  {
    key: 'gmap',
    header: 'Google-map',
    render: (value) =>
      value ? (
        <a href={value} target='_blank' className='text-blue-700' rel='noopener noreferrer'>
          Google Map
        </a>
      ) : (
        ''
      ),
  },
  { key: 'issuedRaised', header: 'Issued Raised' },
  { key: 'actionNote', header: 'Action Note' },
  { key: 'updated_at', header: 'Update Date' },
];

function EmergencyAlert() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { emergencyReportAlertData, loading, error } = useSelector((state) => state?.emergencyReportAlert);

  useEffect(() => {
    dispatch(fetchEmergencyReportAlert({ page: page + 1 || 1, limit }));
  }, [dispatch, page, limit]);

  const tableData = Array.isArray(emergencyReportAlertData?.data)
    ? emergencyReportAlertData.data.map((item) => {
        const latitude = item.latitude ?? '';
        const longitude = item.longitude ?? '';
        return {
          vehicleNo: item.vehicle_number || 'N/A',
          routeNo: item.route_number || 'N/A',
          route_name: item.name || '-',
          driverName: item.driver?.name || '-',
          employeeName: item.employe?.name || '-',
          plant: item.plant_name || '',
          department: item.department_name || '-',
          latitude,
          longitude,
          location: latitude && longitude ? `${latitude}, ${longitude}` : '',
          gmap: latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : '',
          issuedRaised: item.title,
          actionNote: item.action_taken,
          date: item.created_at ? moment(item.created_at).format('YYYY-MM-DD hh:mm A') : '',
          updated_at: item.updated_at ? moment(item.updated_at).format('YYYY-MM-DD hh:mm A') : '',
        };
      })
    : [];

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Emergency Alerts Report</h1>
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
        totalCount={emergencyReportAlertData?.pagination?.total}
      />
    </div>
  );
}

export default EmergencyAlert;
