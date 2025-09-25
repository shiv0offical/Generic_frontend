import { APIURL } from '../../constants';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Lastvehicledata } from '../../services';
import { useEffect, useRef, useState } from 'react';
import MapComponent from './components/MapComponent';
import TrackingPanel from './components/TrackingPanel';
import MheStatusPanel from './components/MheStatusPanel';
import { fetchLastVehicles, fetchVehicles } from '../../redux/vehicleSlice';

export default function Multitrack() {
  const lastPath = useRef();
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isMheStatusVisible, setIsMheStatusVisible] = useState(false);

  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    let mounted = true;
    (async () => {
      const token = localStorage.getItem('authToken');
      const company_id = localStorage.getItem('company_id');
      if (!token || !company_id) return;

      let vehicles = [];
      const res = dispatch(fetchVehicles({ limit: 100 }));
      vehicles = res?.payload?.data || [];

      const imeis = vehicles.map((v) => v.imei_number).filter(Boolean);
      if (!imeis.length) return;

      let lastData = await Promise.all(
        imeis.map((imei) => Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imei}`).catch(() => null))
      );
      const valid = lastData.filter((d) => d && d.success);
      if (valid.length && mounted) dispatch(fetchLastVehicles(valid));
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch, location.pathname]);

  const handleRightPanel = (vehicle) => {
    if (isMheStatusVisible && vehicle?.imei === selectedVehicle?.imei) {
      setIsMheStatusVisible(false);
      setSelectedVehicle(null);
    } else {
      setSelectedVehicle(vehicle);
      setIsMheStatusVisible(true);
    }
  };

  return (
    <div className='relative flex-1 h-screen rounded-md'>
      <TrackingPanel handleRightPanel={handleRightPanel} />
      <MapComponent selectedVehicle={selectedVehicle} />
      {isMheStatusVisible && (
        <MheStatusPanel
          handleRightPanel={handleRightPanel}
          isShowPanel={isMheStatusVisible}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
}
