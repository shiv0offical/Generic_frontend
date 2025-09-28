import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Typography, Checkbox, Chip } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete } from '@mui/material';

function FilterOption({
  handleExport,
  handleExportPDF,
  handleFormSubmit,
  filterData,
  setFilterData,
  handleFormReset,
  busRouteNo = [],
  buses = [],
  geofenceTypes = [],
  startGeoFence = [],
  endGeoFence = [],
  interValOptions = [],
  isDateTime,
  dateField,
  departments = [],
  employeeId,
  employees = [],
  routes = [],
  plants = [],
}) {
  const departmentOptions = departments.map((dept) => ({ label: dept.department_name, value: dept.department_name }));
  const busOptions = [{ label: 'Select All', value: 'SELECT_ALL' }, ...buses];
  const routeOptions = [{ label: 'Select All', value: 'SELECT_ALL' }, ...routes];
  const plantOptions = [{ label: 'Select All', value: 'SELECT_ALL' }, ...plants];

  const handlePlantChange = (event, newValue) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');
    const allPlantValues = plants.map((p) => p.value);

    if (isSelectAllSelected) {
      if (filterData.plants?.length === plants.length) {
        setFilterData({ ...filterData, plants: [] });
      } else {
        setFilterData({ ...filterData, plants: allPlantValues });
      }
    } else {
      const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
      setFilterData({ ...filterData, plants: filtered.map((p) => p.value) });
    }
  };

  const getPlantDisplayValue = () => {
    if (!filterData.plants || filterData.plants.length === 0) return [];
    if (filterData.plants.length === plants.length) return [{ label: 'Select All', value: 'SELECT_ALL' }];

    return plants.filter((p) => filterData.plants.includes(p.value));
  };

  const handleChange = (event) => {
    setFilterData({ ...filterData, [event.target.name]: event.target.value });
  };
  const handleRouteChange = (event, newValue) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');
    const allRouteValues = routes.map((r) => r.value);

    if (isSelectAllSelected) {
      if (filterData.route?.length === routes.length) {
        setFilterData({ ...filterData, route: [] });
      } else {
        setFilterData({ ...filterData, route: allRouteValues });
      }
    } else {
      const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
      setFilterData({ ...filterData, route: filtered.map((r) => r.value) });
    }
  };

  const handleBusChange = (event, newValue) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');
    const allBusValues = buses.map((b) => b.value);

    if (isSelectAllSelected) {
      if (filterData.bus.length === buses.length) {
        setFilterData({ ...filterData, bus: [] });
      } else {
        setFilterData({ ...filterData, bus: allBusValues });
      }
    } else {
      const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
      setFilterData({ ...filterData, bus: filtered.map((b) => b.value) });
    }
  };

  const getRouteDisplayValue = () => {
    if (!filterData.route || filterData.route.length === 0) return [];
    if (filterData.route.length === routes.length) return [{ label: 'Select All', value: 'SELECT_ALL' }];

    return routes.filter((r) => filterData.route.includes(r.value));
  };

  const getBusDisplayValue = () => {
    if (!filterData.bus || filterData.bus.length === 0) return [];
    if (filterData.bus.length === buses.length) return [{ label: 'Select All', value: 'SELECT_ALL' }];

    return buses.filter((b) => filterData.bus.includes(b.value));
  };

  const busRouteNoOptions = [{ label: 'Select All', value: 'SELECT_ALL' }, ...busRouteNo];

  const onChangeEmp = (event, newValue, reason) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');

    const allEmployeeValues = employees.map((e) => e.value);

    if (reason === 'removeOption' && filterData.employee?.length === employees.length) {
      setFilterData({ ...filterData, employee: [] });
      return;
    }

    if (isSelectAllSelected && newValue.length === 1) {
      setFilterData({ ...filterData, employee: allEmployeeValues });
      return;
    }

    if (filterData.employee?.length === employees.length) {
      const removed = employees.find((emp) => !newValue.some((nv) => nv.value === emp.value));
      if (removed) {
        const updated = allEmployeeValues.filter((id) => id !== removed.value);
        setFilterData({ ...filterData, employee: updated });
        return;
      }
    }

    const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
    setFilterData({ ...filterData, employee: filtered.map((e) => e.value) });
  };

  const renderEmp = (value, getTagProps) => {
    if (filterData.employee?.length === employees.length) {
      return ['All Employees Selected'].map((option, index) => {
        const { key, ...tagProps } = getTagProps({ index });
        return <Chip key={key} label={option} {...tagProps} color='primary' />;
      });
    }

    if (value.length > 3) {
      return [
        ...value.slice(0, 2).map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} label={option.label} {...tagProps} />;
        }),
        (() => {
          const { key, ...tagProps } = getTagProps({ index: 2 });
          return <Chip key={key} label={`+${value.length - 2} more`} {...tagProps} />;
        })(),
      ];
    }

    return value.map((option, index) => {
      const { key, ...tagProps } = getTagProps({ index });
      return <Chip key={key} label={option.label} {...tagProps} />;
    });
  };

  const handleBusRouteNoChange = (event, newValue) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');
    const allBusRouteNoValues = busRouteNo.map((b) => b.value);

    if (isSelectAllSelected) {
      if (filterData.busRouteNo?.length === busRouteNo.length) {
        setFilterData({ ...filterData, busRouteNo: [] });
      } else {
        setFilterData({ ...filterData, busRouteNo: allBusRouteNoValues });
      }
    } else {
      const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
      setFilterData({ ...filterData, busRouteNo: filtered.map((b) => b.value) });
    }
  };

  const getBusRouteNoDisplayValue = () => {
    if (!filterData.busRouteNo || filterData.busRouteNo.length === 0) return [];
    if (filterData.busRouteNo.length === busRouteNo.length) return [{ label: 'Select All', value: 'SELECT_ALL' }];

    return busRouteNo.filter((b) => filterData.busRouteNo.includes(b.value));
  };

  const departmentSelectOptions = [{ label: 'Select All', value: 'SELECT_ALL' }, ...departmentOptions];

  const handleDepartmentChange = (event, newValue) => {
    const isSelectAllSelected = newValue.some((opt) => opt.value === 'SELECT_ALL');
    const allDepartmentValues = departmentOptions.map((d) => d.value);

    if (isSelectAllSelected) {
      if (filterData.department?.length === departmentOptions.length) {
        setFilterData({ ...filterData, department: [] });
      } else {
        setFilterData({ ...filterData, department: allDepartmentValues });
      }
    } else {
      const filtered = newValue.filter((opt) => opt.value !== 'SELECT_ALL');
      setFilterData({ ...filterData, department: filtered.map((d) => d.value) });
    }
  };

  const getDepartmentDisplayValue = () => {
    if (!filterData.department || filterData.department.length === 0) return [];

    if (filterData.department.length === departmentOptions.length)
      return [{ label: 'Select All', value: 'SELECT_ALL' }];

    return departmentOptions.filter((d) => filterData.department.includes(d.value));
  };

  return (
    <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content'>
          <Typography component='span'>Filter option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {employees.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={[{ label: 'Select All', value: 'SELECT_ALL' }, ...employees]}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Employee' />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                onChange={onChangeEmp}
                value={employees.filter((e) => filterData.employee.includes(e.value))}
                renderTags={renderEmp}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.employee?.length === employees.length
                          : filterData.employee?.includes(option.value)
                      }
                    />
                    {option.label}
                  </li>
                )}
              />
            )}
            {plants.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={plantOptions}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Plant' />}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                getOptionLabel={(option) => {
                  if (option && typeof option.label === 'string') return option.label;
                  if (option && option.value === 'SELECT_ALL') return 'Select All';
                  return '';
                }}
                onChange={handlePlantChange}
                value={getPlantDisplayValue().filter((opt) => opt && typeof opt.value !== 'undefined')}
                renderOption={(props, option) => (
                  <li {...props} key={option?.value ?? option?.label ?? Math.random()}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.plants?.length === plants.length
                          : filterData.plants?.includes(option.value)
                      }
                    />
                    {option.label || (option.value === 'SELECT_ALL' ? 'Select All' : '')}
                  </li>
                )}
              />
            )}

            {buses.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={busOptions}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Vehicle' />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                onChange={handleBusChange}
                value={getBusDisplayValue()}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.bus?.length === buses.length
                          : filterData.bus?.includes(option.value)
                      }
                    />
                    {option.label}
                  </li>
                )}
              />
            )}

            {routes.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={routeOptions}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Vehicle Route' />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                onChange={handleRouteChange}
                value={getRouteDisplayValue()}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.route?.length === routes.length
                          : filterData.route?.includes(option.value)
                      }
                    />
                    {option.label}
                  </li>
                )}
              />
            )}

            {interValOptions.length > 0 && (
              <Autocomplete
                disablePortal
                options={interValOptions}
                size='small'
                fullWidth
                renderInput={(params) => <TextField {...params} label='Select Interval' />}
                isOptionEqualToValue={(option, value) => option.value === value}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => {
                  setFilterData({ ...filterData, interval: newValue ? newValue.value : '' });
                }}
                value={interValOptions.find((opt) => opt.value === filterData.interval) || null}
              />
            )}

            {geofenceTypes.length > 0 && (
              <Autocomplete
                disablePortal
                options={geofenceTypes}
                size='small'
                fullWidth
                renderInput={(params) => <TextField {...params} label='Select Geofence Type' />}
                isOptionEqualToValue={(option, value) => option.value === value}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => {
                  setFilterData({ ...filterData, geofenceType: newValue ? newValue.value : '' });
                }}
                value={geofenceTypes.find((opt) => opt.value === filterData.geofenceType) || null}
              />
            )}

            {startGeoFence.length > 0 && (
              <>
                <Autocomplete
                  disablePortal
                  options={startGeoFence}
                  size='small'
                  fullWidth
                  renderInput={(params) => <TextField {...params} label='Select Start Geofence' />}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => {
                    setFilterData({ ...filterData, startGeoFence: newValue ? newValue.value : '' });
                  }}
                  value={startGeoFence.find((opt) => opt.value === filterData.startGeoFence) || null}
                />
              </>
            )}
            {endGeoFence.length > 0 && (
              <>
                <Autocomplete
                  disablePortal
                  options={endGeoFence}
                  size='small'
                  fullWidth
                  renderInput={(params) => <TextField {...params} label='Select End Geofence' />}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => {
                    setFilterData({ ...filterData, endGeoFence: newValue ? newValue.value : '' });
                  }}
                  value={endGeoFence.find((opt) => opt.value === filterData.endGeoFence) || null}
                />
              </>
            )}

            {busRouteNo.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={busRouteNoOptions}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Vehicle Route No' />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                onChange={handleBusRouteNoChange}
                value={getBusRouteNoDisplayValue()}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.busRouteNo?.length === busRouteNo.length
                          : filterData.busRouteNo?.includes(option.value)
                      }
                    />
                    {option.label}
                  </li>
                )}
              />
            )}

            {dateField ? (
              <TextField
                label='Date'
                type='date'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                name='interval'
                value={filterData.interval}
                onChange={handleChange}
              />
            ) : null}

            {!isDateTime && (
              <>
                <TextField
                  label='From Date'
                  type='datetime-local'
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size='small'
                  name='fromDate'
                  value={filterData.fromDate}
                  onChange={handleChange}
                />
                <TextField
                  label='To Date'
                  type='datetime-local'
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size='small'
                  name='toDate'
                  value={filterData.toDate}
                  onChange={handleChange}
                />
              </>
            )}

            {departments.length > 0 && (
              <Autocomplete
                multiple
                disablePortal
                options={departmentSelectOptions}
                size='small'
                fullWidth
                disableCloseOnSelect
                renderInput={(params) => <TextField {...params} label='Select Department' />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                onChange={handleDepartmentChange}
                value={getDepartmentDisplayValue()}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={
                        option.value === 'SELECT_ALL'
                          ? filterData.department?.length === departmentOptions.length
                          : filterData.department?.includes(option.value)
                      }
                    />
                    {option.label}
                  </li>
                )}
              />
            )}

            {employeeId && (
              <TextField
                label='Employee Id'
                type='text'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                name='employeeId'
                value={filterData.employeeId}
                onChange={handleChange}
              />
            )}

            <div className='flex gap-2.5'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[rgb(7,22,61)] font-medium rounded-sm text-sm w-24 px-5 py-2.5 cursor-pointer'
                onClick={handleFormSubmit}>
                Filter
              </button>
              <button
                type='button'
                className='text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm w-24 px-5 py-2.5 cursor-pointer'
                onClick={handleFormReset}>
                Reset
              </button>
              <button
                type='button'
                className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm w-24 px-5 py-2.5 cursor-pointer'
                onClick={handleExport}>
                Export
              </button>
              <button
                type='button'
                className='text-white bg-red-600 hover:bg-red-700 font-medium rounded-sm text-sm w-24 px-5 py-2.5 cursor-pointer'
                onClick={handleExportPDF}>
                Export PDFs
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterOption;
