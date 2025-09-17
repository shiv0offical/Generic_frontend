import React, { useEffect } from "react";
import DistanceCoveredBarChart from "../charts/DistanceCoveredBarChart";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistanceCoverData } from "../actions/distanceCoverAction";

function DistanceCoveredStats() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector(
    (state) => state.distanceCoverStatus
  );

  useEffect(() => {
    const getData = async () => {
      await fetchDistanceCoverData(dispatch);
    };
    getData();
  }, [dispatch]);

  return (
    <div className="shadow-sm rounded-sm bg-white w-full p-3">
      <DistanceCoveredBarChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        // previousData={[1, 2, 3, 4, 5, 6, 7]}
        // currentData={[1, 2, 3, 2, 3, 4, 7]}
        // categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        text="Distance Covered"
      />
    </div>
  );
}

export default DistanceCoveredStats;
