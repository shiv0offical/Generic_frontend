import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import timezone from 'dayjs/plugin/timezone';
import { ApiService } from '../../../services';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowLeftIcon from '@mui/icons-material/ArrowBackIos';

dayjs.extend(utc);
dayjs.extend(timezone);

const MheStatusPanel = ({ handleRightPanel, isShowPanel, vehicle }) => {
  const { vehicles } = useSelector((state) => state.vehicle);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [onBoard, setOnBoard] = useState(null);

  const companyId = localStorage.getItem('company_id');

  const selected_vehicle = vehicles?.data.filter((device) => device.id === vehicle?.id);

  useEffect(() => {
    console.log('🚀 ~ :16 ~ MheStatusPanel ~ selected_vehicle:', selected_vehicle[0].onboard_employee);

    console.log('thisssss', vehicle);
  }, [[selected_vehicle[0]].vehicle_name]);
  useEffect(() => {
    const nowInIST = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm');
    setCurrentDateTime(nowInIST);
  }, []);

  const fetchOnboardEmpData = async () => {
    const res = await ApiService.get(APIURL.PUNCHINMULTITRACK, {
      company_id: companyId,
      vehicle_name: selected_vehicle[0]?.vehicle_name,
    });

    if (res.success) {
      setOnBoard(res.data.onboard_employee);
    }
  };

  useEffect(() => {
    fetchOnboardEmpData();
  }, []);

  const devices = {
    id: selected_vehicle[0]?.id,
    name: selected_vehicle[0]?.vehicle_name,
    number: selected_vehicle[0]?.vehicle_number,
    // timestamp: new Date().toLocaleString(),
    lat: selected_vehicle[0]?.latitude || 0,
    lng: selected_vehicle[0]?.longitude || 0,
    seats: selected_vehicle[0]?.seats,
    speed: selected_vehicle[0]?.speed_limit,
    onboardEmp: onBoard,
    assignSeat: selected_vehicle[0]?.Vehicle_Route[0]?.total_assigned_seat,
    driverName: `${selected_vehicle[0]?.vehicle_driver?.first_name} ${selected_vehicle[0]?.vehicle_driver?.last_name}`,
    driverNum: selected_vehicle[0]?.vehicle_driver?.phone_number,
    routeName: selected_vehicle[0]?.Vehicle_Route[0]?.route_name,
  };

  const statusColorMap = {
    Running: '#008000',
    Idle: '#FFC107',
    Parked: '#FF0000',
    Offline: '#000DFF',
    New: '#808080',
    Unknown: '#000000',
  };

  return (
    <>
      <div
        className={`absolute transition-all top-5 ${
          isShowPanel ? 'right-0' : 'right-[-306px]'
        } w-[300px] rounded-md bg-white h-content z-[99999] shadow-md`}>
        <div>
          <div
            className={`absolute top-5 ${
              isShowPanel ? '-left-7.5' : 'left-0'
            } h-[30px] w-[30px] bg-[#1d31a6] cursor-pointer text-sm text-white rounded-tl-sm rounded-bl-sm flex items-center justify-center`}
            onClick={handleRightPanel}>
            {isShowPanel ? <ArrowRightIcon fontSize='small' /> : <ArrowLeftIcon fontSize='small' />}
          </div>
        </div>
        <div className='flex flex-col items-center justify-between border-b-1 border-gray-300 mt-3 mb-3'>
          <p className='font-semibold'>{devices.name}</p>
          <div className='flex justify-between w-full px-3 mt-3 mb-3'>
            <button
              className='px-2 text-white rounded-sm text-[12px] mb-2 py-1'
              style={{
                backgroundColor: statusColorMap[vehicle.status] || '#000',
              }}>
              {/* <button className="bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1"> */}
              {vehicle.status}
            </button>
            <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1'>
              {/* 2025-02-22 22:12 */}
              {currentDateTime}
            </button>
          </div>
        </div>
        <div className='details-panel'>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Bus Name :</p>
            <p className='text-sm'>{devices.name}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Vehicle Number :</p>
            <p className='text-sm'>{devices.number}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Route Name :</p>
            <p className='text-sm'>{devices.routeName}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Total Distance :</p>
            <p className='text-sm'>0.00 m</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Total Seats :</p>
            <p className='text-sm'>{devices.seats}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Total Assigned Seats :</p>
            <p className='text-sm'>{devices.assignSeat}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Total Onboarded Employee : </p>
            <p className='text-sm'>{devices.onboardEmp}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Speed : </p>
            <p className='text-sm'>{devices.speed}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Driver Name : </p>
            <p className='text-sm'>{devices.driverName}</p>
          </div>
          <div className='flex flex-row py-1 items-center justify-between px-3'>
            <p className='text-sm'>Driver Number : </p>
            <p className='text-sm'>{devices.driverNum}</p>
          </div>
          <div className='flex justify-center gap-3 mt-8 flex-row w-full px-3'>
            <Link to='/report/parked'>
              <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1 cursor-pointer'>
                Reports
              </button>
            </Link>
            <Link to='/master/vehicle'>
              <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1 cursor-pointer'>
                Route Detail
              </button>
            </Link>
            <Link to='/playback' state={{ selectedVehicle: selected_vehicle[0] }}>
              <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1 cursor-pointer'>
                Playback
              </button>
            </Link>
          </div>
          <div className='flex justify-center gap-3 mb-4 flex-row w-full px-3'>
            <Link to='/bus-multi-track/punch' state={{ selectedVehicle: selected_vehicle[0] }}>
              <button className='bg-[#080c27] px-2 text-white rounded-sm text-[12px] mb-2 py-1 cursor-pointer'>
                Employee Punch Report
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MheStatusPanel;
