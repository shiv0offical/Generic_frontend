import { useEffect, useState } from "react";
import { ApiService } from "../services";

export const useDropdownOpt = ({
  apiUrl,
  query,
  labelSelector = (item) => item.name,
  valueSelector = (item) => item.id,
  autoFetch = true,
  dataKey,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchOption = async () => {
    if (!apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.get(apiUrl, query);
      
      //handle both array and object response
      let rawData = res?.data;

      if (Array.isArray(rawData)) {
        // already an array
      } else if (dataKey && rawData?.[dataKey]) {
        rawData = rawData[dataKey];
      } else if (rawData?.data) {
        // fallback if wrapped in { data: [...] }
        rawData = rawData.data;
      } else {
        rawData = [];
      }

      
      const opt = rawData.map((item) => ({
        label: labelSelector(item),
        value: valueSelector(item),
      }));

      // remove duplicates
      const uniqOpt = Array.from(
        new Map(opt.map((opt) => [opt.value, opt])).values()
      );
      setOptions(uniqOpt);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) fetchOption();
  }, [apiUrl, JSON.stringify(query)]);

  useEffect(() => {
  }, [options]);

  return { options, loading, error, refetch: fetchOption };
};
