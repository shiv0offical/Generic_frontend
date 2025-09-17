// const INFLUXDB_URL = "http://110.227.198.38:3000/api/";
const INFLUXDB_URL = import.meta.env.VITE_INFLUXDB_URL;
console.log(INFLUXDB_URL);

const buildUrl = async (baseUrl, params) => {
  // console.log("Before modification:", baseUrl);
  baseUrl = INFLUXDB_URL + baseUrl;
  // console.log("After modification:", baseUrl);
  if (Object.keys(params).length === 0) {
    const url = `${baseUrl}`;
    // console.log(url);
    return url;
  }

  const param = Object.keys(params)
    ?.map((k) => k + "=" + params[k])
    .join("&");
  const url = `${baseUrl}?${param}`;
  return url;
};

export default {
  get: async (url, params = {}) => {
    // const token = localStorage.getItem("authToken");
    url = await buildUrl(url, params);
    // console.log("METHOD: GET", "\nURL:", url);
    // console.log("METHOD: GET", "\nURL:", url, "\nTOKEN:", token);
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  },

  post: async (url, data = {}, params = {}) => {
    url = await buildUrl(url, params);
    console.log("METHOD: POST", "\nURL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  },
};
