import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DistanceCoveredBarChart from '../charts/DistanceCoveredBarChart';
import { fetchDistanceCoverData } from '../actions/distanceCoverAction';

function DistanceCoveredStats() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((state) => state.distanceCoverStatus);

  useEffect(() => {
    const getData = async () => await fetchDistanceCoverData(dispatch);
    getData();
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full p-3'>
      <DistanceCoveredBarChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Distance Covered'
      />
    </div>
  );
}

export default DistanceCoveredStats;
