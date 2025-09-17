import Chart from 'react-apexcharts';

const SpeedChart = ({ rowData }) => {
  if (!rowData) return null;

  const { date, maxSpeedTime, maxSpeed, vehicleNo } = rowData;

  function combineDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return new Date().toISOString();

    const datePart = dateStr.split(' ')[0]; // e.g. "2025-05-29"
    const formattedTime = convertTo24HrFormat(timeStr); // e.g. "14:16:00"
    return new Date(`${datePart}T${formattedTime}`).toISOString(); // "2025-05-29T14:16:00Z"
  }

  function convertTo24HrFormat(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }

  const xTime = combineDateTime(date, maxSpeedTime);

  const options = {
    chart: { type: 'line', zoom: { enabled: false }, background: '#f6faeb' },
    title: { text: 'Speed Over Time', align: 'center' },
    xaxis: { type: 'datetime', title: { text: 'Time' }, labels: { format: 'dd MMM' } },
    yaxis: { title: { text: 'Speed (km/h)' }, min: 60, max: 110 },
    stroke: { curve: 'straight', width: 2 },
    tooltip: { x: { format: 'dd MMM' } },
    colors: ['#007bff'],
  };

  const series = [{ name: vehicleNo || 'Vehicle', data: [{ x: xTime, y: maxSpeed || 0 }] }];

  return (
    <div style={{ padding: '20px', background: '#FFF', borderRadius: '10px' }}>
      <Chart options={options} series={series} type='line' height={300} />
      <button
        style={{
          marginTop: '10px',
          backgroundColor: '#003366',
          color: '#fff',
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => console.log('Export to PDF')}>
        PDF
      </button>
    </div>
  );
};

export default SpeedChart;
