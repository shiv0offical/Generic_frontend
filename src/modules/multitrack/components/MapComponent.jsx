import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import LocationPinGreenSVG from '../../../assets/greenLocationPin.svg';
import LocationPinRedSVG from '../../../assets/redLocationPin.svg';
import LocationPinOrangeSVG from '../../../assets/orangeLocationPin.svg';
import LocationPinBlueSVG from '../../../assets/blueLocationPin.svg';

const redMapIcon = new L.Icon({ iconUrl: LocationPinRedSVG, iconSize: [32, 32], iconAnchor: [16, 32] });
const greenMapIcon = new L.Icon({ iconUrl: LocationPinGreenSVG, iconSize: [32, 32], iconAnchor: [16, 32] });
const yellowMapIcon = new L.Icon({ iconUrl: LocationPinOrangeSVG, iconSize: [32, 32], iconAnchor: [16, 32] });
const blueMapIcon = new L.Icon({ iconUrl: LocationPinBlueSVG, iconSize: [32, 32], iconAnchor: [16, 32] });

function getIcon(ign, mov, t) {
  if (ign && mov && !isOld(t)) return greenMapIcon;
  if (ign && !mov && !isOld(t)) return yellowMapIcon;
  if (!ign && !mov && !isOld(t)) return redMapIcon;
  if (isOld(t)) return blueMapIcon;
  return redMapIcon;
}
function isOld(date) {
  const d = new Date(date);
  return !isNaN(d) && Date.now() - d.getTime() > 3600000;
}
function MapEffects({ selectedVehicle, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVehicle && markerRefs.current[selectedVehicle.id]) {
      markerRefs.current[selectedVehicle.id].openPopup();
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 15);
    }
  }, [selectedVehicle, markerRefs, map]);
  return null;
}

const MapComponent = ({ selectedVehicle }) => {
  const { vehicles } = useSelector((s) => s.vehicle);
  const markerRefs = useRef({});
  const devices = useMemo(
    () =>
      vehicles?.data
        ?.filter((v) => 'latitude' in v)
        .map((v) => {
          const io = Array.isArray(v.ioElements) ? v.ioElements : [];
          const ign = io.find((i) => i.id === 239)?.value;
          const mov = io.find((i) => i.id === 240)?.value;
          const t = v.timestamp ? new Date(v.timestamp).toISOString() : '';
          return {
            id: v.id,
            name: v.vehicle_name,
            lat: v.latitude || 0,
            lng: v.longitude || 0,
            icon: getIcon(ign, mov, t),
            timestamp: v.timestamp || '',
            address: v.address || '',
          };
        }) || [],
    [vehicles?.data]
  );

  return (
    <div className='h-screen w-full'>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className='w-full h-full'>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {devices.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={d.icon}
            ref={(ref) => {
              if (ref) markerRefs.current[d.id] = ref;
            }}>
            <Popup>
              <div>
                <strong>{d.name}</strong>
                <br />
                <small>{d.timestamp}</small>
                <br />
                <em>{d.address}</em>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapEffects selectedVehicle={selectedVehicle} markerRefs={markerRefs} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
