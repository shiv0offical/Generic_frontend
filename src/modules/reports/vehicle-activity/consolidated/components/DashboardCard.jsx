import React from "react";
import { Paper, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";

const DashboardCard = ({ title, value, color }) => {
  return (
    <Paper
      className="p-4 flex flex-col justify-between w-full h-15 rounded-lg shadow-md"
      style={{ backgroundColor: color }}
    >
      <div className="flex gap-2">
        <Typography variant="h4" className="text-white font-bold">
          {value}
        </Typography>
        <div>
          <Typography variant="body2" className="text-black">
            {title}
          </Typography>
          <Link
            className="text-[13px] text-white mt-[-10px] d-block"
            to="/master/vehicle"
          >
            More Info
          </Link>{" "}
          <ArrowForwardIcon sx={{ fontSize: "15px" }} className="text-white" />
        </div>
      </div>
    </Paper>
  );
};

export default DashboardCard;
