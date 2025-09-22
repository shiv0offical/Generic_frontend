const BASE_URL = import.meta.env.VITE_BASE_URL;

export default {
  login: async function (url, email, password) {
    const finalUrl = `${BASE_URL}${url}`;
    const requestBody = JSON.stringify({ email, password });

    try {
      let response = await fetch(finalUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      let responseData = await response.json();
      console.log('responseData', responseData);

      if (!responseData || !responseData.data) {
        throw new Error('Invalid API response format');
      }

      return responseData;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  },

  verifyOtp: async function (url, userId, otp) {
    const finalUrl = `${BASE_URL}${url}`;
    const requestBody = JSON.stringify({ userId, otp });

    try {
      let response = await fetch(finalUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const responseData = await response.json();

      if (!responseData || !responseData.data || !responseData.data.token || !responseData.data.user) {
        throw new Error('Invalid OTP response format');
      }
      localStorage.setItem('authToken', responseData?.data?.token);
      return responseData;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  },
};
