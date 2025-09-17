import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiService } from '../services';

export const fetchEmergencyReportAlert = createAsyncThunk(
  'emergencyReportAlert/emergencyReportAlert',
  async ({ page, limit, search }, thunkAPI) => {
    try {
      const response = await ApiService.get('/reports/alerts', { page, limit, search });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  emergencyReportAlertData: [],
};

const emergencyReportAlertReducer = createSlice({
  name: 'emergencyReportAlert',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyReportAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyReportAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.emergencyReportAlertData = action.payload;
      })
      .addCase(fetchEmergencyReportAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default emergencyReportAlertReducer.reducer;
