// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Layout from "./components/layout/Layout";
// import Login from "./modules/login/Login";
// import DynamicRoute from "./routes/DynamicRoute";
// import { AuthProvider } from "./context/AuthContext";
// import { ToastContainer } from "react-toastify";
// import useTokenChecker from "./hooks/useTokenChecker";

// function App() {
//   useTokenChecker();
//   return (
//     <AuthProvider>
//       <ToastContainer />
//       <Router>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/" element={<Layout />}>
//             <Route path="*" element={<DynamicRoute />} />
//           </Route>
//           <Route path="*" element={<div>404</div>} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";

// Lazy loading components
const Layout = lazy(() => import("./components/layout/Layout"));
const Login = lazy(() => import("./modules/login/Login"));
const Otp = lazy(() => import("./modules/otp/Otp"));
const DynamicRoute = lazy(() => import("./routes/DynamicRoute"));

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/otp" element={<Otp/>}/>
          <Route path="/" element={<Layout />}>
            <Route path="*" element={<DynamicRoute />} />
          </Route>
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
