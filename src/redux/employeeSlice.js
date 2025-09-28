import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '../services';

// Async thunk for creating employee
export const createEmployee = createAsyncThunk('employee/createEmployee', async (formData, { rejectWithValue }) => {
  try {
    const response = await ApiService.post('employee', formData);

    if (!response.success) return rejectWithValue(response.message || 'Failed to create employee');

    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Something went wrong');
  }
});

// Async thunk for updating employee
export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await ApiService.put(`employee/${id}`, formData);

      if (!response.success) return rejectWithValue(response.message || 'Failed to update employee');

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching list of employees
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async ({ company_id }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ company_id }).toString();
      const response = await ApiService.get(`employee?${query}`);

      if (!response.success) return rejectWithValue(response.message || 'Failed to fetch employees');

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching the list of employees for the reports
export const fetchEmployeeOnboard = createAsyncThunk(
  'employee/fetchEmployeeOnboard',
  async ({ company_id, department_id, start, end, employee_id, vehicle_route_id, plant_id }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        company_id,
        department_id,
        start,
        end,
        employee_id,
        vehicle_route_id,
        plant_id,
      }).toString();

      const response = await ApiService.get(`emponboard?${queryParams}`);

      if (!response.success) return rejectWithValue(response.message || 'Failed to fetch onboard employees');

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching all employee details
export const fetchAllEmployeeDetails = createAsyncThunk(
  'employee/fetchAllEmployeeDetails',
  async ({ company_id, page = 1, limit = 1000 }, { rejectWithValue }) => {
    try {
      const response = await ApiService.get('employe', { company_id, page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  employees: [],
  onboardEmployees: [],
  getAllEmployeeDetails: [],
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // createEmployee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEmployee.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployee.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchEmployeeOnboard
      .addCase(fetchEmployeeOnboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeOnboard.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardEmployees = action.payload;
      })
      .addCase(fetchEmployeeOnboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAllEmployeeDetails
      .addCase(fetchAllEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.getAllEmployeeDetails = action.payload;
      })
      .addCase(fetchAllEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = employeeSlice.actions;
export default employeeSlice.reducer;
