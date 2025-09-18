import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchPuchLogReport } from '../../../redux/punchInOutSlice';

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

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Punch Timelog Report</h1>
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
