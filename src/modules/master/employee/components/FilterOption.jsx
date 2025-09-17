import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

// const departments = [
//   { label: "The Shawshank Redemption", value: "1994" },
//   { label: "Department", value: "1994" },
// ];

function FilterOption({
  handleClickFilter,
  handleFormReset,
  fileInputRef,
  filterData,
  setFilterData,
  handleFileUpload,
  setFile,
  handleExport,
  departments,
}) {
  const handleChange = (event) => {
    setFilterData({
      ...filterData,
      [event.target.name]: event.target.value,
    });
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
            <FormControl fullWidth>
              <Autocomplete
                disablePortal
                options={departments}
                isOptionEqualToValue={(option, value) => option.value === value}
                getOptionLabel={(option) => option?.label || ''}
                size='small'
                renderInput={(params) => <TextField {...params} label='Select Department' />}
                onChange={(event, newValue) => {
                  setFilterData({
                    ...filterData,
                    department: newValue ? newValue.value : '',
                  });
                }}
                value={departments.find((opt) => opt.value === filterData.department) || null}
              />
            </FormControl>
            <div className='flex gap-2.5'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleClickFilter}>
                Filter
              </button>
              <button
                type='button'
                className='text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleFormReset}>
                Reset
              </button>
              <button
                type='button'
                className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 mt-5 gap-3'>
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
                className='text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleFileUpload}>
                Import
              </button>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'>
                Sample CSV
              </button>
              <div>
                <Link to='/master/employee/create'>
                  <button
                    type='button'
                    className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'>
                    New Employee
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterOption;
