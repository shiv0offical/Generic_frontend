import { APIURL } from '../../constants';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import TrackingPanel from './components/TrackingPanel';
import MheStatusPanel from './components/MheStatusPanel';
import { ApiService, Lastvehicledata } from '../../services';
import { fetchLastVehicles, fetchVehicles } from '../../redux/vehicleSlice';

export default function Multitrack() {
  const [isMheStatusVisible, setIsMheStatusVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      const company_id = localStorage.getItem('company_id');
      if (!token || !company_id) return;

      dispatch(fetchVehicles({ limit: 500 }));

      const vehicleRes = await ApiService.get(APIURL.VEHICLE, { limit: 500 });
      if (!vehicleRes?.success || !Array.isArray(vehicleRes.data)) return;

      const imeis = vehicleRes.data.map((v) => v.imei_number).filter(Boolean);
      if (!imeis.length) return;

      const lastData = await Promise.all(
        imeis.map((imei) => Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imei}`).catch(() => null))
      );
      const validData = lastData.filter((d) => d && d.success);
      if (validData.length) dispatch(fetchLastVehicles(validData));
    };

    fetchData();
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
