import { useState } from 'react';
import { APIURL } from '../../constants';
import { useLocation } from 'react-router-dom';
import RoutingMatching from './RoutingMatching';
import { MapContainer, TileLayer } from 'react-leaflet';
import lastVehicleData from '../../services/lastVehicleData';
import { IconButton, Paper, Slider, Button, TextField, MenuItem } from '@mui/material';
import 'leaflet-trackplayer';
import { Menu as MenuIcon, Close as CloseIcon, PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';

export default function Playback() {
  const [showControls, setShowControls] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [shortcut, setShortcut] = useState('');
  const [routeCoordinate, setRouteCoordinate] = useState([]);
  const [speed, setSpeed] = useState(10);
  const [isPlay, setIsPlay] = useState(false);

  const location = useLocation();
  const selectedVehicle = location.state?.selectedVehicle;

  const handleShortcutChange = (event) => {
    setShortcut(event.target.value);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDateTimeLocal = (date, time = '00:00') => `${date.toISOString().split('T')[0]}T${time}`;

    if (event.target.value === 'today') {
      const from = formatDateTimeLocal(today, '00:00');
      const to = formatDateTimeLocal(today, '23:59');
      setFromDate(from);
      setToDate(to);
    } else if (event.target.value === 'yesterday') {
      const from = formatDateTimeLocal(yesterday, '00:00');
      const to = formatDateTimeLocal(yesterday, '23:59');
      setFromDate(from);
      setToDate(to);
    }
  };

  const handlePlay = async () => {
    if (isPlay) {
      // Pause
      setIsPlay(false);
      return;
    }
    if (!fromDate || !toDate) {
      alert('Please select both From and To dates');
      return;
    }

    try {
      // Ensure the dates are in UTC format
      const fromISOString = new Date(fromDate).toISOString();
      const toISOString = new Date(toDate).toISOString();

      const response = await lastVehicleData.post(
        APIURL.PLAYBACK,
        {},
        { from: fromISOString, to: toISOString, imei: selectedVehicle.imei_number }
      );

      if (response.success && response.data.length > 0) {
        const coords = response.data.map((item) => [item.latitude, item.longitude]);

        setRouteCoordinate(coords);
        setIsPlay(true);
      } else {
        alert('No data found for the selected time range.');
      }
    } catch (error) {
      console.error('Error fetching playback data:', error);
    }
  };
  console.log('🚀 ~ :24 ~ Playback ~ routeCoordinate:', routeCoordinate);

  const removeDuplicateCoordinates = (coords) => {
    return coords.filter((coord, index, self) => {
      if (index === 0) return true;
      const [prevLat, prevLng] = self[index - 1];
      return coord[0] !== prevLat || coord[1] !== prevLng;
    });
  };

  const filteredCoodinate = removeDuplicateCoordinates(routeCoordinate);

  return (
    <div className='relative w-full h-screen bg-gray-200'>
      <MapContainer
        center={routeCoordinate.length > 0 ? routeCoordinate[0] : [12.6749816, 79.2863616]}
        zoom={13}
        scrollWheelZoom={true}
        className='w-full h-full z-0'>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />

        {routeCoordinate.length > 0 && (
          <>
            <RoutingMatching coordinates={filteredCoodinate} speed={speed} isPlaying={isPlay} />
          </>
        )}
      </MapContainer>

      <div className='absolute top-4 right-4 z-10'>
        <IconButton className='bg-white shadow-md rounded-full' onClick={() => setShowControls(!showControls)}>
          {showControls ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </div>

      {showControls && (
        <Paper className='absolute top-16 right-4 p-4 shadow-lg w-64 bg-white'>
          <h2 className='text-md text-center font-semibold'>{selectedVehicle.vehicle_name}</h2>
          <div className='my-2'>
            <label className='text-sm'>From</label>
            <TextField
              type='datetime-local'
              fullWidth
              size='small'
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className='my-2'>
            <label className='text-sm'>To</label>
            <TextField
              type='datetime-local'
              size='small'
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className='my-2'>
            <label className='text-sm'>Shortcut</label>
            <TextField select fullWidth size='small' value={shortcut} onChange={handleShortcutChange}>
              <MenuItem value='today'>Today</MenuItem>
              <MenuItem value='yesterday'>Yesterday</MenuItem>
            </TextField>
          </div>
          <div className='my-2'>
            <label className='text-sm'>Speed Control</label>
            <Slider value={speed} onChange={(e, newVal) => setSpeed(newVal)} min={0} max={100} className='w-full' />
          </div>
          <div className='flex justify-between'>
            <Button variant='contained' color='success'>
              Speed
            </Button>
            <Button variant='contained' color='error'>
              Detail
            </Button>
          </div>
          <div className='mt-4 text-center'>
            <Button
              variant='contained'
              color='primary'
              startIcon={isPlay ? <PauseIcon /> : <PlayIcon />}
              onClick={handlePlay}>
              {isPlay ? 'Pause' : 'Play'}
            </Button>
          </div>
        </Paper>
      )}
    </div>
  );
}
