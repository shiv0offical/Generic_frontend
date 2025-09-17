import Search from "@mui/icons-material/Search";
import { TextField as Input } from "@mui/material";
import React from "react";

export default function ISearch({onChange, value}) {
  return (
    <>
      <div className="w-ful">
        <div className="flex items-center">
          <Search className="text-lg ml-2 font-bold" />
          <Input
            value={value}
            variant="standard"
            size="small"
            placeholder="Search"
            sx={{
              "& .MuiInput-underline:before": { borderBottom: "none" },
              "& .MuiInput-underline:after": { borderBottom: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
              },
            }}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  );
}
