import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { ThemeContext } from "../context/themeContext";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${config.API_URL}/api/admin-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }
      const groups = data.groups || [];
      localStorage.setItem("username", data.user);
      localStorage.setItem("groups", JSON.stringify(groups));
      localStorage.setItem("token", data.access);
      navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    }
  };

  return (
    <div className={`flex items-center justify-center flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <form
        onSubmit={handleLogin}
        className={`p-6 rounded-xl shadow-md w-80 space-y-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <h1 className={`text-xl font-bold text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Admin Login
        </h1>
        <input
          className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          placeholder="Usuari"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          type="password"
          placeholder="Contrasenya"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
        <button
          className={`w-full p-2 rounded cursor-pointer transition font-bold uppercase tracking-widest active:scale-95 ${
            isDarkMode
              ? "bg-orange-400 text-black hover:bg-orange-300"
              : "bg-[#162354] text-white hover:bg-blue-900"
          }`}
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}