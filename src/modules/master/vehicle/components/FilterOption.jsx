import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Typography, Checkbox, Chip } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete } from '@mui/material';

function FilterOption({
  handleClickFilter,
  handleFormReset,
  filterData,
  setFilterData,
  handleFileUpload,
  setFile,
  handleExport,
  handleSample,
  buses = [],
  routes = [],
  fileInputRef,
}) {
  // Helper functions for multi-selects (copied/adapted from employee FilterOption)
  const getOptions = (arr) => [{ label: 'Select All', value: 'SELECT_ALL' }, ...arr];
  const getSelected = (all, selected) =>
    !selected?.length
      ? []
      : selected.length === all.length
      ? [{ label: 'Select All', value: 'SELECT_ALL' }]
      : all.filter((item) => selected.includes(item.value));

  const handleMultiChange = (key, all) => (e, val) => {
    const isAll = val.some((v) => v.value === 'SELECT_ALL');
    setFilterData({
      ...filterData,
      [key]: isAll
        ? filterData[key]?.length === all.length
          ? []
          : all.map((d) => d.value)
        : val.filter((v) => v.value !== 'SELECT_ALL').map((v) => v.value),
    });
  };

  const renderTags = (all, selected) => (value, getTagProps) => {
    if (selected?.length === all.length) return [<Chip key='all' label='All Selected' color='primary' />];
    if (value.length > 2)
      return [
        ...value
          .slice(0, 2)
          .map((option, i) => <Chip key={option.value} label={option.label} {...getTagProps({ index: i })} />),
        <Chip key='more' label={`+${value.length - 2} more`} {...getTagProps({ index: 2 })} />,
      ];
    return value.map((option, i) => <Chip key={option.value} label={option.label} {...getTagProps({ index: i })} />);
  };

  const handleChange = (event) => {
    setFilterData({ ...filterData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  return (
    <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content'>
          <Typography component='span'>Filter option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Autocomplete
              multiple
              disablePortal
              options={getOptions(buses)}
              size='small'
              fullWidth
              disableCloseOnSelect
              renderInput={(params) => <TextField {...params} label='Select Vehicle' />}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              getOptionLabel={(o) => o.label}
              onChange={handleMultiChange('bus', buses)}
              value={getSelected(buses, filterData.bus)}
              renderTags={renderTags(buses, filterData.bus)}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
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
            <Autocomplete
              multiple
              disablePortal
              options={getOptions(routes)}
              size='small'
              fullWidth
              disableCloseOnSelect
              renderInput={(params) => <TextField {...params} label='Select Route' />}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              getOptionLabel={(o) => o.label}
              onChange={handleMultiChange('route', routes)}
              value={getSelected(routes, filterData.route)}
              renderTags={renderTags(routes, filterData.route)}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
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
            <div>
              <TextField
                label='Import File Here'
                type='file'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                onChange={handleFileChange}
                inputRef={fileInputRef}
                required
              />
            </div>
            <div className='flex gap-2'>
              <button
                type='button'
                className='w-32 text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleFileUpload}>
                Import
              </button>
              <button
                type='button'
                className='w-32 text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleSample}>
                Sample CSV
              </button>
            </div>
            <TextField
              label='From Date'
              type='date'
              InputLabelProps={{ shrink: true }}
              fullWidth
              size='small'
              name='fromDate'
              value={filterData.fromDate}
              onChange={handleChange}
              required
            />
            <TextField
              label='To Date'
              type='date'
              InputLabelProps={{ shrink: true }}
              fullWidth
              size='small'
              name='toDate'
              value={filterData.toDate}
              onChange={handleChange}
              required
            />
            <div className='flex gap-2.5'>
              <button
                type='submit'
                className='w-32 text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleClickFilter}>
                Filter
              </button>
              <button
                type='button'
                className='w-32 text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleFormReset}>
                Reset
              </button>
            </div>
            <div className='flex gap-2.5'>
              <button
                type='button'
                className='w-32 text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                onClick={handleExport}>
                Export CSV
              </button>
              <button
                type='button'
                className='w-32 text-white bg-red-600 hover:bg-red-700 font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                onClick={handleExport}>
                Export PDF
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterOption;
