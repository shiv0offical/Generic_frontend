import { Paper } from "@mui/material";
import logo from "../../assets/logo.png";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Https";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { loginUser } from "../../redux/authSlice";
import { AuthService } from "../../services";
import { APIURL } from "../../constants";
// import { setDepartmentData } from "../../redux/departmentSlice";
// import { setPlantData } from "../../redux/plantSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  // const handleFormSubmit = async (event) => {
  //   event.preventDefault();

  //   try {
  //     const userData = await AuthService.login(APIURL.LOGIN, email, password);
  //     if (userData) {
  //       if (rememberMe) {
  //         localStorage.setItem("rememberedEmail", email);
  //       } else {
  //         localStorage.removeItem("rememberedEmail");
  //       }

  //       // Dispatch to Redux store to update state
  //       dispatch(loginUser(userData));
  //       localStorage.setItem("company_id", userData.data.user.company_id);
  //       loadInitalData();
  //       // Navigate to dashboard or next page
  //       navigate("/dashboard");
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //   }
  // };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const userData = await AuthService.login(APIURL.LOGIN, email, password);

      if (userData) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        localStorage.setItem("pendingUserEmail", email);
        localStorage.setItem("user_id", userData.data?.id);
        //Redirecting to OTP page
        navigate("/otp");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // const loadInitalData = () => {
  //   //Depatment Data fetch

  //   ApiService.get(APIURL.DEPARTMENTS)
  //     .then((success) => {
  //       console.log("Department data fetched successfully");
  //       dispatch(setDepartmentData(success.data));
  //     })
  //     .catch((error) => {
  //       console.log("Something went wrong", error);
  //     });
  //   //Plant Data fetch
  //   ApiService.get(APIURL.PLANTS)
  //     .then((success) => {
  //       console.log("Plant data fetched successfully");
  //       dispatch(setPlantData(success.data));
  //     })
  //     .catch((error) => {
  //       console.log("Something went wrong", error);
  //     });
  // };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className="bg-[#ecf0f5] w-full h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <img src={logo} alt="samsung logo" className="w-40" />
          <div className="flex flex-col items-center mt-3">
            <Paper elevation={3} className="p-5 w-[420px]">
              <div className="flex flex-col items-center">
                <h1 className="text-sm text-gray-600 mb-4">
                  Sign in to start your session
                </h1>
                <form className="w-full" onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:border-blue-500">
                      <input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 p-2 w-full border-0 focus-visible:outline-none"
                        required
                      />
                      <span className="px-2 text-xl">
                        <EmailIcon />
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:border-blue-500">
                      <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 p-2 w-full border-0 focus-visible:outline-none"
                        required
                      />
                      <span className="px-2 text-xl">
                        <LockIcon />
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <input
                        type="checkbox"
                        id="remember-me"
                        className="mt-1"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 text-sm text-gray-600"
                      >
                        Remember me
                      </label>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="text-sm text-blue-500 hover:text-gray-800"
                    >
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
