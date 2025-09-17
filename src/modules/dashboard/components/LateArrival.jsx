import React, { useEffect } from "react";
import LateArrivalLineChart from "../charts/LateArrivalLineChart";
import { useDispatch, useSelector } from "react-redux";
import { fetchLateArrivalData } from "../actions/lateArrivalAction";

function LateArrival() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector(
    (state) => state.lateArrivalStatus
  );

  useEffect(() => {
    fetchLateArrivalData(dispatch);
  }, [dispatch]);

  return (
    <div className="shadow-sm rounded-sm bg-white w-full p-3">
      <LateArrivalLineChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text="Late Arrival"
      />
    </div>
  );
}

export default LateArrival;
