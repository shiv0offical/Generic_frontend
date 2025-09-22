import { useEffect } from 'react';
import LateArrival from './components/LateArrival';
import FleetStatus from './components/FleetStatus';
import CounterCard from './components/CounterCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../../redux/vehicleSlice';
import DepartmentStats from './components/DepartmentStats';
import EmployeeBoarding from './components/EmployeeBoarding';
import DistanceCoveredStats from './components/DistanceCoveredStats';
import OverspeedViolation from './components/OverspeedViolation';
import { setProcessedVehicles } from '../../redux/multiTrackSlice';

function Dashboard() {
  const dispatch = useDispatch();

  const { vehicles } = useSelector((state) => state.vehicle);

  const { runningDevices } = useSelector((state) => state.multiTrackStatus);

  useEffect(() => {
    const fetchData = async () => dispatch(fetchVehicles({ company_id: localStorage.getItem('company_id') }));
    fetchData();
  }, []);

  useEffect(() => {
    if (vehicles?.data?.length > 0) dispatch(setProcessedVehicles(vehicles.data));
  }, [vehicles, dispatch]);

  return (
    <div className='w-full h-full p-2'>
      <CounterCard runningDevices={runningDevices} />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        <div className='w-full'>
          <FleetStatus />
        </div>
        <div className='w-full'>
          <EmployeeBoarding />
        </div>
        <div className='w-full'>
          <DistanceCoveredStats />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        <div className='w-full'>
          <DepartmentStats />
        </div>
        <div className='w-full'>
          <LateArrival />
        </div>
        <div className='w-full'>
          <OverspeedViolation />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
