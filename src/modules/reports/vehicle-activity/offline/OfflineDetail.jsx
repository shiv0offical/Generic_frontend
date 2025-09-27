import { Link, useLocation } from 'react-router-dom';
import ReportTable from '../../../../components/table/ReportTable';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';

  const dateObj = new Date(isoString);

  const date = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const time = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${date} ${time}`;
};
const columns = [
  {
    key: 'created_at',
    header: 'Date & Time',
    render: (_ignored, row) => {
      return formatDateTime(row?.created_at);
    },
  },
  {
    key: 'vehicleType',
    header: 'Vehicle Type',
    render: (_ignored, row) => {
      const data = row?.vehicle_type || '';
      return `${data}`.trim() || '';
    },
  },
  {
    key: 'vehicleNumber',
    header: 'Vehicle Number',
    render: (_ignored, row) => {
      const first = row?.vehicle_number || '';
      return `${first}`.trim() || '';
    },
  },
  {
    key: 'Vehicle_Route',
    header: 'Route Details',
    render: (_ignored, row) => {
      const routeDetails = row?.Vehicle_Route?.route_number || row?.Vehicle_Route?.route_name || '';
      return `${routeDetails}`.trim() || '';
    },
  },
  {
    key: 'vehicle_driver',
    header: 'Driver Name',
    render: (_ignored, row) => {
      const firstName = row?.vehicle_driver?.first_name;
      const lastName = row?.vehicle_driver?.last_name;

      return `${firstName}  ${lastName}`;
    },
  },
  {
    key: 'driverContact',
    header: 'Driver Contact Number',
    render: (_ignored, row) => {
      const contact = row.vehicle_driver?.phone_number;
      return `${contact}` || '';
    },
  },
  {
    key: 'startTime',
    header: 'Start Time',
    render: (_ignored, row) => {
      const start_time = formatDate(row.start_time);
      return `${start_time}`.trim() || '';
    },
  },
  {
    key: 'end_time',
    header: 'End Time',
    render: (_ignored, row) => {
      const end_time = formatDate(row.end_time);
      return `${end_time}`.trim() || '';
    },
  },

  { key: 'noOfIdle', header: 'Duration' },
  { key: 'noOfIdle', header: 'Lat-Long' },
  { key: 'noOfIdle', header: 'G-Map' },
];

function OfflineDetail() {
  const location = useLocation();
  const rowData = location.state;

  const data = Array.isArray(rowData) ? rowData : [rowData];

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Offline Detail Report</h1>
        <div className='flex'>
          <Link to='/report/idle'>
            <button
              type='button'
              className='text-white bg-[#07163d] hover:bg-[#07163d] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer'>
              Back
            </button>
          </Link>
          <button
            type='button'
            className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer'
            onClick={handleExport}>
            Export
          </button>
        </div>
      </div>
      <ReportTable columns={columns} data={data} />
    </div>
  );
}

export default OfflineDetail;
