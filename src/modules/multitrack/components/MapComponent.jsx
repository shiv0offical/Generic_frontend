import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';

import LocationPinGreenSVG from '../../../assets/greenLocationPin.svg';
import LocationPinRedSVG from '../../../assets/redLocationPin.svg';
import LocationPinOrangeSVG from '../../../assets/orangeLocationPin.svg';
import LocationPinBlueSVG from '../../../assets/blueLocationPin.svg';

import { useEffect, useRef, useState } from 'react';

const redMapIcon = new L.Icon({
  iconUrl: LocationPinRedSVG,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const greenMapIcon = new L.Icon({
  iconUrl: LocationPinGreenSVG,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const yelllowMapIcon = new L.Icon({
  iconUrl: LocationPinOrangeSVG,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const blueMapIcon = new L.Icon({
  iconUrl: LocationPinBlueSVG,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// const devices = [
//   {
//     id: "1",
//     name: "RT843",
//     timestamp: "20/11/2024, 16:26:02",
//     lat: 12.9716,
//     lng: 77.5946,
//     address: "Bangalore, India",
//   },
//   {
//     id: "2",
//     name: "RT825",
//     timestamp: "20/11/2024, 18:29:59",
//     lat: 28.7041,
//     lng: 77.1025,
//     address: "Delhi, India",
//   },
//   {
//     id: "3",
//     name: "BT REFLEX03",
//     timestamp: "8/4/2024, 13:55:35",
//     lat: 19.076,
//     lng: 72.8777,
//     address: "Mumbai, India",
//   },
// ];

const MapComponent = ({ selectedVehicle }) => {
  const { vehicles } = useSelector((state) => state.vehicle);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const updatedDevices = vehicles?.data
      ? vehicles?.data
          ?.filter((vehicleItem) => 'latitude' in vehicleItem)
          .map((vehicle, index) => {
            // console.log("🚀 ~ ?vehicles?.data?.map ~ vehicle: 70707", JSON.stringify(vehicle))
            // const ioData = vehicle?.ioElements
            //   ? JSON.parse(vehicle.ioElements)
            //   : [];

            const ioData = Array.isArray(vehicle.ioElements) ? vehicle.ioElements : [];

            // console.log("🚀 ~ :61 ~ ?vehicles?.data?.map ~ ioData:", ioData);

            const ignition = ioData.find((item) => item.id === 239);
            const movement = ioData.find((item) => item.id === 240);
            const localTime = !isNaN(new Date(vehicle?.timestamp)) ? new Date(vehicle.timestamp).toISOString() : '';
            // console.log("🚀 ~ ?vehicles?.data?.map ~ localTime:", localTime)

            return {
              id: vehicle.id,
              name: vehicle.vehicle_name,
              // timestamp: new Date().toLocaleString(),
              lat: vehicle.latitude || 0,
              lng: vehicle.longitude || 0,
              // address: "Location not available",
              locationIcon: colorOfDot(ignition.value, movement.value, localTime),
            };
          })
      : [];

    setDevices(updatedDevices);
  }, [vehicles.data]);

  // console.log("vehicles", vehicles.data);

  const colorOfDot = (ignition, movement, time) => {
    // console.log('ignition', ignition, 'movement', movement, 'time', time, 'vehicle_name', vehicle_name);

    if (ignition && movement && !checkifTimeisOneHourOlder(time)) {
      return greenMapIcon;
    }
    if (ignition && !movement && !checkifTimeisOneHourOlder(time)) {
      return yelllowMapIcon;
    }
    if (!ignition && !movement && !checkifTimeisOneHourOlder(time)) {
      return redMapIcon;
    }
    if (checkifTimeisOneHourOlder(time)) {
      return blueMapIcon;
    }
  };

  const checkifTimeisOneHourOlder = (providedDate) => {
    const now = new Date();
    // console.log("🚀 ~ checkifTimeisOneHourOlder ~ now:", now)
    const dateToCheck = new Date(providedDate);
    // console.log("🚀 ~ checkifTimeisOneHourOlder ~ dateToCheck:", dateToCheck)

    // Check for invalid date
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
        // console.log("marker", marker);
        if (marker) {
          const newLatLng = L.latLng(vehicle.latitude, vehicle.longitude);
          const currentLatLng = marker.getLatLng();
          // marker.setLatLng(newLatLng);

          // ✅ Compare previous and new coordinates before updating
          if (currentLatLng.lat !== newLatLng.lat || currentLatLng.lng !== newLatLng.lng) {
            marker.setLatLng(newLatLng);

            // console.log(
            //   `Vehicle ${vehicle.vehicle_name} (IMEI: ${vehicle.imei_number}) moved to:`,
            //   newLatLng
            // );
          }
        }
      }
    });
  }, [vehicles.data]);

  // devices.map((device) => {
  //   console.log("device", device.lat, device.lng);
  // });

  // console.log("selectedVehicle", selectedVehicle);

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

// const MapComponent = () => {
//   const mapRef = useRef(null);
//   const markerRefs = useRef({});
//   const [vehicles, setVehicles] = useState([
//     {
//       id: "1",
//       vehicle_name: "Car A",
//       imei_number: "1234567890",
//       latitude: 19.076,
//       longitude: 72.8777,
//       ioElements: JSON.stringify([{ id: "240", value: 1 }]),
//     },
//   ]);

//   // Simulate movement every 5 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setVehicles((prev) =>
//         prev.map((v) => ({
//           ...v,
//           latitude: v.latitude + 0.01,
//           longitude: v.longitude + 0.01,
//           ioElements: JSON.stringify([
//             { id: "240", value: Math.random() > 0.5 ? 1 : 0 }, // Random movement state
//           ]),
//         }))
//       );
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     vehicles.forEach((vehicle) => {
//       const ioData = JSON.parse(vehicle.ioElements);
//       const movement = ioData.find((item) => item.id === "240");

//       const marker = markerRefs.current[vehicle.id];
//       if (marker) {
//         const newLatLng = L.latLng(vehicle.latitude, vehicle.longitude);
//         marker.setLatLng(newLatLng);
//         marker.setIcon(
//           movement?.value === 1 ? greenLocationPin : redLocationPin
//         );
//         console.log(
//           `Vehicle ${vehicle.vehicle_name} (IMEI: ${vehicle.imei_number}) moved to:`,
//           newLatLng
//         );
//       }
//     });
//   }, [vehicles]);

//   return (
//     <div className="h-screen w-full">
//       <MapContainer
//         center={[19.076, 72.8777]}
//         zoom={10}
//         className="w-full h-full"
//         ref={mapRef}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         {vehicles.map((vehicle) => {
//           const ioData = JSON.parse(vehicle.ioElements);
//           const movement = ioData.find((item) => item.id === "240");

//           return (
//             <Marker
//               key={vehicle.id}
//               position={[vehicle.latitude, vehicle.longitude]}
//               icon={movement?.value === 1 ? greenLocationPin : redLocationPin}
//               ref={(ref) => (markerRefs.current[vehicle.id] = ref)}
//             >
//               <Popup>
//                 <strong>{vehicle.vehicle_name}</strong>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// };

export default MapComponent;
