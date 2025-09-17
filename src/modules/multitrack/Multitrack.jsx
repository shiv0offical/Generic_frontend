import { useEffect, useState } from "react";
import MapComponent from "./components/MapComponent";
import MheStatusPanel from "./components/MheStatusPanel";
import TrackingPanel from "./components/TrackingPanel";
import { useDispatch, useSelector } from "react-redux";
import { fetchLastVehicles, fetchVehicles } from "../../redux/vehicleSlice";
import { ApiService, Lastvehicledata } from "../../services";
// import { connectSocket, disconnectSocket } from "../../socket/socketService";
import { APIURL } from "../../constants";
import { useLocation } from "react-router-dom";

export default function Multitrack() {
  const [isMheStatusVisible, setIsMheStatusVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const dispatch = useDispatch();
  const location = useLocation();

  const handleFetchVehicles = async () => {
    const token = localStorage.getItem("authToken");
    const params = {
      company_id: localStorage.getItem("company_id"),
    };
    if (token) {
      // First fetch the vehicle list
      const vehicleRes = await ApiService.get(APIURL.ASSIGNSEAT,params);
      // const vehicleRes = await ApiService.get(APIURL.VEHICLE);

      if (vehicleRes?.success) {
        dispatch(fetchVehicles(params));

        // Now that vehicles are available (in vehicleRes), use it directly
        const imeiNumbers = vehicleRes.data.map(
          (vehicle) => vehicle.imei_number
        );

        const vehicleDataArray = [];

        for (let imei of imeiNumbers) {
          try {
            // const url = `lastvehicledata?imei=${imei}`;
            // const data = await Lastvehicledata.get(url);
            const data = await Lastvehicledata.get(
              `${APIURL.LASTVEHICLEDATA}?imei=${imei}`
            );
            if (data?.success) {
              // console.log(`Data for IMEI ${imei}:`, data);
              vehicleDataArray.push(data);
            } else {
              console.error(`Failed to fetch data for IMEI ${imei}`);
            }
          } catch (error) {
            console.error(`Error fetching data for IMEI ${imei}:`, error);
          }
        }

        if (vehicleDataArray.length > 0) {
          dispatch(fetchLastVehicles(vehicleDataArray));
        } else {
          console.error("No valid data to dispatch for last vehicles");
        }
      } else {
        console.error("Failed to fetch vehicles");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await handleFetchVehicles();
    };

    fetchData();
  }, [location.pathname]);

  const handleRightPanel = (vehicle) => {
    // If same vehicle is clicked again, close the panel
    if (isMheStatusVisible && vehicle?.imei === selectedVehicle?.imei) {
      setIsMheStatusVisible(false);
      setSelectedVehicle(null);
    } else {
      setSelectedVehicle(vehicle);
      setIsMheStatusVisible(true);
    }
    // setSelectedVehicle(vehicle);
    // setIsMheStatusVisible(true);
  };

  return (
    <>
      <div className="relative flex-1 h-screen rounded-md">
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
    </>
  );
}
