import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, TextField, Typography } from '@mui/material';

function FilterOption({
  handleClickFilter,
  handleFormReset,
  filterData,
  setFilterData,
  handleExport,
  busOption,
  busRouteOptions,
}) {
  return (
    <>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content'>
            <Typography component='span'>Filter option</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-4 justify-center'>
              {/* Select Vehicle */}
              <div className='flex items-end gap-2'>
                <div className='flex-1'>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Select Vehicle</label>
                  <Autocomplete
                    disablePortal
                    options={busOption}
                    isOptionEqualToValue={(option, value) => option.value === value}
                    getOptionLabel={(option) => option.label}
                    size='small'
                    onChange={(event, newValue) => {
                      setFilterData({
                        ...filterData,
                        bus: newValue ? newValue.value : '',
                      });
                    }}
                    value={busOption.find((opt) => opt.value === filterData.bus) || null}
                    renderInput={(params) => <TextField {...params} label='Select Vehicle' />}
                  />
                </div>
              </div>

              {/* Select Vehicle Route */}
              <div className='flex items-end gap-2 flex-wrap'>
                <div className='flex-1'>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Select Vehicle Route</label>
                  <Autocomplete
                    disablePortal
                    options={busRouteOptions}
                    isOptionEqualToValue={(option, value) => option.value === value}
                    getOptionLabel={(option) => option.label}
                    size='small'
                    onChange={(event, newValue) => {
                      setFilterData({
                        ...filterData,
                        busRoute: newValue ? newValue.value : '',
                      });
                    }}
                    value={busRouteOptions.find((opt) => opt.value === filterData.busRoute) || null}
                    renderInput={(params) => <TextField {...params} label='Select Vehicle Route' />}
                  />
                </div>
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
              </div>

              <div className='flex justify-end items-center gap-2'>
                <Link to='/master/factory-in-time-target/create'>
                  <button
                    type='button'
                    className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'>
                    New Factory In Time Target
                  </button>
                </Link>
                <button
                  type='button'
                  className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                  onClick={handleExport}>
                  Export
                </button>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
}

export default FilterOption;
