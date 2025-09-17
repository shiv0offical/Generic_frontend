import { APIURL } from "../../../constants";
import { ApiService } from "../../../services";
import {
  setCurrentData,
  setDays,
  setPreviousData,
} from "../../../redux/empBoardingStatusSlice";

export const fetchEmpBoardingData = async (dispatch) => {
  try {
    let params = {};

    // only add company_id if path is dashboard
    if (window.location.pathname.startsWith("/dashboard")) {
      const company_id = localStorage.getItem("company_id");
      if (company_id) {
        params.company_id = company_id;
      }
    }
    const empBoardingRes = await ApiService.get(APIURL.TOTALONBOARDEMP,params);

    if (empBoardingRes?.success) {
      const weekChart = empBoardingRes.data?.weekChart || [];

      dispatch(setPreviousData(weekChart.map((e) => e.previous)));
      dispatch(setCurrentData(weekChart.map((e) => e.current)));
      dispatch(setDays(weekChart.map((e) => e.day)));
    } else {
      console.error("Failed to fetch employee boarding data.");
    }
  } catch (err) {
    console.error("Error fetching employee boarding data:", err);
  }
};
