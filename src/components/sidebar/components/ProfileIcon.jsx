import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";
import { Link } from "react-router-dom";

function ProfileIcon({ isProfileMenuOpen }) {
  return (
    <div className="group relative">
      <PersonIcon className="cursor-pointer" style={{ fontSize: "2.5rem" }} />
      {isProfileMenuOpen && (
        <div
          className="absolute transition-all duration-300 ease-in-out bg-[#1d31a6] shadow-lg z-50 opacity-100 visible translate-y-0 pointer-events-auto"
          style={{
            minWidth: "160px",
            top: "-1.2rem",
            left: "5.5rem", // keep your side offset
            fontSize: "14px",
            padding: "5px 0",
            margin: "2px 0 0",
          }}
        >
          <div className="flex flex-col p-3 gap-2">
            <Link className="text-[16px] d-block" to="/profile">
              Profile Update
            </Link>
            <Link className="text-[16px] d-block" to="/user/profile">
              Logout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileIcon;
