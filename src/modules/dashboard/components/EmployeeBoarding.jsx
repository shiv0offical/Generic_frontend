import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmpBoardingData } from '../actions/empBoardingAction';
import EmployeeBoardingBarChart from '../charts/EmployeeBoardingBarChart';

function EmployeeBoarding() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((state) => state.empBoardingStatus);

  useEffect(() => {
    fetchEmpBoardingData(dispatch);
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full p-3'>
      <EmployeeBoardingBarChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Employee Boarding'
      />
    </div>
  );
}

export default EmployeeBoarding;
