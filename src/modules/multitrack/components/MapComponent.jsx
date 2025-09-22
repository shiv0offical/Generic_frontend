import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import LocationPinGreenSVG from '../../../assets/greenLocationPin.svg';
import LocationPinRedSVG from '../../../assets/redLocationPin.svg';
import LocationPinOrangeSVG from '../../../assets/orangeLocationPin.svg';
import LocationPinBlueSVG from '../../../assets/blueLocationPin.svg';

const redMapIcon = new L.Icon({ iconUrl: LocationPinRedSVG, iconSize: [32, 32], iconAnchor: [16, 32] });

const greenMapIcon = new L.Icon({ iconUrl: LocationPinGreenSVG, iconSize: [32, 32], iconAnchor: [16, 32] });
const yelllowMapIcon = new L.Icon({ iconUrl: LocationPinOrangeSVG, iconSize: [32, 32], iconAnchor: [16, 32] });
const blueMapIcon = new L.Icon({ iconUrl: LocationPinBlueSVG, iconSize: [32, 32], iconAnchor: [16, 32] });

const MapComponent = ({ selectedVehicle }) => {
  const { vehicles } = useSelector((state) => state.vehicle);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const updatedDevices = vehicles?.data
      ? vehicles?.data
          ?.filter((vehicleItem) => 'latitude' in vehicleItem)
          .map((vehicle) => {
            const ioData = Array.isArray(vehicle.ioElements) ? vehicle.ioElements : [];
            const ignition = ioData.find((item) => item.id === 239);
            const movement = ioData.find((item) => item.id === 240);
            const localTime = !isNaN(new Date(vehicle?.timestamp)) ? new Date(vehicle.timestamp).toISOString() : '';
            return {
              id: vehicle.id,
              name: vehicle.vehicle_name,
              lat: vehicle.latitude || 0,
              lng: vehicle.longitude || 0,
              locationIcon: colorOfDot(ignition.value, movement.value, localTime),
            };
          })
      : [];

    setDevices(updatedDevices);
  }, [vehicles.data]);

  // console.log("vehicles", vehicles.data);

  const colorOfDot = (ignition, movement, time) => {
    if (ignition && movement && !checkifTimeisOneHourOlder(time)) return greenMapIcon;
    if (ignition && !movement && !checkifTimeisOneHourOlder(time)) return yelllowMapIcon;
    if (!ignition && !movement && !checkifTimeisOneHourOlder(time)) return redMapIcon;
    if (checkifTimeisOneHourOlder(time)) return blueMapIcon;
  };

  const checkifTimeisOneHourOlder = (providedDate) => {
    const now = new Date();
    const dateToCheck = new Date(providedDate);
    if (isNaN(dateToCheck.getTime())) {
      console.error('Invalid date provided.');
      return false;
    }
    const diffInMs = now.getTime() - dateToCheck.getTime();
    const oneHourInMs = 60 * 60 * 1000;
    return diffInMs > oneHourInMs;
  };

  useEffect(() => {
    if (!vehicles?.data) return;

    vehicles.data.forEach((vehicle) => {
      const ioData = Array.isArray(vehicle.ioElements) ? vehicle.ioElements : [];
      const movement = ioData.find((item) => item.id === '240');

      if (movement?.value === 1) {
        const marker = markerRefs.current[vehicle.id];
        if (marker) {
          const newLatLng = L.latLng(vehicle.latitude, vehicle.longitude);
          const currentLatLng = marker.getLatLng();
          if (currentLatLng.lat !== newLatLng.lat || currentLatLng.lng !== newLatLng.lng) marker.setLatLng(newLatLng);
        }
      }
    });
  }, [vehicles.data]);

  useEffect(() => {
    if (selectedVehicle && markerRefs.current[selectedVehicle.id]) {
      markerRefs.current[selectedVehicle.id].openPopup();
      mapRef.current?.flyTo([selectedVehicle.lat, selectedVehicle.lng], 15);
    }
  }, [selectedVehicle]);

  return (
    <div className='h-screen w-full'>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className='w-full h-full' ref={mapRef}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {devices.map((device) => (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={device.locationIcon}
            ref={(ref) => (markerRefs.current[device.id] = ref)}>
            <Popup>
              <div>
                <strong>{device.name}</strong>
                <br />
                <small>{device.timestamp}</small>
                <br />
                <em>{device.address}</em>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
