import moment from 'moment';
import Chart from 'react-apexcharts';

const OverSpeedChart = ({ data }) => {
  const vehicleMap = {};

  (data?.data || []).forEach((item) => {
    const vehicleNo = item?.vehicle?.vehicle_number || 'Unknown Vehicle';
    const time = item?.entry_time || null;
    const speed = item?.max_speed || 0;

    if (!vehicleMap[vehicleNo]) vehicleMap[vehicleNo] = [];
    if (time) vehicleMap[vehicleNo].push({ x: moment(time).toISOString(), y: speed });
  });

  const series = Object.keys(vehicleMap).map((vehicleNo) => ({ name: vehicleNo, data: vehicleMap[vehicleNo] }));
  const options = {
    chart: { type: 'line', zoom: { enabled: false } },
    title: { text: 'Overspeed', align: 'center' },
    xaxis: { type: 'datetime', categories: ['2025-02-19T01:00:00', '2025-02-19T02:00:00', '2025-02-19T03:00:00'] },
    yaxis: { title: { text: 'Speed (km/h)' } },
    markers: { size: 6 },
    stroke: { curve: 'smooth', width: 2 },
    legend: { position: 'bottom' },
  };

  // const series = [
  //   {
  //     name: "TN67E5768",
  //     data: [88, 96, 84],
  //     color: "#007bff",
  //   },
  //   {
  //     name: "TN87E5678",
  //     data: [79, 80, 82],
  //     color: "#00c49f",
  //   },
  // ];

  return (
    <div>
      <Chart options={options} series={series} type='line' height={350} />
    </div>
  );
};

export default OverSpeedChart;
