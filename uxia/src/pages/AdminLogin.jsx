import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin") === "true") {
      navigate("/admin-dashboard");
    }
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8000/api/admin-login/", {
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
      alert(data.error || "Credenciales incorrectas");
      return;
    }

    // login correcto
    localStorage.setItem("admin", "true");
    localStorage.setItem("username", data.user);

    navigate("/admin-dashboard");

  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
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

        <button
          className="w-full bg-black text-white p-2 rounded"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}