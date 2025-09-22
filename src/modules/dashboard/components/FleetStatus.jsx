import { useSelector } from 'react-redux';
import movingVehicle from '../../../assets/moving_vehicle.svg';
import idleVehicle from '../../../assets/idle_vehicle.svg';
import parkedVehicle from '../../../assets/parked_vehicle.svg';

function FleetStatus() {
  const { runningDevices, idelDevices, parkedDevices } = useSelector((state) => state.multiTrackStatus);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full p-3'>
      <p className='block pb-3 text-sm'>Status of the fleet</p>
      <hr className='border border-gray-100' />
      <p className='block py-3 text-sm'>Currently, there are</p>
      <div className='my-4'>
        <div className='flex justify-between items-center'>
          <div className='w-1/3 flex flex-col items-center'>
            <img src={movingVehicle} alt='moving_vehicle' />
            <span className='block'>{runningDevices.length}</span>
            <p className='block text-sm'>Moving Vehicles</p>
          </div>
          <div className='w-1/3 flex flex-col items-center'>
            <img src={idleVehicle} alt='idle_vehicle' />
            <span className='block'>{idelDevices.length}</span>
            <p className='block text-sm'>Idle Vehicles</p>
          </div>
          <div className='w-1/3 flex flex-col items-center'>
            <img src={parkedVehicle} alt='parked_vehicle' />
            <span className='block'>{parkedDevices.length}</span>
            <p className='block text-sm'>Parked Vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FleetStatus;
