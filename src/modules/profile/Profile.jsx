import { useState } from 'react';
import Information from './components/Information';
import PasswordPanel from './components/PasswordPanel';
import { Tab, Tabs } from '@mui/material';

function Profile() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Profile</h1>
      </div>
      <div className='p-4 bg-white'>
        <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
          <Tab label='Information' />
          <Tab label='Password' />
        </Tabs>
        <div className='p-4'>{tabIndex === 0 ? <Information /> : <PasswordPanel />}</div>
      </div>
    </div>
  );
}

export default Profile;
