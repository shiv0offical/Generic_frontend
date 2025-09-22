import { IconButton, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { ApiService, AuthService } from '../../services';
import { APIURL } from '../../constants';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/authSlice';
import { setDepartmentData } from '../../redux/departmentSlice';
import { setPlantData } from '../../redux/plantSlice';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

function Otp() {
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login } = useAuth();

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      setError('Session expired. Please login again.');
      navigate('/');
      return;
    }

    try {
      const response = await AuthService.verifyOtp(APIURL.VERIFY_OTP, userId, otp);

      const { token, user } = response.data;
      // dispatch(loginUser(response));
      // login(token);

      // Sign into Firebase using the custom token
      const userCredential = await signInWithCustomToken(auth, token);
      const firebaseIdToken = await userCredential.user.getIdToken();
      // Use firebaseIdToken in your app instead of raw token
      dispatch(loginUser(response));
      login(firebaseIdToken);

      localStorage.setItem('company_id', user.company_id);
      loadInitalData();
      localStorage.removeItem('user_id');
      localStorage.removeItem('pendingUserEmail');
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP Submit Error:', err);
      setError('Invalid OTP. Please try again.');
    }
  };

  const loadInitalData = () => {
    //Depatment Data fetch
    ApiService.get(APIURL.DEPARTMENTS)
      .then((success) => {
        console.log('Department data fetched successfully');
        dispatch(setDepartmentData(success.data));
      })
      .catch((error) => {
        console.log('Something went wrong', error);
      });
    //Plant Data fetch
    ApiService.get(APIURL.PLANTS)
      .then((success) => {
        console.log('Plant data fetched successfully');
        dispatch(setPlantData(success.data));
      })
      .catch((error) => {
        console.log('Something went wrong', error);
      });
  };
  return (
    <div className='bg-[#ecf0f5] w-full h-screen flex justify-center items-center'>
      <div className='flex flex-col items-center'>
        <img src={logo} alt='samsung logo' className='w-40' />
        <div className='flex flex-col items-center mt-3'>
          <Paper elevation={3} className='p-5 w-[420px]'>
            <div className='flex flex-col items-center'>
              <h1 className='text-sm text-gray-600 mb-4'>Enter OTP</h1>
              <form className='w-full' onSubmit={handleOtpSubmit}>
                <div className='mb-4'>
                  <div className='relative'>
                    <input
                      type={showOtp ? 'text' : 'password'}
                      placeholder='Enter OTP'
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className='mt-1 p-2 pr-10 w-full border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none'
                      required
                    />
                    <span className='absolute inset-y-0 right-2 flex items-center'>
                      <IconButton onClick={() => setShowOtp(!showOtp)} size='small'>
                        {showOtp ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </span>
                  </div>
                </div>
                {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}
                <button type='submit' className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full'>
                  Verify OTP
                </button>
              </form>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Otp;
