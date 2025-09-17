// const BASE_URL = "http://110.227.198.38:4000/api/v1/";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default {
  // logout: async function (nav) {
  //   //track activity
  //   ActivityTracker.activityTracker("logout");

  //   const _token = await Database.findOption("token");
  //   const token = _token.value;
  //   let isConnection = await Internet.isOffline();
  //   let response = {};
  //   if (isConnection) {
  //     response = await fetch(Api.AUTH.LOGOUT, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: "",
  //     });

  //     response = await response.json();
  //   } else {
  //     response.message = "Logout Successful";
  //   }

  //   await Database.logout();
  //   const resetAction = StackActions.reset({
  //     index: 0,
  //     actions: [NavigationActions.navigate({ routeName: "Login" })],
  //   });
  //   nav.dispatch(resetAction);

  //   Toast.show({
  //     text: response.message,
  //     duration: 2000,
  //     type: "success",
  //   });
  //   await Database.deleteAllData();
  //   //Send the gps points to the server and clear the dataabase
  //   await Database.deleteTrackGPS();
  // },

  /***Commented by dev HP ***/

  // login: async function (url, email, password) {
  //   const finalUrl = `${BASE_URL}${url}`;

  //   // console.log("BASE_URL", BASE_URL, finalUrl);

  //   const requestBody = JSON.stringify({ email, password });

  //   console.log("Final URL:", finalUrl);
  //   // console.log("Request Body:", requestBody);

  //   try {
  //     let response = await fetch(finalUrl, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       body: requestBody,
  //     });

  //     // ✅ Check for HTTP errors
  //     if (!response.ok) {
  //       console.error("HTTP Error:", response.status, response.statusText);
  //       throw new Error(`HTTP Error: ${response.status}`);
  //     }

  //     let responseData = await response.json();

  //     // ✅ Validate API response format
  //     if (!responseData || !responseData.data || !responseData.data.token) {
  //       throw new Error("Invalid API response format");
  //     }

  //     // console.log("API Response:", responseData?.data?.token);

  //     // const { token, user } = responseData?.data;

  //     localStorage.setItem("authToken", responseData?.data?.token);
  //     // localStorage.setItem("authUser", JSON.stringify(user));

  //     return responseData;
  //   } catch (error) {
  //     console.error("Login request failed:", error);
  //     throw error;
  //   }
  // },

  login: async function (url, email, password) {
    const finalUrl = `${BASE_URL}${url}`;
    const requestBody = JSON.stringify({ email, password });

    try {
      let response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      let responseData = await response.json();
      console.log("responseData",responseData)

      if (!responseData || !responseData.data) {
        throw new Error("Invalid API response format");
      }

      return responseData;
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  },

  // reset: async function (params) {
  //   // //track activity
  //   // ActivityTracker.activityTracker('forgotPassword');

  //   var formBody = Object.keys(params)
  //     .map(
  //       (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
  //     )
  //     .join("&");

  //   let response = await fetch(Api.AUTH.FORGOT, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: formBody,
  //   });

  //   response = await response.json();

  //   if (response.error) {
  //     return Promise.reject(response.data || "Reset failed.");
  //   }

  //   return Promise.resolve(response.message);
  // },
  verifyOtp: async function (url, userId, otp) {
    const finalUrl = `${BASE_URL}${url}`;
    const requestBody = JSON.stringify({ userId, otp });

    try {
      let response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const responseData = await response.json();

      if (
        !responseData ||
        !responseData.data ||
        !responseData.data.token ||
        !responseData.data.user
      ) {
        throw new Error("Invalid OTP response format");
      }
      localStorage.setItem("authToken", responseData?.data?.token);
      return responseData;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  },
};
