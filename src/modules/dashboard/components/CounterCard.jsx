import moment from 'moment';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import runningBusIcon from '../../../assets/running_bus.svg';
import emergencyAlert from '../../../assets/emergency_alerts.svg';
import { fetchEmergencyData } from '../actions/counterCardAction';
import { fetchEmployeeOnboard } from '../../../redux/employeeSlice';
import employeeOnboarded from '../../../assets/employee_onboard.svg';

function CounterCard({ runningDevices }) {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState([]);

  const { todayEmergency } = useSelector((state) => state.counterCard);

  const today = moment().format('YYYY-MM-DD');

  useEffect(() => {
    const formattedStart = moment(today).format('YYYY-MM-DD');
    const formattedEnd = moment(today).format('YYYY-MM-DD');

    const payload = {
      company_id: localStorage.getItem('company_id'),
      department_id: '',
      start: formattedStart,
      end: formattedEnd,
      employee_id: '',
      vehicle_route_id: '',
      plant_id: '',
    };

    dispatch(fetchEmployeeOnboard(payload)).then((res) => {
      if (res?.payload?.data?.length) {
        setFilteredData(res?.payload.data.length);
      } else {
        setFilteredData([]);
      }
    });
  }, []);

  useEffect(() => {
    fetchEmergencyData(dispatch);
  }, []);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      <Link to='/master/vehicle'>
        <div className='flex items-center shadow-sm bg-white p-1 rounded-md w-full'>
          <img src={runningBusIcon} alt='running-bus-icon' className='w-14 ml-2' />
          <div className='flex flex-col ml-3'>
            <span className='text-sm text-gray-700'>Total Bus Running</span>
            <span className='font-semibold text-lg'>{runningDevices.length}</span>
          </div>
        </div>
      </Link>
      <Link to='/report/employees-on-board'>
        <div className='flex items-center shadow-sm bg-white p-1 rounded-md w-full'>
          <img src={employeeOnboarded} alt='employee-onboarded-icon' className='w-8 ml-2' />
          <div className='flex flex-col ml-3'>
            <span className='text-sm text-gray-700'>Employee Onboarded</span>
            <span className='font-semibold text-lg'>{filteredData}</span>
          </div>
        </div>
      </Link>
      <Link to='/report/emergency-alert'>
        <div className='flex items-center shadow-sm bg-white p-1 rounded-md w-full'>
          <img src={emergencyAlert} alt='emergency-alerts-icon' className='w-8 ml-2' />
          <div className='flex flex-col ml-3'>
            <span className='text-sm text-gray-700'>Emergency Alerts</span>
            <span className='font-semibold text-lg'>{todayEmergency}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default CounterCard;
