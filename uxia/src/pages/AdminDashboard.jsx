import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { isAdmin, logout, getUsername } from "../utils/auth";
import { ThemeContext } from "../context/themeContext";

export default function AdminDashboard() {
  const username = getUsername();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (!isAdmin()) {
      logout();
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  return (
    <div className={`flex-1 w-full flex flex-col items-center p-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* HEADER */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Benvingut,</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{username || "Admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition-all duration-200 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
          </svg>
        </button>
      </div>

      {/* OPCIONES */}
      <div className={`w-full max-w-md rounded-xl shadow divide-y ${isDarkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"}`}>
        <button
          onClick={() => navigate("/my-expos")}
          className={`w-full flex justify-between items-center p-4 cursor-pointer transition ${isDarkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-50 text-gray-900"}`}
        >
          <span className="font-medium">Les meves exposicions</span>
          <span className={isDarkMode ? "text-gray-400" : "text-gray-400"}>→</span>
        </button>
      </div>
    </div>
  );
}