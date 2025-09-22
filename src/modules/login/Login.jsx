import { Paper } from '@mui/material';
import logo from '../../assets/logo.png';
import { APIURL } from '../../constants';
import { useEffect, useState } from 'react';
import { AuthService } from '../../services';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Https';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await AuthService.login(APIURL.LOGIN, email, password);
      if (userData) {
        rememberMe ? localStorage.setItem('rememberedEmail', email) : localStorage.removeItem('rememberedEmail');
        localStorage.setItem('pendingUserEmail', email);
        localStorage.setItem('user_id', userData.data?.id);
        navigate('/otp');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className='bg-[#ecf0f5] w-full h-screen flex justify-center items-center'>
        <div className='flex flex-col items-center'>
          <img src={logo} alt='samsung logo' className='w-40' />
          <div className='flex flex-col items-center mt-3'>
            <Paper elevation={3} className='p-5 w-[420px]'>
              <div className='flex flex-col items-center'>
                <h1 className='text-sm text-gray-600 mb-4'>Sign in to start your session</h1>
                <form className='w-full' onSubmit={handleFormSubmit}>
                  <div className='mb-4'>
                    <div className='flex items-center border border-gray-300 rounded-md focus-within:border-blue-500'>
                      <input
                        placeholder='Email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='mt-1 p-2 w-full border-0 focus-visible:outline-none'
                        required
                      />
                      <span className='px-2 text-xl'>
                        <EmailIcon />
                      </span>
                    </div>
                  </div>
                  <div className='mb-4'>
                    <div className='flex items-center border border-gray-300 rounded-md focus-within:border-blue-500'>
                      <input
                        placeholder='Password'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='mt-1 p-2 w-full border-0 focus-visible:outline-none'
                        required
                      />
                      <span className='px-2 text-xl'>
                        <LockIcon />
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div>
                      <input
                        type='checkbox'
                        id='remember-me'
                        className='mt-1'
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label htmlFor='remember-me' className='ml-2 text-sm text-gray-600'>
                        Remember me
                      </label>
                    </div>
                    <div>
                      <button type='submit' className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md'>
                        Login
                      </button>
                    </div>
                  </div>
                  <div className='mt-4'>
                    <a href='#' className='text-sm text-blue-500 hover:text-gray-800'>
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
