import { TextField } from '@mui/material';
import { useState } from 'react';

function Information() {
  const [formData, setFormData] = useState({
    firstName: 'One',
    lastName: 'Touch',
    email: 'company@mailinator.com',
    phoneNumber: '1234567890',
    file: null,
  });

  const inputChangeHandler = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const formSubmitHandle = (event) => {
    event.preventDefault();
    console.log(formData);
  };

  return (
    <div className='mt-3'>
      <form onSubmit={formSubmitHandle}>
        <div className='grid grid-cols-2 gap-4'>
          <TextField
            label='First Name'
            variant='outlined'
            size='small'
            name='firstName'
            value={formData.firstName}
            onChange={inputChangeHandler}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label='Last Name'
            variant='outlined'
            defaultValue='Touch'
            size='small'
            name='lastName'
            value={formData.lastName}
            onChange={inputChangeHandler}
            fullWidth
            sx={{ mb: 3 }}
          />
        </div>
        <TextField
          label='Email'
          fullWidth
          variant='outlined'
          size='small'
          name='email'
          value={formData.email}
          onChange={inputChangeHandler}
          disabled
          sx={{ mb: 3 }}
        />
        <TextField
          label='Phone Number'
          size='small'
          variant='outlined'
          name='phoneNumber'
          fullWidth
          value={formData.phoneNumber}
          onChange={inputChangeHandler}
          sx={{ mb: 3 }}
        />
        <div>
          <input
            type='file'
            className='block w-full text-sm text-gray-500'
            name='file'
            value={formData.file}
            onChange={inputChangeHandler}
          />
        </div>
        <button
          type='submit'
          className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer mt-4'>
          Update
        </button>
      </form>
    </div>
  );
}

export default Information;
