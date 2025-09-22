import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { AppBar, Box, Tab, Tabs } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return { id: `full-width-tab-${index}`, 'aria-controls': `full-width-tabpanel-${index}` };
}

function NotificationPanel() {
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <>
      <div className='sub-menu notification-sub-menu'>
        <div style={{ width: '23rem', height: 'calc(100vh - 100px)', top: '-4rem', left: '3.7rem' }}>
          <AppBar elevation={0} sx={{ bgcolor: 'transparent' }} color='default' position='static'>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor='secondary'
              textColor='inherit'
              variant='fullWidth'
              aria-label='Notification Tabs'>
              <Tab
                sx={{ bgcolor: value === 0 ? '#1d31a6' : '#07163d', color: '#FFF' }}
                label='Emergency Alerts'
                {...a11yProps(0)}
              />
              <Tab
                sx={{ bgcolor: value === 1 ? '#1d31a6' : '#07163d', color: '#FFF' }}
                label='Geofence Violations'
                {...a11yProps(1)}
              />
            </Tabs>
          </AppBar>
          <TabPanel className='text-black' value={value} index={0} dir={theme.direction}>
            <div className='text-end'>
              <Link to='/management/emergency-alerts'>
                <button className='text-white'>View All</button>
              </Link>
            </div>
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className='text-end'>
              <Link to='/management/emergency-alerts'>
                <button className='text-white'>View All</button>
              </Link>
            </div>
          </TabPanel>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
