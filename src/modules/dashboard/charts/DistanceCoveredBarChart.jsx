import ReactApexChart from 'react-apexcharts';

function DistanceCoveredBarChart({ previousData, currentData, categories, text }) {
  const options = {
    chart: { id: 'basic-bar' },
    xaxis: { categories: categories, title: { text: 'Week', style: { fontWeight: 'normal', fontSize: '14px' } } },
    title: { text: text, align: 'left', style: { fontWeight: 'normal', fontSize: '14px' } },
    legend: { position: 'top' },
    plotOptions: { bar: { borderRadius: 3, borderRadiusApplication: 'end', columnWidth: '50%' } },
    dataLabels: { enabled: false },
    yaxis: { title: { text: 'Distance (km)' } },
  };

  const series = [
    { name: 'Previous', data: previousData, color: '#4285f4' },
    { name: 'Current', data: currentData, color: '#db4437' },
  ];
  return <ReactApexChart options={options} series={series} type='bar' height={185} />;
}

export default DistanceCoveredBarChart;
