import L from 'leaflet';
import AutoFlyTo from './AutoFly';
import { APIURL } from '../../../../constants';
import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AddressServices, ApiService } from '../../../../services';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Autocomplete, TextField, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const shifts = [
  { id: '2f7d76b8-87a9-4dc1-822a-a39e99b314e9', name: 'Night' },
  { id: '1b0b7594-c88c-470b-a956-f8f79918fd36', name: 'Day' },
];

const FitBounds = ({ stopPoints }) => {
  const map = useMap();
  const bounds = stopPoints.map((s) => [+s.latitude, +s.longitude]).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
  if (bounds.length > 1) map.fitBounds(bounds);
  return null;
};

const getVehicleNumber = (rowData) => {
  return (
    rowData.vehicle_number ||
    rowData.busNumber ||
    rowData.vehicle?.vehicle_number ||
    rowData.vehicle?.vehicle_name ||
    rowData.vehicle?.vehicleNumber ||
    ''
  );
};

const getDriverName = (rowData) => {
  if (rowData.busDriver) return rowData.busDriver;
  if (rowData.vehicle && rowData.vehicle.driver) {
    const d = rowData.vehicle.driver;
    return [d.first_name, d.last_name].filter(Boolean).join(' ');
  }
  return '';
};

const getCreatedAt = (rowData) => {
  return rowData.createdAt || rowData.created_at || '';
};

const getRouteName = (rowData) => {
  return rowData.routeName || rowData.name || '';
};

const getVehicleId = (rowData) => {
  return rowData.vehicleID || rowData.vehicle_id || rowData.vehicle?.id || '';
};

const VehicleRouteForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressTimeoutRef = useRef();

  const rowData = location.state?.rowData;
  const companyID = localStorage.getItem('company_id');
  const isViewMode = location.pathname.includes('/view');

  const [vehicles, setVehicles] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [addressOnSearch, setAddressOnSearch] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedShift, setSelectedShift] = useState(shifts?.[0]?.id);
  const [latestSelectedCoords, setLatestSelectedCoords] = useState(null);
  const [stopPoints, setStopPoints] = useState([
    { id: Date.now(), address: '', latitude: '', longitude: '', time: '', returnTime: '', distance: 0 },
  ]);

  useEffect(() => {
    (async () => {
      const res = await ApiService.get(APIURL.VEHICLE);
      setVehicles(res?.success && Array.isArray(res.data?.vehicles) ? res.data?.vehicles : []);
    })();
  }, []);

  useEffect(() => {
    if (!rowData) return;
    const vehicleId = getVehicleId(rowData);
    const v = vehicles.find((veh) => veh.id === vehicleId);
    setSelectedVehicle(
      v
        ? { value: v.id, label: v.vehicle_number || v.busNumber || v.label }
        : vehicleId
        ? { value: vehicleId, label: getVehicleNumber(rowData) }
        : null
    );
    setRouteName(getRouteName(rowData));
    setSelectedShift(rowData.shiftId || rowData.shift_id || shifts?.[0]?.id);
    if (rowData.routeStops) {
      const stops = Array.isArray(rowData.routeStops) ? rowData.routeStops : [rowData.routeStops];
      setStopPoints(
        stops.map((s) => ({
          id: s.id,
          address: s.address || '',
          latitude: s.latitude || '',
          longitude: s.longitude || '',
          time: s.time || '',
          returnTime: s.return_time || '',
          distance: s.distance || 0,
        }))
      );
    }
  }, [rowData, vehicles]);

  const handleStopChange = (idx, key, value) => {
    const newStops = [...stopPoints];
    newStops[idx][key] = value;
    setStopPoints(newStops);
    if (
      ['latitude', 'longitude'].includes(key) &&
      !isNaN(+newStops[idx].latitude) &&
      !isNaN(+newStops[idx].longitude)
    ) {
      setLatestSelectedCoords({ lat: +newStops[idx].latitude, lng: +newStops[idx].longitude });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      company_id: companyID,
      vehicle_id: selectedVehicle?.value,
      name: routeName,
      status_id: 1,
      shift_id: selectedShift ? selectedShift : shifts?.[0]?.id,
      Vehicle_Route_Stops: stopPoints.map((s) => ({
        ...s,
        company_id: companyID,
        shift_id: selectedShift ? selectedShift : shifts?.[0]?.id,
      })),
    };
    const id = rowData?.routeID || rowData?.id;
    const res = rowData
      ? await ApiService.put(`${APIURL.VEHICLE_ROUTE}/${id}?company_id=${companyID}`, payload)
      : await ApiService.post(APIURL.VEHICLE_ROUTE, payload);
    alert(res.message || (res.success ? 'Success!' : 'Something went wrong.'));
    if (res.success) navigate('/management/vehicle-route');
  };

  const vehicleOptions = vehicles.map((v) => ({
    label: v.vehicle_number || v.busNumber || v.label,
    value: v.id,
  }));

  const initialCenter =
    stopPoints.length && !isNaN(+stopPoints[0].latitude) && !isNaN(+stopPoints[0].longitude)
      ? [+stopPoints[0].latitude, +stopPoints[0].longitude]
      : [20.5937, 78.9629];

  const addressOptions = Array.isArray(addressOnSearch) ? addressOnSearch : addressOnSearch ? [addressOnSearch] : [];

  return (
    <div>
      <div className='flex justify-between items-center p-2'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Vehicle Route</h1>
      </div>
      <form onSubmit={handleFormSubmit} className='grid gap-3'>
        <div className='bg-white p-4 border-t-3 border-[#07163d] rounded-sm'>
          <div className='grid md:grid-cols-2 gap-3 my-2'>
            {isViewMode && rowData && (
              <div className='col-span-2 py-2 grid grid-cols-4 gap-4'>
                <div>
                  <b>Route Name:</b> {getRouteName(rowData)}
                </div>
                <div>
                  <b>Bus Number:</b> {getVehicleNumber(rowData)}
                </div>
                <div>
                  <b>Driver:</b> {getDriverName(rowData)}
                </div>
                <div>
                  <b>Created At:</b> {getCreatedAt(rowData)}
                </div>
              </div>
            )}
            <div className='flex flex-col'>
              <label className='block mb-2 text-sm font-semibold text-gray-900'>Vehicle</label>
              <Autocomplete
                disablePortal
                options={vehicleOptions}
                value={
                  selectedVehicle
                    ? vehicleOptions.find((o) => o.value === selectedVehicle.value) || selectedVehicle
                    : null
                }
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                getOptionLabel={(o) => o?.label || ''}
                size='small'
                disabled={isViewMode}
                renderInput={(params) => <TextField {...params} placeholder='Select Vehicle' />}
                onChange={(_, v) => setSelectedVehicle(v)}
              />
            </div>
            <div className='flex flex-col'>
              <label className='block mb-2 text-sm font-semibold text-gray-900'>Route Name</label>
              <TextField
                size='small'
                type='text'
                placeholder='Type Route Name Here'
                disabled={isViewMode}
                fullWidth
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded-sm border-t-3 border-[#07163d]'>
          <FormControl component='fieldset' disabled={isViewMode}>
            <label className='block mb-2 text-sm font-semibold text-gray-900'>Select Shift *</label>
            <RadioGroup row value={String(selectedShift)} onChange={(e) => setSelectedShift(e.target.value)}>
              {shifts.map((s) => (
                <FormControlLabel
                  key={s.id}
                  value={String(s.id)}
                  control={<Radio />}
                  label={<span className='text-sm font-medium'>{s.name}</span>}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {stopPoints.map((stop, idx) => (
            <div key={stop.id} className='grid grid-cols-8 gap-2 items-center my-3 w-full'>
              <div className='flex flex-col col-span-2'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Address</label>
                <Autocomplete
                  freeSolo
                  disablePortal
                  disabled={isViewMode}
                  options={addressOptions.map((i) => ({ label: i.display_name, value: i.place_id, otherData: i }))}
                  getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label || '')}
                  size='small'
                  value={stop.address || ''}
                  renderInput={(params) => <TextField {...params} placeholder='Bus Stop Point Address' />}
                  onInputChange={(_, value) => {
                    handleStopChange(idx, 'address', value);
                    clearTimeout(addressTimeoutRef.current);
                    addressTimeoutRef.current = setTimeout(async () => {
                      if (value) {
                        const result = await AddressServices.getLocationFromName(value);
                        setAddressOnSearch(Array.isArray(result) ? result : result ? [result] : []);
                      }
                    }, 500);
                  }}
                  onChange={(_, v) => {
                    if (v?.otherData) {
                      handleStopChange(idx, 'address', v.otherData.display_name);
                      handleStopChange(idx, 'latitude', v.otherData.lat);
                      handleStopChange(idx, 'longitude', v.otherData.lon);
                      setLatestSelectedCoords({ lat: +v.otherData.lat, lng: +v.otherData.lon });
                    }
                  }}
                />
              </div>
              <div className='flex flex-col'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Latitude</label>
                <TextField
                  size='small'
                  type='text'
                  disabled={isViewMode}
                  placeholder='latitude'
                  value={stop['latitude'] || ''}
                  onChange={(e) => handleStopChange(idx, 'latitude', e.target.value)}
                />
              </div>
              <div className='flex flex-col'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Longitude</label>
                <TextField
                  size='small'
                  type='text'
                  disabled={isViewMode}
                  placeholder='longitude'
                  value={stop['longitude'] || ''}
                  onChange={(e) => handleStopChange(idx, 'longitude', e.target.value)}
                />
              </div>
              <div className='flex flex-col'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Distance (km)</label>
                <TextField
                  size='small'
                  type='number'
                  disabled={isViewMode}
                  placeholder='distance'
                  value={stop['distance'] || ''}
                  onChange={(e) => handleStopChange(idx, 'distance', e.target.value)}
                />
              </div>
              <div className='flex flex-col'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Time</label>
                <TextField
                  type='time'
                  size='small'
                  disabled={isViewMode}
                  value={
                    stop['time']
                      ? /^\d{2}:\d{2}$/.test(stop['time'])
                        ? stop['time']
                        : new Date(stop['time']).toISOString().substring(11, 16)
                      : ''
                  }
                  onChange={(e) => {
                    const d = new Date().toISOString().split('T')[0];
                    handleStopChange(idx, 'time', `${d}T${e.target.value}:00.000Z`);
                  }}
                />
              </div>
              <div className='flex flex-col'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Return Time</label>
                <TextField
                  type='time'
                  size='small'
                  disabled={isViewMode}
                  value={
                    stop['returnTime']
                      ? /^\d{2}:\d{2}$/.test(stop['returnTime'])
                        ? stop['returnTime']
                        : new Date(stop['returnTime']).toISOString().substring(11, 16)
                      : ''
                  }
                  onChange={(e) => {
                    const d = new Date().toISOString().split('T')[0];
                    handleStopChange(idx, 'returnTime', `${d}T${e.target.value}:00.000Z`);
                  }}
                />
              </div>
              <div className='flex flex-col'>
                {!isViewMode && (
                  <button
                    type='button'
                    className='bg-gray-500 text-white rounded p-2 mt-5'
                    onClick={() => setStopPoints(stopPoints.filter((p) => p.id !== stop.id))}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isViewMode && (
            <button
              type='button'
              className='mt-2 bg-[#07163d] text-white px-3 py-2 rounded-sm'
              onClick={() =>
                setStopPoints([
                  ...stopPoints,
                  { id: Date.now(), address: '', latitude: '', longitude: '', time: '', returnTime: '', distance: '' },
                ])
              }>
              Add Bus Stop
            </button>
          )}
          <div className='mt-6 h-96 w-full'>
            <MapContainer center={initialCenter} zoom={stopPoints.length ? 14 : 5} className='w-full h-full'>
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
              {latestSelectedCoords && <AutoFlyTo {...latestSelectedCoords} />}
              {stopPoints.map((s) =>
                !isNaN(+s.latitude) && !isNaN(+s.longitude) ? (
                  <Marker key={s.id} position={[+s.latitude, +s.longitude]} icon={customIcon}>
                    <Popup>
                      <b>{s.address}</b>
                      <br />
                      {s.time} - {s.returnTime}
                      <br />
                      {s.distance} KM
                    </Popup>
                  </Marker>
                ) : null
              )}
              <FitBounds stopPoints={stopPoints} />
            </MapContainer>
          </div>
          <div className='flex justify-end gap-4 mt-4'>
            {!isViewMode && (
              <button type='submit' className='bg-[#07163d] text-white px-5 py-2 rounded-md'>
                Save
              </button>
            )}
            <Link to='/management/vehicle-route'>
              <button type='button' className='bg-gray-500 text-white px-5 py-2 rounded-md'>
                Back
              </button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleRouteForm;
