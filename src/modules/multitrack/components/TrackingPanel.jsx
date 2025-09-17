import { CheckBox } from '@mui/icons-material';
import ArrowLeftIcon from '@mui/icons-material/ArrowBackIos';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useMemo, useState } from 'react';
import { FaBatteryFull, FaBolt, FaKey, FaWifi } from 'react-icons/fa';
import ISearch from './ISearch';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setIsTrackShow, setProcessedVehicles } from '../../../redux/multiTrackSlice';

const TrackingPanel = ({ handleRightPanel }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const { vehicles, newDevices } = useSelector((state) => state.vehicle);

  //from redux
  const { runningDevices, parkedDevices, idelDevices, devices, activeTab, offlineVehicleData, isTrackShow } =
    useSelector((state) => state.multiTrackStatus);

  useEffect(() => {
    if (vehicles.data?.length > 0) {
      dispatch(setProcessedVehicles(vehicles.data));
    }
  }, [vehicles]);

  const vehicleStatus = [
    {
      label: 'Running',
      count: runningDevices.length,
      bg: '#00800026',
      color: 'green',
    },
    {
      label: 'Idle',
      count: idelDevices.length,
      bg: '#FFC10726',
      color: '#ce9a00',
    },
    {
      label: 'Parked',
      count: parkedDevices.length,
      bg: '#FF000026',
      color: 'red',
    },
    {
      label: 'Offline',
      count: offlineVehicleData.length,
      bg: '#000DFF26',
      color: 'blue',
    },
    { label: 'New', count: newDevices.length, bg: '#ececec', color: 'gray' },
    {
      label: 'All',
      count: vehicles.data ? vehicles.data.length : devices.length,
      bg: '#d9d9d9',
      color: 'black',
    },
  ];

  const filteredDevices = useMemo(() => {
    switch (activeTab) {
      case 'Running':
        return runningDevices;
      case 'Idle':
        return idelDevices;
      case 'Parked':
        return parkedDevices;
      case 'New':
        return newDevices;
      case 'Offline':
        return offlineVehicleData;
      case 'All':
        return devices;
      default:
        return [];
    }
  }, [activeTab, runningDevices, idelDevices, parkedDevices, newDevices, devices]);

  const handleSearch = (e) => {
    let value = e.target.value;
    setSearchQuery(value);
  };

  const filteredResult = useMemo(() => {
    if (!searchQuery) return filteredDevices;

    const search = searchQuery.toLowerCase();

    return filteredDevices.filter((vehicle) => vehicle.vehicle_name.toLowerCase().includes(search));
  }, [searchQuery, filteredDevices]);

  return (
    <>
      <div
        className={`absolute transition-all top-0 ${
          isTrackShow ? '-left-[452px]' : 'left-0'
        } w-[452px] rounded-md bg-white h-[calc(100vh-60px)] p-3 z-[99999]`}>
        <div
          className='absolute top-10 -right-5 h-14 bg-[#FFF] cursor-pointer rounded-tr-lg rounded-br-lg text-4xl flex items-center justify-center'
          onClick={() => dispatch(setIsTrackShow(!isTrackShow))}>
          {/* <div
          className="absolute top-10 -right-5 h-14 overflow-scroll bg-[#FFF] cursor-pointer rounded-tr-lg rounded-br-lg text-4xl flex items-center justify-center"
          onClick={() => setIsTrackShow(!isTrackShow)}
        > */}
          {isTrackShow ? <ArrowRightIcon /> : <ArrowLeftIcon />}
        </div>
        <div className='w-full rounded-sm overflow-hidden mb-2 flex justify-between items-center relative'>
          <div className='flex flex-row w-1/3 items-center bg-[#e7e5e6] gap-2 shadow-sm'>
            <div className='pl-2'>
              <svg xmlns='http://www.w3.org/2000/svg' width='50' viewBox='0 0 68 30' fill='none'>
                <path
                  d='M46.0647 7.33561C45.8197 4.94088 45.4295 3.07634 44.8122 2.34346C42.2669 -0.669919 24.4375 -0.890443 22.4132 2.34346C21.918 3.13576 21.5707 4.9937 21.3377 7.33957C20.5856 7.42804 20 8.06122 20 8.83636V11.7698C20 12.4222 20.4133 12.9722 20.9904 13.1867C20.8537 17.8072 20.9646 22.6277 21.1693 25.025C21.1693 26.8757 22.4126 26.5687 22.4126 26.5687H23.5779V28.5666C23.5779 29.3589 24.3946 30 25.4008 30C26.4084 30 27.2251 29.3589 27.2251 28.5666V26.5687H40.7827V28.5666C40.7827 29.3589 41.5987 30 42.6063 30C43.6125 30 44.4292 29.3589 44.4292 28.5666V26.5687H44.8122C44.8122 26.5687 46.2753 26.7694 46.3691 25.8979C46.3691 23.5071 46.5196 18.2086 46.3955 13.2072C47.0088 13.0151 47.4565 12.4499 47.4565 11.7698V8.83636C47.4571 8.04274 46.8431 7.39899 46.0647 7.33561ZM26.7676 2.77328H40.4578V4.84449H26.7676V2.77328ZM26.963 24.2096C25.8881 24.2096 25.0172 23.3381 25.0172 22.2632C25.0172 21.189 25.8881 20.3181 26.963 20.3181C28.0379 20.3181 28.9094 21.189 28.9094 22.2632C28.9094 23.3381 28.0385 24.2096 26.963 24.2096ZM40.3845 24.2096C39.3103 24.2096 38.4375 23.3381 38.4375 22.2632C38.4375 21.189 39.3097 20.3181 40.3845 20.3181C41.4594 20.3181 42.3303 21.189 42.3303 22.2632C42.331 23.3381 41.4594 24.2096 40.3845 24.2096ZM42.8585 15.6924H24.3669V5.99332H42.8585V15.6924Z'
                  fill='#053820'></path>
                <line
                  x1='50.8131'
                  y1='17.8339'
                  x2='58.8131'
                  y2='8.83391'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <line
                  x1='52.8411'
                  y1='18.7452'
                  x2='58.8411'
                  y2='13.807'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <line
                  x1='53.8809'
                  y1='20.519'
                  x2='64.467'
                  y2='14.7802'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <path
                  d='M57.7991 9.08059C58.2516 7.22543 59.9488 4.43229 63.1173 8.10097C64.4609 8.09787 66.9399 8.75319 66.1076 11.3992C66.9986 13.2513 67.7805 16.6998 63.7797 15.6771'
                  stroke='#053820'
                  strokeWidth='0.570023'
                  fill='#053820'></path>
                <line
                  y1='-0.25'
                  x2='12.0416'
                  y2='-0.25'
                  transform='matrix(-0.664364 -0.747409 -0.747409 0.664364 16.8036 19)'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <line
                  y1='-0.25'
                  x2='7.77085'
                  y2='-0.25'
                  transform='matrix(-0.772116 -0.635481 -0.635481 0.772116 14.8036 19.9382)'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <line
                  y1='-0.25'
                  x2='12.0416'
                  y2='-0.25'
                  transform='matrix(-0.879133 -0.476577 -0.476577 0.879133 13.8036 21.7388)'
                  stroke='#053820'
                  strokeWidth='0.5'
                  fill='#053820'></line>
                <path
                  d='M10.0045 10.0806C9.55196 8.22543 7.85476 5.43229 4.68625 9.10097C3.3427 9.09787 0.86366 9.75319 1.69594 12.3992C0.804926 14.2513 0.0230884 17.6998 4.02388 16.6771'
                  stroke='#053820'
                  strokeWidth='0.570023'
                  fill='#053820'></path>
              </svg>
            </div>
            <div>
              <p className='text-sm'>Total:</p>
              <p className='text-sm'>{vehicles?.data?.length}</p>
            </div>
          </div>
          <div className='flex flex-row w-1/3 items-center bg-[#00800026] gap-2 shadow-sm'>
            <div className='pl-2'>
              <svg
                width='26px'
                height='26px'
                fill='#0e7c13'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                focusable='false'
                aria-hidden='true'
                data-testid='DepartureBoardIcon'>
                <path d='M16 1c-2.4 0-4.52 1.21-5.78 3.05.01-.01.01-.02.02-.03C9.84 4 9.42 4 9 4c-4.42 0-8 .5-8 4v10c0 .88.39 1.67 1 2.22V22c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22v-3.08c3.39-.49 6-3.39 6-6.92 0-3.87-3.13-7-7-7M4.5 19c-.83 0-1.5-.67-1.5-1.5S3.67 16 4.5 16s1.5.67 1.5 1.5S5.33 19 4.5 19M3 13V8h6c0 1.96.81 3.73 2.11 5zm10.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m2.5-6c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m.5-9H15v5l3.62 2.16.75-1.23-2.87-1.68z'></path>
              </svg>
            </div>
            <div>
              <p className='text-sm'>On time:</p>
              <p className='text-sm'>-</p>
            </div>
          </div>
          <div className='flex flex-row w-1/3 items-center bg-[#FF000026] gap-2 shadow-sm'>
            <div className='pl-2'>
              <svg
                width='26px'
                height='26px'
                fill='#d70b0b'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                focusable='false'
                aria-hidden='true'
                data-testid='DepartureBoardIcon'>
                <path d='M16 1c-2.4 0-4.52 1.21-5.78 3.05.01-.01.01-.02.02-.03C9.84 4 9.42 4 9 4c-4.42 0-8 .5-8 4v10c0 .88.39 1.67 1 2.22V22c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22v-3.08c3.39-.49 6-3.39 6-6.92 0-3.87-3.13-7-7-7M4.5 19c-.83 0-1.5-.67-1.5-1.5S3.67 16 4.5 16s1.5.67 1.5 1.5S5.33 19 4.5 19M3 13V8h6c0 1.96.81 3.73 2.11 5zm10.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m2.5-6c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m.5-9H15v5l3.62 2.16.75-1.23-2.87-1.68z'></path>
              </svg>
            </div>
            <div>
              <p className='text-sm'>Late:</p>
              <p className='text-sm'>-</p>
            </div>
          </div>
        </div>
        <div className='border border-[#1d31a6] rounded-md h-[522px] relative'>
          <div className='flex flex-row'>
            {vehicleStatus.map((tab) => (
              <button
                key={tab.label}
                onClick={() => dispatch(setActiveTab(tab.label))}
                className={`flex flex-col basis-1/6 cursor-pointer text-center p-1 h-13 rounded-tr-md transition-all duration-200 ${
                  activeTab === tab.label ? 'border-b-[3px]' : ''
                } `}
                style={{
                  backgroundColor: tab.bg,
                  borderColor: activeTab === tab.label ? tab.color : 'transparent',
                }}>
                <div style={{ color: tab.color }}>{tab.count}</div>
                <div style={{ color: tab.color, fontSize: '11px' }}>
                  {tab.label === 'New' ? 'New Device' : tab.label}
                </div>
              </button>
            ))}
          </div>

          <div className='p-1 border-b-1 border-[gray]'>
            <ISearch onChange={handleSearch} />
          </div>
          <div className='mhe-list p-2 mt-2 h-[420px] overflow-y-scroll'>
            {filteredResult.map((device) => (
              // {filteredDevices.map((device) => (
              <div
                key={device.id}
                className='flex items-center border-b-1 border-gray-300 py-1 last:border-none cursor-pointer'>
                <CheckBox fontSize='small' sx={{ marginRight: '10px' }} />
                <div className='h-[10px] w-[10px] rounded-full mr-4' style={{ backgroundColor: device.color }}></div>
                <div className='flex-1'>
                  <div className='text-sm' onClick={() => handleRightPanel(device)}>
                    {device.vehicle_name}
                  </div>
                  {device.timestamp && (
                    <div className='text-gray-500 text-[11px]'>{new Date(device.timestamp).toLocaleString()}</div>
                  )}
                </div>
                <span className='w-8 text-center text-sm'>{device.speed}</span>
                <span className='w-8 text-center'>
                  {/* {(device.lat && device.lat != 0) ? ( */}
                  <FaWifi
                    className={
                      'lat' in device
                        ? device.lat && device.lat != 0
                          ? 'text-[green] text-[15px]'
                          : 'text-red-400 text-[15px]'
                        : 'text-gray-400'
                    }
                  />
                  {/* ) : (
                    <FaWifi className="text-red-400 text-[15px]" />
                  )} */}
                </span>
                <span className='w-8 text-center'>
                  {/* {device.hasIgnition ? ( */}
                  <FaKey
                    className={
                      'lat' in device
                        ? device.hasIgnition
                          ? 'text-[green] text-[15px]'
                          : 'text-red-400 text-[15px]'
                        : 'text-gray-400'
                    }
                  />
                  {/* ) : ( */}
                  {/* <FaKey className="text-red-400" /> */}
                  {/* )} */}
                </span>
                <span className='w-8 text-center'>
                  {/* {device.hasBattery ? ( */}
                  <FaBatteryFull
                    className={
                      'lat' in device
                        ? device.hasBattery
                          ? 'text-[green] text-[15px]'
                          : 'text-red-400 text-[15px]'
                        : 'text-gray-400'
                    }
                  />
                  {/* ) : ( */}
                  {/* <FaBatteryFull className="text-gray-400 text-[15px]" /> */}
                  {/* )} */}
                </span>
                <span className='w-8 text-center'>
                  {/* {device.hasExternalPower ? ( */}
                  <FaBolt
                    className={
                      'lat' in device
                        ? device.hasExternalPower
                          ? 'text-[green] text-[15px]'
                          : 'text-red-400 text-[15px]'
                        : 'text-gray-400'
                    }
                  />
                  {/* ) : ( */}
                  {/* <FaBolt className="text-gray-400 text-[15px]" /> */}
                  {/* )} */}
                </span>
                <span className='ml-4 text-sm text-gray-600'>{device.address}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackingPanel;
