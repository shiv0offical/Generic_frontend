import { useEffect, useState } from "react";
import refrigeratorIcon from "../../../assets/refrigerator.png";
import washigMachineIcon from "../../../assets/washing_machine.png";
import airConditionerIcon from "../../../assets/air_conditioner.png";
import VisualDisplayIcon from "../../../assets/visual_display.png";
import computerIcon from "../../../assets/computer.png";
import supportIcon from "../../../assets/support.png";
import { APIURL } from "../../../constants";
import { ApiService } from "../../../services";

const icons = {
  refrigerator: refrigeratorIcon,
  washingmachine: washigMachineIcon,
  airconditioners: airConditionerIcon,
  visualdisplay: VisualDisplayIcon,
  computer: computerIcon,
  support: supportIcon,
};

const normalizeKey = (str) => str.toLowerCase().replace(/\s/g, "").trim();

function DepartmentStats() {
  const [departments, setDepartments] = useState([]);

  const fetchDepartmentData = async () => {
     let params = {};

    // only add company_id if path is dashboard
    if (window.location.pathname.startsWith("/dashboard")) {
      const company_id = localStorage.getItem("company_id");
      if (company_id) {
        params.company_id = company_id;
      }
    }
    
    const departmentRes = await ApiService.get(APIURL.DEPARTMENTANALYTICS, params);
    if (departmentRes?.success) {
      setDepartments(departmentRes.data);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  return (
    <div className="shadow-sm rounded-sm bg-white w-full p-3">
      <p className="block pb-3 text-sm">Departments Analytics</p>
      <hr className="border border-gray-100" />
      <div className="my-4">
        {[0, 1].map((row) => (
          <div
            key={row}
            className={`flex justify-between items-center ${
              row === 1 ? "mt-3" : ""
            }`}
          >
            {departments.slice(row * 3, row * 3 + 3).map((dept, idx) => {
              return (
                <div key={idx} className="w-1/3 flex flex-col items-center">
                  <img
                    src={icons[normalizeKey(dept.department_name)]}
                    alt={dept.department_name}
                    className="w-10"
                  />
                  <span className="block">{dept.count}</span>
                  <p className="block text-sm">{dept.department_name.trim()}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepartmentStats;
