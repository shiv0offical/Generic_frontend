import FilterOption from "./components/FilterOption";
import CommanTable from "../../../components/table/CommonTable";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ApiService } from "../../../services";
import { APIURL } from "../../../constants";
import dayjs from "dayjs";

const columns = [
  { key: "id", header: "S.#" },
  { key: "name", header: "Vehicle Number" },
  { key: "routeName", header: "Route Name" },
  { key: "dayGeneral", header: "Day General" },
  { key: "nightGeneral", header: "Night General" },
  { key: "firstGeneral", header: "First general" },
  { key: "secondGeneral", header: "Second General" },
  { key: "thirdGeneral", header: "Third General" },
  { key: "updatedBy", header: "Updated By" },
  { key: "updatedOn", header: "Updated On" },
];

function PlantInTime() {
  const companyID = localStorage.getItem("company_id");
  const [filterData, setFilterData] = useState({
    bus: "",
    busRoute: "",
    company_id: companyID,
  });
  const [plantData, setPlantData] = useState([]);
  // console.log("🚀 ~ PlantInTime.jsx:30 ~ PlantInTime ~ plantData:", plantData);

  const busOption = Array.from(
    new Map(
      plantData.map((item) => [
        item.vehicle_id,
        {
          label: item.name,
          value: item.vehicle_id,
        },
      ])
    ).values()
  );

  const busRouteOptions = Array.from(
    new Map(
      plantData.map((item) => [
        item.route_id,
        { label: item.routeName, value: item.route_id },
      ])
    ).values()
  );

  const navigate = useNavigate();

  const formatPantInTime = (info) => {
    return info?.map((item, idx) => {
      console.log("🚀 ~ :58 ~ returninfo?.map ~ item:", item);

      const formattedDate = dayjs(item.updated_at).format("YYYY-MM-DD");

      return {
        id: idx + 1,
        plantId: item.id,
        name: item.vehicle.vehicle_name,
        vehicle_id: item.vehicle_id,
        routeName: item.vehicle_route.name,
        route_id: item.vehicle_route_id,
        dayGeneral: item.day_general_start_time,
        nightGeneral: item.night_general_start_time,
        firstGeneral: item.first_shift_start_time,
        secondGeneral: item.second_shift_start_time,
        thirdGeneral: item.third_shift_start_time,
        updatedBy: "Admin-1",
        updatedOn: formattedDate,
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await ApiService.get(APIURL.PLANTINTIME, {
      company_id: companyID,
    });

    if (res?.success) {
      const formatData = formatPantInTime(res.data);
      setPlantData(formatData);
    }
  };

  const handleEdit = (row) => {
    navigate(`/master/factory-in-time-target/create`, {
      state: row,
      action: "EDIT",
    });
  };

  const handleDelete = async (row) => {
    console.log("🚀 ~ PlantInTime.jsx:102 ~ handleDelete ~ row:", row.plantId);

    const plantID = row.plantId;

    if (
      !window.confirm(
        "Are you sure you want to delete this Plant In Time Data?"
      )
    )
      return;

    try {
      const response = await ApiService.delete(
        `${APIURL.PLANTINTIME}/${plantID}`
      );
      if (response.success) {
        alert("Plant in Time deleted successfully!");

        fetchData();
      } else {
        console.error(response.message);
        alert("Failed to delete Plant in Time.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  const handleClickFilter = async () => {
    // Add your filter logic here
    console.log(filterData);
    const Filters = {
      company_id: filterData.company_id,
      vehicle_id: filterData.bus,
      vehicle_route_id: filterData.busRoute,
    };

    try {
      const res = await ApiService.get(APIURL.PLANTINTIME, Filters);

      if (res?.success) {
        const formatData = formatPantInTime(res.data);
        setPlantData(formatData);
      } else {
        console.error(
          "Failed to fetch Plant In Time data:",
          res.message || "Unknown error"
        );
        alert(res.message || "Failed to fetch Plant In Time data");
      }
    } catch (error) {
      console.error("Error fetching Plant In Time:", error);
    }
  };

  const handleFormReset = () => {
    setFilterData({
      bus: "",
      busRoute: "",
    });
    fetchData();
  };

  const handleExport = () => {
    // Add your export logic here
  };

  return (
    <div className="w-full h-full p-2">
      <h1 className="text-2xl font-bold mb-4 text-[#07163d]">
        Factory In-Time Target
      </h1>

      <FilterOption
        handleClickFilter={handleClickFilter}
        filterData={filterData}
        busOption={busOption}
        busRouteOptions={busRouteOptions}
        handleFormReset={handleFormReset}
        setFilterData={setFilterData}
        handleExport={handleExport}
      />

      <div className="bg-white rounded-sm border-t-3 border-[#07163d] mt-4">
        <CommanTable
          columns={columns}
          data={plantData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default PlantInTime;
