import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';
import './Sidebar.css';
import { ArrowRight } from '@mui/icons-material';
import ProfileIcon from './components/ProfileIcon';
import NotificationPanel from './components/NotificationPanel';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';

function Sidebar() {
  return (
    <>
      <div className='sidebar w-25 h-screen bg-[#07163d]'>
        <div className='w-[90%] p-4 rounded-3xl overflow-hidden'>
          <img src={logo} alt='samsung logo' className='object-contain rounded-xl' />
        </div>
        {/* profile menu */}
        <div className='flex flex-col justify-between responsive-height'>
          <ul>
            <li className='sidebar-item hoverable'>
              <Link to='/dashboard' className='hover:no-underline'>
                <div className='nav-link'>
                  <div className='flex flex-col items-center'>
                    <DashboardIcon style={{ fontSize: '3rem' }} />
                    <span className='text-xs mt-1'>Dashboard</span>
                  </div>
                </div>
              </Link>
            </li>
            <li className='sidebar-item hoverable'>
              <Link to='/multitrack' className='hover:no-underline'>
                <div className='nav-link'>
                  <div className='flex flex-col items-center'>
                    <LocationOnIcon style={{ fontSize: '3rem' }} />
                    <span className='text-xs mt-1'>Multi Track</span>
                  </div>
                </div>
              </Link>
            </li>
            <li className='sidebar-item hoverable'>
              <div className='nav-link'>
                <div className='flex flex-col items-center'>
                  <InsertDriveFileIcon style={{ fontSize: '3rem' }} />
                  <span className='text-xs mt-1'>Reports</span>
                </div>
              </div>
              <ReportsSubMenu />
            </li>
            <li className='sidebar-item hoverable'>
              <div className='nav-link'>
                <div className='flex flex-col items-center'>
                  <SettingsIcon style={{ fontSize: '3rem' }} />
                  <span className='text-xs mt-1'>Settings</span>
                </div>
              </div>
              <SettingsSubMenu />
            </li>
          </ul>

          {/* <div className="flex gap-1 mt-4 mb-3 "> */}
          <ul>
            <li className='sidebar-item hoverable'>
              <div className='nav-link'>
                <div className='flex flex-col items-center'>
                  <PersonIcon style={{ fontSize: '3rem' }} />
                </div>
              </div>
              <ProfileSubMenu />
            </li>

            <li className='sidebar-item hoverable p-1'>
              <div className='flex flex-col items-center'>
                <NotificationsNoneIcon
                  className='cursor-pointer text-black'
                  style={{ fontSize: '2.5rem', color: 'white' }}
                />
              </div>
              <NotificationPanel />
            </li>
          </ul>
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

const ReportsSubMenu = () => {
  return (
    <>
      <ul className='sub-menu'>
        <li className='sub-menu-item'>
          <div className='nav-link vehicle-activity-link'>
            Vehicle Activity <ArrowRight style={{ fontSize: '20px' }} />
          </div>
          <ul className='nested-sub-menu'>
            <li>
              <Link to='/report/movement' className='nav-link'>
                Movement
              </Link>
            </li>
            <li>
              <Link to='/report/parked' className='nav-link'>
                Parked
              </Link>
            </li>
            <li>
              <Link to='/report/idle' className='nav-link'>
                Idle
              </Link>
            </li>
            <li>
              <Link to='/report/offline' className='nav-link'>
                Offline
              </Link>
            </li>
            <li>
              <Link to='/report/new-device' className='nav-link'>
                New Device
              </Link>
            </li>
            <li>
              <Link to='/report/map-history' className='nav-link'>
                Map History
              </Link>
            </li>
            <li>
              <Link to='/report/consolidated' className='nav-link'>
                Consolidated
              </Link>
            </li>
          </ul>
        </li>
        <li className='sub-menu-item'>
          <div className='nav-link vehicle-activity-link'>
            Geo-fence <ArrowRight style={{ fontSize: '20px' }} />
          </div>
          <ul className='nested-sub-menu'>
            <li>
              <Link to='/report/geo-fence-entery-exit' className='nav-link'>
                Geo-fence Entery Exit
              </Link>
            </li>
            <li>
              <Link to='/report/geo-fence-violation' className='nav-link'>
                Geo-fence To Geo-fence
              </Link>
            </li>
          </ul>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/overspeed' className='nav-link'>
            Over Speed
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/employees-on-board' className='nav-link'>
            Employees on board
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/destination-arrival-female' className='nav-link'>
            Destination Arrival-Female
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/punch-timelog' className='nav-link'>
            Punch Timelog
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/vehicle-arrival-time/1' className='nav-link'>
            Vehicle Arrival Time
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/seat-occupancy' className='nav-link'>
            Seat Occupancy
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/emergency-alert' className='nav-link'>
            Emergency alert
          </Link>
        </li>
        <li className='sub-menu-item'>
          <Link to='/report/feedback' className='nav-link'>
            Feedback
          </Link>
        </li>
      </ul>
    </>
  );
};

const ProfileSubMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <ul className='sub-menu settings-sub-menu'>
        <li className='sub-menu-item'>
          <Link to='/profile' className='nav-link'>
            Profile Update
          </Link>
        </li>
        <li className='sub-menu-item' onClick={handleLogout}>
          <Link className='nav-link'>Logout</Link>
        </li>
      </ul>
    </>
  );
};

const SettingsSubMenu = () => {
  return (
    <>
      <ul className='sub-menu settings-sub-menu'>
        <li className='sub-menu-item'>
          <div className='nav-link vehicle-activity-link'>
            Master <ArrowRight style={{ fontSize: '20px' }} />
          </div>
          <ul className='nested-sub-menu' style={{ top: '-82px' }}>
            <li>
              <Link to='/master/employee' className='nav-link'>
                Employee
              </Link>
            </li>
            <li>
              <Link to='/master/vehicle' className='nav-link'>
                Vehicle
              </Link>
            </li>
            <li>
              <Link to='/master/driver' className='nav-link'>
                Driver
              </Link>
            </li>
            {/* <li>
              <Link to="/master/user-permission" className="nav-link">
                User Permission
              </Link>
            </li> */}
            <li>
              <Link to='/master/departments' className='nav-link'>
                Departments
              </Link>
            </li>
            <li>
              <Link to='/master/plants' className='nav-link'>
                Plants
              </Link>
            </li>
            <li>
              <Link to='/master/factory-in-time-target' className='nav-link'>
                Plant In Time
              </Link>
            </li>
          </ul>
        </li>
        <li className='sub-menu-item'>
          <div className='nav-link vehicle-activity-link'>
            Management <ArrowRight style={{ fontSize: '20px' }} />
          </div>
          <ul className='nested-sub-menu' style={{ top: '-82px' }}>
            <li>
              <Link to='/management/geofence' className='nav-link'>
                Geofence
              </Link>
            </li>
            <li>
              <Link to='/management/vehicle-route' className='nav-link'>
                Vehicle Route
              </Link>
            </li>
            <li>
              <Link to='/management/feedbacks' className='nav-link'>
                Feedbacks
              </Link>
            </li>
            <li>
              <Link to='/management/route-change-request' className='nav-link'>
                Route change request
              </Link>
            </li>
            <li>
              <Link to='/management/emergency-alerts' className='nav-link'>
                Emergency alerts
              </Link>
            </li>
            <li>
              <Link to='/management/announcements' className='nav-link'>
                Announcements
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </>
  );
};

export default Sidebar;
