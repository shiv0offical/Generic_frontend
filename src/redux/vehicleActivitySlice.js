import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiService } from '../services';

// ✅ Async thunk for Vehicle Activity
export const fetchVehicleActivityMoment = createAsyncThunk(
  'feedbackReport/fetchVehicleActivityMoment',
  async ({ company_id, vehicle_id, start_time, end_time, type }, thunkAPI) => {
    try {
      const response = await ApiService.get('routestopreport', {
        company_id,
        vehicle_id,
        start_time,
        end_time,
        type,
      });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleActivityData = createAsyncThunk(
  'vehicleActivity/fetchVehicleActivityData',
  async ({ page, limit }, thunkAPI) => {
    try {
      const response = await ApiService.get('report/vehicleactivity', { page, limit });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const fetchVehicleMissingInflux = createAsyncThunk(
  'vehicle_missing_influx/fetchVehicleMissingInflux',
  async ({ company_id, page, limit }, thunkAPI) => {
    try {
      const response = await ApiService.get('vehicle_missing_influx', {
        company_id,
        page,
        limit,
      });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Initial State
const initialState = {
  vehicleActivityMomentData: [],
  vehicleMissingInflux: [],
  activityData: [],
  loading: false,
  error: null,
};

// ✅ Slice
const vehicleActivitySliceReport = createSlice({
  name: 'vehicleActivity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleActivityMoment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleActivityMoment.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleActivityMomentData = action.payload;
      })
      .addCase(fetchVehicleActivityMoment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleActivityData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleActivityData.fulfilled, (state, action) => {
        state.loading = false;
        state.activityData = action.payload;
      })
      .addCase(fetchVehicleActivityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleMissingInflux.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleMissingInflux.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleMissingInflux = action.payload;
      })
      .addCase(fetchVehicleMissingInflux.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vehicleActivitySliceReport.reducer;
