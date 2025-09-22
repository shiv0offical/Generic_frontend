import { useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../../socket/socketService';

function Layout() {
  const token = localStorage.getItem('authToken');
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    if (token && pathname.includes('multitrack')) connectSocket(dispatch);
    return disconnectSocket;
  }, [dispatch, token, pathname]);

  return (
    <div className='flex h-screen' style={{ background: '#ecf0f5' }}>
      <Sidebar />
      <main className='flex-1'>
        <div
          style={{ overflowY: 'auto', height: 'calc(100vh)', boxSizing: 'border-box', width: 'calc(100vw - 95px)' }}
          className='transition-all duration-300 p-2'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
