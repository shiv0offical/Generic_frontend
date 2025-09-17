import { ApiService } from "../../../services";
import { APIURL } from "../../../constants";
import {
  setTodayEmergency,
  setTotalOnboardEmp,
} from "../../../redux/counterCardSlice";

export const fetchEmployeeOnboard = async (dispatch) => {
  const empOnboardRes = await ApiService.get(APIURL.COUNTONBOARDEMP);
  console.log(
    "🚀 ~ counterCardAction.js:10 ~ fetchEmployeeOnboard ~ empOnboardRes:",
    empOnboardRes.data
  );

  if (empOnboardRes?.success) {
    let total = 0;
    empOnboardRes.data.forEach((data) => {
      // console.log(data.Vehicle_Route);
      const vehicleRoute = data.Vehicle_Route;

      if (vehicleRoute && vehicleRoute.length > 0) {
        // console.log(
        //   "🚀 ~ :25 ~ empOnboardRes.data.map ~ vehicleRoute:",
        //   vehicleRoute[0].onboard_employee_count
        // );

        const route = vehicleRoute[0];
        total += route.onboard_employee_count || 0;
      }
    });

    dispatch(setTotalOnboardEmp(total));
  } else {
    console.error("Failed to Fetch Employee Onboard data...");
  }
};

export const fetchEmergencyData = async (dispatch) => {
   let params = {};

    // only add company_id if path is dashboard
    if (window.location.pathname.startsWith("/dashboard")) {
      const company_id = localStorage.getItem("company_id");
      if (company_id) {
        params.company_id = company_id;
      }
    }

  const emergencyRes = await ApiService.get(APIURL.DASHBOARDEMERGENCY, params);

  if (emergencyRes?.success) {
    const today = new Date().toISOString().split("T")[0];

    const todayData = emergencyRes.data.filter((item) => {
      const createdDate = new Date(item.created_at).toISOString().split("T")[0];
      return createdDate === today;
    });

    // console.log("🚀 ~ :60 ~ todayData ~ todayData:", todayData);
    dispatch(setTodayEmergency(todayData.length));
  }
};
