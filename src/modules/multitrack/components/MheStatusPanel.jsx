import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
// import { APIURL } from '../../../constants';
// import { ApiService } from '../../../services';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowLeftIcon from '@mui/icons-material/ArrowBackIos';

dayjs.extend(utc);
dayjs.extend(timezone);

const statusColorMap = {
  Running: '#008000',
  Idle: '#FFC107',
  Parked: '#FF0000',
  Offline: '#000DFF',
  New: '#808080',
  Unknown: '#000000',
};

const MheStatusPanel = ({ handleRightPanel, isShowPanel, vehicle }) => {
  const { vehicles } = useSelector((state) => state.vehicle);
  const [currentDateTime, setCurrentDateTime] = useState('');
  // const [onBoard, setOnBoard] = useState(null);

  // const companyId = localStorage.getItem('company_id');
  const selected_vehicle = vehicles?.data.find((v) => v.id === vehicle?.id);

  useEffect(() => {
    setCurrentDateTime(dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm'));
  }, []);

  // useEffect(() => {
  //   if (!selected_vehicle) return;
  //   const fetchOnboardEmpData = async () => {
  //     const res = await ApiService.get(APIURL.PUNCHINMULTITRACK, {
  //       company_id: companyId,
  //       vehicle_name: selected_vehicle.vehicle_name,
  //     });
  //     if (res.success) setOnBoard(res.data.onboard_employee);
  //   };
  //   fetchOnboardEmpData();
  // }, [selected_vehicle, companyId]);

  const devices = {
    id: selected_vehicle?.id,
    name: selected_vehicle?.vehicle_name,
    number: selected_vehicle?.vehicle_number,
    lat: selected_vehicle?.latitude || 0,
    lng: selected_vehicle?.longitude || 0,
    seats: selected_vehicle?.seats,
    speed: selected_vehicle?.speed_limit,
    onboardEmp: 2,
    assignSeat: selected_vehicle?.routes?.[0]?.total_assigned_seat,
    driverName: `${selected_vehicle?.driver?.first_name || ''} ${selected_vehicle?.driver?.last_name || ''}`,
    driverNum: selected_vehicle?.driver?.phone_number,
    routeName: selected_vehicle?.routes?.[0]?.route_name,
  };

  return (
    <div
      className={`absolute transition-all top-5 ${isShowPanel ? 'right-0' : 'right-[-306px]'} 
      w-[300px] rounded-md bg-white z-[99999] shadow-md`}>
      {/* toggle button */}
      <div
        className={`absolute top-5 ${isShowPanel ? '-left-7.5' : 'left-0'} h-[30px] w-[30px] 
        bg-[#1d31a6] cursor-pointer text-white flex items-center justify-center`}
        onClick={handleRightPanel}>
        {isShowPanel ? <ArrowRightIcon fontSize='small' /> : <ArrowLeftIcon fontSize='small' />}
      </div>

      {/* header */}
      <div className='flex flex-col items-center border-b border-gray-300 mt-3 mb-3'>
        <p className='font-semibold'>{devices.name}</p>
        <div className='flex justify-between w-full px-3 mt-3 mb-3'>
          <button
            className='px-2 text-white rounded-sm text-[12px] py-1'
            style={{ backgroundColor: statusColorMap[vehicle.status] || '#000' }}>
            {vehicle.status}
          </button>
          <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] py-1'>{currentDateTime}</button>
        </div>
      </div>

      {/* details */}
      <div className='details-panel'>
        {[
          ['Bus Name', devices.name],
          ['Vehicle Number', devices.number],
          ['Route Name', devices.routeName],
          ['Total Distance', '0.00 m'],
          ['Total Seats', devices.seats],
          ['Assigned Seats', devices.assignSeat],
          ['Onboarded Employee', devices.onboardEmp],
          ['Speed', devices.speed],
          ['Driver Name', devices.driverName],
          ['Driver Number', devices.driverNum],
        ].map(([label, value]) => (
          <div key={label} className='flex justify-between py-1 px-3 text-sm'>
            <p>{label} :</p>
            <p>{value || '-'}</p>
          </div>
        ))}

        {/* buttons */}
        <div className='flex justify-center gap-3 mt-8 flex-row w-full px-3 flex-wrap'>
          <Link to='/report/parked'>
            <Btn>Reports</Btn>
          </Link>
          <Link to='/master/vehicle'>
            <Btn>Route Detail</Btn>
          </Link>
          <Link to='/playback' state={{ selectedVehicle: selected_vehicle }}>
            <Btn>Playback</Btn>
          </Link>
          <Link to='/bus-multi-track/punch' state={{ selectedVehicle: selected_vehicle }}>
            <Btn>Employee Punch Report</Btn>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Btn = ({ children }) => (
  <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] py-1 cursor-pointer'>{children}</button>
);

export default MheStatusPanel;
