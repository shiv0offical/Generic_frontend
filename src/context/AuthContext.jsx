import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode as decode } from 'jwt-decode';
// import useHttp from "../hooks/useHttp";
import { toast } from 'react-toastify';
// import { useDispatch } from "react-redux";
// import { connectSocket, disconnectSocket } from "../socket/socketService";

const TOKEN_KEY_NAME = 'authToken';
const REFRESH_TOKEN_KEY_NAME = 'refresh_token';

const defaultAuthContext = {
  token: null,
  role: null,
  isAuthenticated: false,
  user: null,
  id: null,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // const { request } = useHttp();
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY_NAME));
  // const [refreshToken, setRefreshToken] = useState(
  //   localStorage.getItem(REFRESH_TOKEN_KEY_NAME)
  // );
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(TOKEN_KEY_NAME) !== null);
  const [user, setUser] = useState(null);

  const [role, setRole] = useState(null);

  const [id, setId] = useState(null);
  // const lastTokenRef = useRef(null);
  const timeoutIdRef = useRef(null);
  // const dispatch = useDispatch();

  const login = (token, refreshToken) => {
    setIsAuthenticated(true);
    setToken(token);
    // setRefreshToken(refreshToken);

    try {
      const decodedToken = decode(token);

      // setUser(decodedUser.userId);
      // setId(decodedUser.company_id);
      // setRole(decodedUser.role);

      if (decodedToken?.userId && decodedToken?.company_id) {
        setUser(decodedToken.userId);
        setId(decodedToken.company_id);
      } else {
        console.warn('Token decoded but missing required fields');
      }
    } catch (error) {
      toast.error(error?.toString());
      console.error('Failed to decode token', error);
      setUser(null);
    }

    // console.log("loacl storage token", token);

    localStorage.setItem(TOKEN_KEY_NAME, token);
    localStorage.setItem(REFRESH_TOKEN_KEY_NAME, refreshToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    // setRefreshToken(null);
    setUser(null);
    setId(null);
    setRole(null);
    localStorage.removeItem(TOKEN_KEY_NAME);
    localStorage.removeItem(REFRESH_TOKEN_KEY_NAME);
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
  };

  // const refreshTheToken = async () => {
  //   if (!refreshToken) return;

  //   try {
  //     const response = await request({
  //       url: "/auth/refresh-token",
  //       method: "POST",
  //       body: { refreshToken },
  //     });

  //     const data = await response.json();

  //     const { token: newToken } = data;
  //     setToken(newToken);
  //     localStorage.setItem(TOKEN_KEY_NAME, newToken);

  //     try {
  //       const decodedUser = decode < User > newToken;
  //       setUser(decodedUser);
  //       setId(decodedUser.id);
  //       setRole(decodedUser.role);
  //     } catch (error) {
  //       console.error("Failed to decode token", error);
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     console.error("Failed to refresh token", error);
  //     logout();
  //   }
  // };

  // useEffect(() => {
  //   if (token && token !== lastTokenRef.current) {
  //     lastTokenRef.current = token;

  // const refreshTheTokenSync = () => {
  //   refreshTheToken().catch((error) => {
  //     console.error("Failed to refresh token:", error);
  //     logout();
  //   });
  // };

  // const decoded = token;
  // const expirationTime = (decoded.exp ? decoded.exp * 1000 : 0) - 60000;

  // if (Date.now() >= expirationTime) {
  //   refreshTheTokenSync();
  // }

  // if (timeoutIdRef.current !== null) {
  //   clearTimeout(timeoutIdRef.current);
  // }

  // timeoutIdRef.current = window.setTimeout(
  //   refreshTheTokenSync,
  //   expirationTime - Date.now()
  // );

  //     return () => {
  //       if (timeoutIdRef.current !== null) {
  //         clearTimeout(timeoutIdRef.current);
  //       }
  //     };
  //   }
  // }, [token]);

  // Load user data from token on page refresh

  useEffect(() => {
    // console.log(`token`, token);

    if (token) {
      try {
        const decodedToken = decode(token);

        if (decodedToken?.userId && decodedToken?.company_id) {
          setUser(decodedToken.userId);
          setId(decodedToken.company_id);
        } else {
          console.warn('Token decoded but missing required fields');
        }
        // console.log("🔐 Decoded token:", decodedToken);
        // setUser(decodedUser);
        // setId(decodedUser.userId);
        // setRole(null);
      } catch (error) {
        console.error('Failed to decode token on page load', error);
        logout();
      }
    }
  }, [token]);

  // useEffect(() => {
  //   if (isAuthenticated && token && user && id) {
  //     connectSocket(dispatch);
  //   } else {
  //     disconnectSocket();
  //   }
  // }, [isAuthenticated, token, user, id, dispatch]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        login,
        logout,
        token,
        id,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
