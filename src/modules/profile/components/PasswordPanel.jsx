import { TextField } from '@mui/material';

function PasswordPanel() {
  return (
    <div className='mt-4'>
      <TextField
        label='Current Password'
        fullWidth
        variant='outlined'
        type='password'
        size='small'
        sx={{ mb: 3 }}
        name='currentPassword'
      />
      <TextField
        label='New Password'
        fullWidth
        variant='outlined'
        type='password'
        size='small'
        name='newPassword'
        sx={{ mb: 3 }}
      />
      <TextField
        label='Confirm Password'
        fullWidth
        variant='outlined'
        type='password'
        name='confirmPassword'
        size='small'
      />
      <button
        type='submit'
        className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer mt-4'>
        Update
      </button>
    </div>
  );
}

export default PasswordPanel;
