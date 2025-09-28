// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import vehicleReducer from './vehicleSlice';
import vehiclesReducer from './vehiclesSlice';
import departmentReducer from './departmentSlice';
import plantReducer from './plantSlice';
import driverReducer from './driverSlice';
import vehicleRouteReducer from './vehicleRouteSlice';
import geofenceSliceReducer from './geofenceSlice';
import punchInOutReducer from './punchInOutSlice';
import employeeReducer from './employeeSlice';
import vehicleReportReducer from './vehicleReportSlice';
import multiTrackStatusReducer from './multiTrackSlice';
import empBoardingStatusReducer from './empBoardingStatusSlice';
import lateArrivalStatusReducer from './lateArrivalSlice';
import overspeedStatusReducer from './overspeedStatusSlice';
import distanceCoverStatusReducer from './distanceCoverStatusSlice';
import emergencyReportAlertReducer from './emergencyReportAlertSlice';
import feedBackReportReducer from './feedBackReportSlice';
import vehicleActivityReducer from './vehicleActivitySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicle: vehicleReducer,
    vehicles: vehiclesReducer,
    department: departmentReducer,
    plant: plantReducer,
    driver: driverReducer,
    vehicleRoute: vehicleRouteReducer,
    geofence: geofenceSliceReducer,
    employee: employeeReducer,
    vehicleReport: vehicleReportReducer,
    punchInOut: punchInOutReducer,
    emergencyReportAlert: emergencyReportAlertReducer,
    multiTrackStatus: multiTrackStatusReducer,
    empBoardingStatus: empBoardingStatusReducer,
    distanceCoverStatus: distanceCoverStatusReducer,
    lateArrivalStatus: lateArrivalStatusReducer,
    overspeedStatus: overspeedStatusReducer,
    feedbackReport: feedBackReportReducer,
    vehicleActivity: vehicleActivityReducer,
  },
});

export default store;
