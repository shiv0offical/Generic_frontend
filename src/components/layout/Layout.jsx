import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { connectSocket, disconnectSocket } from "../../socket/socketService";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function Layout() {
  const token = localStorage.getItem("authToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      connectSocket(dispatch);
    }

    return () => {
      disconnectSocket();
    };
  }, []);
  return (
    <div className="flex h-screen" style={{ background: "#ecf0f5" }}>
      <Sidebar />
      <main className="flex-1">
        <div
          style={{
            overflowY: "auto",
            height: "calc(100vh)",
            boxSizing: "border-box",
            width: "calc(100vw - 95px)",
          }}
          className={`transition-all duration-300 p-2`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
