import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, TextField, Typography } from '@mui/material';

function FilterOption({
  handleClickFilter,
  handleFormReset,
  filterData,
  setFilterData,
  handleFileUpload,
  setFile,
  handleExport,
  handleSample,
}) {
  const handleChange = (event) => {
    setFilterData({ ...filterData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile({ ...file, file: file });
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
                onChange={handleFileChange}
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
                type='button'
                className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleSample}>
                Sample CSV
              </button>
              <div>
                <Link to='/master/vehicle/create'>
                  <button
                    type='button'
                    className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'>
                    New Vehicle
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
