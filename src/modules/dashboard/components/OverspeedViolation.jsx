import React, { useEffect } from "react";
import OverspeedViolationLineChart from "../charts/OverspeedViolationLineChart";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverspeedData } from "../actions/overspeedAction";

function OverspeedViolation() {
  const dispatch = useDispatch();

  const { previousData, currentData, days } = useSelector(
    (state) => state.overspeedStatus
  );

  useEffect(() => {
    fetchOverspeedData(dispatch);
  }, [dispatch]);

  return (
    <div className="shadow-sm rounded-sm bg-white w-full p-3">
      <OverspeedViolationLineChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text="Overspeed Violation"
      />
    </div>
  );
}

export default OverspeedViolation;
