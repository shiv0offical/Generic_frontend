import { TextField } from '@mui/material';

function CommonSearch({ searchQuery = '', setSearchQuery }) {
  return (
    <div className='flex justify-end bg-white'>
      <TextField
        label='Search'
        variant='outlined'
        size='small'
        sx={{ width: 300 }}
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
      />
    </div>
  );
}

export default CommonSearch;
