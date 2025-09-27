import { useState } from 'react';
import ReportTable from '../../../../components/table/ReportTable';
import moment from 'moment-timezone';
import FilterOption from '../../../../components/FilterOption';

const columns = [
  { key: 'busName', header: 'Bus Name' },
  { key: 'imei', header: 'IMEI' },
  { key: 'speed', header: 'speed' },
  { key: 'latitude', header: 'Latitude' },
  { key: 'longitude', header: 'Longitude' },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (data) => (
      <a href={data} className='text-blue-700'>
        G-Map
      </a>
    ),
  },
  { key: 'date', header: 'Date' },
];

const data = [];

const buses = [
  { label: 'The Shawshank Redemption', value: '1' },
  { label: 'Department', value: '2' },
  { label: 'The Shawshank', value: '3' },
];

function MapHistory() {
  const [filterData, setFilterData] = useState({
    bus: '',
    interval: '',
  });

  const handleExport = () => {
    // Add your export logic here
    console.log('Exporting data...');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Add your form submission logic here
    const interval = moment(filterData.fromDate).format('YYYY-MM-DD');
    const formData = {
      ...filterData,
      interval,
    };
    console.log('Form submitted', formData);
  };

  const handleFormReset = () => {
    setFilterData({
      bus: '',
      interval: '',
    });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Map History</h1>
      </div>
      <FilterOption
        handleExport={handleExport}
        handleFormSubmit={handleFormSubmit}
        filterData={filterData}
        setFilterData={setFilterData}
        handleFormReset={handleFormReset}
        buses={buses}
        isDateTime
        dateField
      />
      <ReportTable columns={columns} data={data} />
    </div>
  );
}

export default MapHistory;
