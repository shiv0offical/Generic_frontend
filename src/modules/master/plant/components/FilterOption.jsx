import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Typography } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

function FilterOption({ handleFileUpload, setFile, handleExport, handleSample, fileInputRef }) {
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
