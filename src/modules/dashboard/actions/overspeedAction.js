import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { setCurrentData, setDays, setPreviousData } from '../../../redux/overspeedStatusSlice';

export const fetchOverspeedData = async (dispatch) => {
  try {
    let params = {};

    if (window.location.pathname.startsWith('/dashboard')) {
      const company_id = localStorage.getItem('company_id');
      if (company_id) params.company_id = company_id;
    }

    const speedViolationRes = await ApiService.get(APIURL.OVERSPEEDVIOLATION, params);
    if (speedViolationRes?.success) {
      const weekChart = speedViolationRes.data?.weekChart || [];
      dispatch(setPreviousData(weekChart.map((e) => e.previous)));
      dispatch(setCurrentData(weekChart.map((e) => e.current)));
      dispatch(setDays(weekChart.map((e) => e.day)));
    } else {
      console.error('Failed to fetch employee boarding data.');
    }
  } catch (err) {
    console.error('Error fetching employee boarding data:', err);
  }
};
