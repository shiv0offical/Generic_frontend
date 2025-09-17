import React from "react";
import ReactApexChart from "react-apexcharts";

const OverspeedViolationLineChart = ({
  previousData,
  currentData,
  categories,
  text,
}) => {
  const options = {
    chart: {
      id: "line",
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Week",
        style: {
          fontWeight: "normal",
          fontSize: "14px",
        },
      },
    },
    title: {
      text: text,
      align: "left",
      style: {
        fontWeight: "normal",
        fontSize: "14px",
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
    },
    legend: {
      position: "top",
    },
  };

  const series = [
    {
      name: "Previous",
      data: previousData,
      color: "#4285f4",
    },
    {
      name: "Current",
      data: currentData,
      color: "#db4437",
    },
  ];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={235}
    />
  );
};

export default OverspeedViolationLineChart;
