import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  // Si el usuario no está logueado o no tiene permisos, redirige al login
  useEffect(() => {
    let groups = [];

    try {
      groups = JSON.parse(localStorage.getItem("groups") || "[]");
    } catch (e) {
      groups = [];
    }

    if (!groups.includes("uxiaAdmin")) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("groups");
    navigate("/admin-login");
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center p-4 bg-gray-100 text-gray-900">

      {/* HEADER */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">Benvingut,</h1>
          <p className="text-gray-600">{username || "Admin"}</p>
        </div>

        <button
          onClick={logout}
          className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
        >
          Logout
        </button>

      </div>

      {/* OPCIONES */}
      <div className="w-full max-w-md bg-white rounded-xl shadow divide-y">

        <button
          onClick={() => navigate("/my-expos")}
          className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition"
        >
          <span className="font-medium">My Expos</span>
          <span className="text-gray-400">→</span>
        </button>

      </div>
    </div>
  );
}