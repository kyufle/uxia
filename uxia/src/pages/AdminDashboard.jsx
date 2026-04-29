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
          className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-600 cursor-pointer hover:bg-red-200 transition"
        >
          Logout
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