import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  TextField,
  Typography,
  Checkbox,
  Chip,
} from '@mui/material';

function FilterOption({
  handleClickFilter,
  handleFormReset,
  fileInputRef,
  filterData,
  setFilterData,
  handleFileUpload,
  setFile,
  handleExport,
  departments = [],
  employees = [],
  handleSample,
}) {
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

  const handleChange = (e) => setFilterData({ ...filterData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

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
              options={getOptions(departments)}
              size='small'
              fullWidth
              disableCloseOnSelect
              renderInput={(params) => <TextField {...params} label='Select Department' />}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              getOptionLabel={(o) => o.label}
              onChange={handleMultiChange('department', departments)}
              value={getSelected(departments, filterData.department)}
              renderTags={renderTags(departments, filterData.department)}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  <Checkbox
                    style={{ marginRight: 8 }}
                    checked={
                      option.value === 'SELECT_ALL'
                        ? filterData.department?.length === departments.length
                        : filterData.department?.includes(option.value)
                    }
                  />
                  {option.label}
                </li>
              )}
            />
            <Autocomplete
              multiple
              disablePortal
              options={getOptions(employees)}
              size='small'
              fullWidth
              disableCloseOnSelect
              renderInput={(params) => <TextField {...params} label='Select Employee' />}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              getOptionLabel={(o) => o.label}
              onChange={handleMultiChange('employee', employees)}
              value={getSelected(employees, filterData.employee)}
              renderTags={renderTags(employees, filterData.employee)}
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
            <div>
              <TextField
                label='Import File Here'
                type='file'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                name='importFile'
                onChange={handleFileChange}
                inputRef={fileInputRef}
                required
              />
            </div>
            <div className='flex gap-2'>
              <button
                type='button'
                className='w-32 text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                onClick={handleFileUpload}>
                Import
              </button>
              <button
                type='button'
                className='w-32 text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
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
              onChange={handleChange}
              value={filterData.fromDate}
              required
            />
            <TextField
              label='To Date'
              type='date'
              InputLabelProps={{ shrink: true }}
              fullWidth
              size='small'
              name='toDate'
              onChange={handleChange}
              value={filterData.toDate}
              required
            />
            <div className='flex gap-2.5'>
              <button
                type='submit'
                className='w-32 text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                onClick={handleClickFilter}>
                Filter
              </button>
              <button
                type='button'
                className='w-32 text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
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
