import { Link, useLocation } from 'react-router-dom';
import ReportTable from '../../../../components/table/ReportTable';

const columns = [
  { key: 'created_at', header: 'Date & Time' },
  { key: 'vehicleType', header: 'Vehicle Type' },
  {
    key: 'vehicle_number',
    header: 'Vehicle Number',
  },
  { key: 'routeDetail', header: 'Route Details' },
  {
    key: 'driverName',
    header: 'Driver Name',
    render: (_ignored, row) => {
      return `${row?.vehicle_driver?.first_name} ${row?.vehicle_driver?.last_name}`;
    },
  },
  { key: 'driverContact', header: 'Driver Contact Number' },
  { key: 'status', header: 'Status' },
  { key: 'top_speed', header: 'Speed' },
  { key: 'latLoong', header: 'Lat-Long' },
  { key: 'gmap', header: 'G-Map' },
  { key: 'odometer', header: 'Odometer' },
  { key: 'distance', header: 'Distance' },
];

function MovementDetail() {
  const location = useLocation();
  const rowData = location.state;
  console.log('rowData', rowData);
  const data = Array.isArray(rowData) ? rowData : [rowData];

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Movement Detail Report</h1>
        <div className='flex'>
          <Link to='/report/movement'>
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

export default MovementDetail;
