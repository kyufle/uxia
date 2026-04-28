import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config"

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // si ya está logueado → dashboard
  //Este useffect se asegura de que el usuario no tenga que volver a loguearse cada vez que recarga la página, siempre y cuando tenga 
  // un token válido en localStorage. Si el token es válido y el usuario pertenece al grupo "uxiaAdmin", se redirige automáticamente al dashboard.
  //  Si el token no es válido o el usuario no tiene los permisos necesarios, se limpia el localStorage para evitar problemas de seguridad.
  //FALTA AÑADIR UN TOKENen el back
 

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
      console.log("Token guardado en localStorage:", data.access, "para el usuario", data.user);
      navigate("/admin-dashboard");

    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-80 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Admin Login</h1>

        <input
          className="w-full p-2 border rounded"
          placeholder="Usuari"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
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
          className="w-full bg-black text-white p-2 rounded cursor-pointer hover:bg-gray-800 transition"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}