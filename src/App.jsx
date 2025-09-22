import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Lazy loading components
const Layout = lazy(() => import('./components/layout/Layout'));
const Login = lazy(() => import('./modules/login/Login'));
const Otp = lazy(() => import('./modules/otp/Otp'));
const DynamicRoute = lazy(() => import('./routes/DynamicRoute'));

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/otp' element={<Otp />} />
          <Route path='/' element={<Layout />}>
            <Route path='*' element={<DynamicRoute />} />
          </Route>
          <Route path='*' element={<div>404</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
