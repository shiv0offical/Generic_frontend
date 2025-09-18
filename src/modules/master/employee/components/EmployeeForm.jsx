import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AddressServices, ApiService } from "../../../../services";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { APIURL } from "../../../../constants";
import { useDropdownOpt } from "../../../../hooks/useDropdownOpt";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function EmployeeForm() {
  const companyID = localStorage.getItem("company_id");

  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state;
  // console.log(rowData);

  const fileInputRef = useRef(null);
  const [addressOnSearch, setAddressOnSearch] = useState([]);
  const [selectedAddressOption, setSelectedAddressOption] = useState(null);
  const addressTimeoutRef = useRef(null);
  const [formVal, setFormVal] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    punchId: "",
    email: "",
    phoneNumber: "",
    selectedDepartment: "",
    selectedPlant: "",
    dateOfJoining: "",
    dateOfBirth: "",
    selectedGender: "",
    vehicleRoute: "",
    boardingPoint: "",
    profilePhoto: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const {
    options: departmentOption,
    loading: departmentLoading,
    error: departmentError,
    refetch: departmentRefetch,
  } = useDropdownOpt({
    apiUrl: APIURL.DEPARTMENTS,
    queryParams: { company_id: companyID },
    dataKey: "departments",
    labelSelector: (d) => {
    return d?.department_name ?? "";
  },
    valueSelector: (d) => d.id,
  });

  const {
    options: plantOption,
    loading: plantLoading,
    error: plantError,
    refetch: plantRefetch,
  } = useDropdownOpt({
    apiUrl: APIURL.PLANTS,
    dataKey: "plants",
    queryParams: { company_id: companyID },
    labelSelector: (d) => `${d?.plant_name}`,
    valueSelector: (d) => d.id,
  });

  const {
    options: routeOption,
    loading: routeLoading,
    error: routeError,
    refetch: routeRefetch,
  } = useDropdownOpt({
    apiUrl: APIURL.VEHICLE_ROUTE,
    dataKey:"routes",
    queryParams: { company_id: companyID },
    labelSelector: (d) => `${d.name}`,
    valueSelector: (d) => d.id,
  });

  const {
    options: bordingOption,
    loading: bordingLoading,
    error: bordingError,
    refetch: bordingRefetch,
  } = useDropdownOpt({
    apiUrl: formVal.vehicleRoute
    ? `${APIURL.VEHICLE_ROUTE}/${formVal.vehicleRoute}/stops`
    : null,
    labelSelector: (d) => `${d.address}`,
    valueSelector: (d) => d.id,
    dataKey:"stops"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setProfilePhoto(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (rowData) {
      if (rowData.mode === "edit" || rowData.mode === "view") {
        const data = rowData.rowData;
        const [firstName = "", lastName = ""] =
          data.employeeName?.split(" ") || [];

          const selectedAddress = data.address
        ? {
            label: data.address,
            value: data.latitude + "-" + data.longitude, // unique key
            otherData: {
              display_name: data.address,
              lat: data.latitude,
              lon: data.longitude,
            },
          }
        : null;

        setFormVal({
          firstName,
          lastName,
          employeeId: data.employee_id || "",
          punchId: data.punchId || "",
          email: data.email || "",
          phoneNumber: data.mobileNumber || "",
          selectedDepartment: data.departmentId || "",
          selectedPlant: data.plantId || "",
          dateOfJoining: data.doj || "",
          dateOfBirth: data.dob || "",
          selectedGender:
            data.gender === "Male" ? "2" : data.gender === "Female" ? "1" : "",
          vehicleRoute: data.routeId || "",
          boardingPoint: data?.boardingPoint,
          profilePhoto: null,
          address: data.address || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
        });
          setSelectedAddressOption(selectedAddress);
      }
    }
  }, [rowData]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      first_name: formVal.firstName,
      last_name: formVal.lastName,
      employee_id: formVal.employeeId,
      punch_id: formVal.punchId,
      email: formVal.email,
      phone_number: formVal.phoneNumber,
      department_id: formVal.selectedDepartment,
      plant_id: formVal.selectedPlant,
      date_of_joining: formVal.dateOfJoining,
      date_of_birth: formVal.dateOfBirth,
      gender: formVal.selectedGender,
      vehicle_route_id: formVal.vehicleRoute,
      boardingPoint:formVal.boardingPoint,
      profile_img: formVal.profilePhoto?.name,
      latitude: parseFloat(formVal.latitude),
      longitude: parseFloat(formVal.longitude),
      address: formVal.address,
      boarding_latitude: parseFloat(formVal.latitude),
      boarding_longitude: parseFloat(formVal.longitude),
      boarding_address: formVal.address,
      status_id: 1,
    };

    if (rowData) {
      const res = await ApiService.put(
        `${APIURL.EMPLOYEE}/${rowData.rowData.actual_id}?company_id=${companyID}`,
        payload
      );

      if (res.success) {
        navigate("/master/employee");
      } else {
        alert(res.message || "Something went wrong.");
        console.error(res.message);
      }
    } else {
      const res = await ApiService.post(APIURL.EMPLOYEE, payload);

      if (res.success) {
        navigate("/master/employee");
      } else {
        alert(res.message || "Something went wrong.");
        console.error(res.message);
      }
    }
  };

  return (
    <div className="w-full h-full p-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 text-[#07163d]">Employee</h1>
      </div>
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-col-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-sm border-t-3 border-[#07163d]">
            <h2 className="text-lg p-3 text-gray-700">Employee Detail</h2>
            <hr className="border border-gray-300" />
            <div className="p-5">
              <div className="grid grid-col-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee First Name <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="firstName"
                    id="firstName"
                    fullWidth
                    required
                    placeholder="Employee First Name"
                    value={formVal.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee Last Name
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="lastName"
                    id="lastName"
                    fullWidth
                    placeholder="Employee Last Name"
                    value={formVal.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee Id
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="employeeId"
                    id="employeeId"
                    fullWidth
                    placeholder="Employee Id"
                    value={formVal.employeeId}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Punch Id
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="punchId"
                    id="punchId"
                    fullWidth
                    placeholder="Punch Id"
                    value={formVal.punchId}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <TextField
                    size="small"
                    type="email"
                    name="email"
                    id="email"
                    fullWidth
                    placeholder="Email"
                    value={formVal.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Phone Number
                  </label>
                  <TextField
                    size="small"
                    type="number"
                    name="phoneNumber"
                    id="phoneNumber"
                    fullWidth
                    placeholder="Phone Number"
                    value={formVal.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Select Department
                  </label>
                  <Autocomplete
                    disablePortal
                    options={departmentOption}
                    loading={departmentLoading}
                    //  disabled={isViewMode}
                    value={
                      departmentOption.find(
                        (opt) => opt.value === formVal.selectedDepartment
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormVal((prev) => ({
                        ...prev,
                        selectedDepartment: newValue ? newValue.value : "",
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option?.value === value?.value
                    }
                    getOptionLabel={(option) => option?.label || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Department"
                        size="small"
                        fullWidth
                        value={
                          departmentOption.find(
                            (opt) => opt.value === formVal.selectedDepartment
                          ) || null
                        }
                        // error={!!errors.selectedDepartment}
                        // helperText={errors.selectedDepartment}
                      />
                    )}
                  />
                  {departmentError && (
                    <p className="text-red-500 text-sm mt-1">
                      Failed to load Department.{" "}
                      <button
                        onClick={departmentRefetch}
                        className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Select Plant
                  </label>
                  <Autocomplete
                    disablePortal
                    options={plantOption}
                    loading={plantLoading}
                    //  disabled={isViewMode}
                    value={
                      plantOption.find(
                        (opt) => opt.value === formVal.selectedPlant
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormVal((prev) => ({
                        ...prev,
                        selectedPlant: newValue ? newValue.value : "",
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option?.value === value?.value
                    }
                    getOptionLabel={(option) => option?.label || ""} // handle empty values safely
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Plant"
                        size="small"
                        fullWidth
                        value={
                          plantOption.find(
                            (opt) => opt.value === formVal.selectedPlant
                          ) || null
                        }
                        // error={!!errors.selectedDepartment}
                        // helperText={errors.selectedDepartment}
                      />
                    )}
                  />
                  {plantError && (
                    <p className="text-red-500 text-sm mt-1">
                      Failed to load Department.{" "}
                      <button
                        onClick={plantRefetch}
                        className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Joining Date
                  </label>
                  <TextField
                    size="small"
                    type="date"
                    name="dateOfJoining"
                    id="dateOfJoining"
                    fullWidth
                    placeholder="Joining Date"
                    value={formVal.dateOfJoining}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Date Of Birth
                  </label>
                  <TextField
                    size="small"
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    fullWidth
                    placeholder="Date Of Birth"
                    value={formVal.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <FormControl>
                    <FormLabel id="gender-radio">Gender</FormLabel>
                    <RadioGroup
                      aria-labelledby="gender-radio"
                      defaultValue="female"
                      value={formVal.selectedGender}
                      name="selectedGender"
                      onChange={handleChange}
                    >
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="Female"
                      />
                      <FormControlLabel
                        value="2"
                        control={<Radio />}
                        label="Male"
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Bus Route
                  </label>
                  <Autocomplete
                    disablePortal
                    loading={routeLoading}
                    options={routeOption}
                    value={
                      routeOption.find(
                        (opt) => opt.value === formVal.vehicleRoute
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormVal((prev) => ({
                        ...prev,
                        vehicleRoute: newValue ? newValue.value : "",
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option?.value === value?.value
                    }
                    getOptionLabel={(option) => option?.label || ""} // handle empty values safely
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Route"
                        size="small"
                        fullWidth
                        value={
                          routeOption.find(
                            (opt) => opt.value === formVal.vehicleRoute
                          ) || null
                        }
                        // error={!!errors.selectedDepartment}
                        // helperText={errors.selectedDepartment}
                      />
                    )}
                  />

                  {routeError && (
                    <p className="text-red-500 text-sm mt-1">
                      Failed to load Route.{" "}
                      <button
                        onClick={routeRefetch}
                        className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Boarding Point
                  </label>

                  <Autocomplete
                    disablePortal
                    loading={bordingLoading}
                    options={bordingOption}
                    value={
                      bordingOption.find(
                        (opt) => opt.value === formVal.boardingPoint
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormVal((prev) => ({
                        ...prev,
                        boardingPoint: newValue ? newValue.value : "",
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option?.value === value?.value
                    }
                    getOptionLabel={(option) => option?.label || ""} // handle empty values safely
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Boarding Points"
                        size="small"
                        fullWidth
                        value={
                          routeOption.find(
                            (opt) => opt.value === formVal.boardingPoint
                          ) || null
                        }
                        // error={!!errors.selectedDepartment}
                        // helperText={errors.selectedDepartment}
                      />
                    )}
                  />

                  {bordingError && (
                    <p className="text-red-500 text-sm mt-1">
                      Failed to load Boarding Point.{" "}
                      <button
                        onClick={bordingRefetch}
                        className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Profile Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <div
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={() => fileInputRef.current.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        name="profile"
                        id="profile"
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setFormVal((prev) => ({
                              ...prev,
                              profilePhoto: file,
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  {formVal.profilePhoto && (
                    <img
                      src={
                        typeof profilePhoto === "string"
                          ? profilePhoto
                          : URL.createObjectURL(formVal.profilePhoto)
                      }
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-full border mt-3"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-sm border-t-3 border-[#07163d]">
            <h2 className="text-lg p-3 text-gray-700">Employee Address</h2>
            <hr className="border border-gray-300" />
            <div className="p-5">
              <div className="grid grid-col-1 md:grid-cols-1 gap-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Address
                  </label>
                  <Autocomplete
                    disablePortal
                    //  disabled={isViewMode}
                    options={addressOnSearch?.map((item) => {
                      return {
                        label: item.display_name,
                        value: item.place_id,
                        otherData: item,
                      };
                    })}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value
                    }
                    getOptionKey={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Address"
                        // error={!!errors.address}
                        // helperText={errors.address}
                      />
                    )}
                    onInputChange={(event, value) => {
                      if (addressTimeoutRef.current) {
                        clearTimeout(addressTimeoutRef.current);
                      }
                      addressTimeoutRef.current = setTimeout(async () => {
                        if (value.length > 0) {
                          const addresses =
                            await AddressServices.getLocationFromName(value);
                          if (addresses.length > 0) {
                            setAddressOnSearch(addresses);
                          }
                        }
                      }, 500);
                    }}
                    value={selectedAddressOption}
                    onChange={(event, value) => {
                      if (value) {
                        setFormVal((prev) => ({
                          ...prev,
                          address: value.otherData.display_name,
                          latitude: value.otherData.lat,
                          longitude: value.otherData.lon,
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-col-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Latitude
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="latitude"
                    id="latitude"
                    fullWidth
                    placeholder="Latitude"
                    value={formVal.latitude}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Longitude
                  </label>
                  <TextField
                    size="small"
                    type="text"
                    name="longitude"
                    id="longitude"
                    fullWidth
                    placeholder="Longitude"
                    value={formVal.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-col-1 md:grid-cols-1 gap-3 mt-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Map <span className="text-red-500">*</span>
                  </label>
                  <div className="map w-full h-70 bg-gray-500 rounded-2xl">
                    <MapContainer
                      center={[20.5937, 78.9629]}
                      zoom={5}
                      className="w-full h-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      {formVal.latitude && formVal.longitude ? (
                        <Marker
                          key={formVal.latitude}
                          position={[
                            parseFloat(formVal.latitude),
                            parseFloat(formVal.longitude),
                          ]}
                          icon={customIcon}
                        >
                          <Popup>
                            <div>
                              <strong>{formVal.address}</strong>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null}
                    </MapContainer>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="submit"
                  className="text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer"
                >
                  Save
                </button>
                <Link to="/master/employee">
                  <button
                    type="button"
                    className="text-white bg-gray-500 hover:bg-gray-500/90 focus:ring-4 focus:outline-none focus:ring-gray-500/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer"
                  >
                    Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;