import { useState, useEffect, useRef } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";
export default function IATrainButton({ expoId }) {
  // Estados según la spec: IDLE, QUEUED, RUNNING, OK, ERROR, CANCELLED, REPLACE
  const [status, setStatus] = useState("IDLE");
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const {t} = useTranslation();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const res = await fetch(
          `${config.API_URL}/api/expo/${expoId}/state/`,
          {
            headers: getHeaders(),
            credentials: "include",
          }
        );
        const data = await res.json();

        // Si la expo ya está DISPONIBLE, el estado de la IA es OK
        if (data.state === "DISPONIBLE") setStatus("OK");
        else if (data.state === "RUNNING") {
          setStatus("RUNNING");
          setLoading(true);
          startPolling();
        } else setStatus("IDLE");
      } catch (e) {
        console.error(e);
        setStatus("ERROR");
      }
    };

    if (expoId) fetchInitialState();
  }, [expoId]);

  const startTraining = async () => {
    try {
      setLoading(true);
      setStatus("QUEUED"); // Cambiamos a QUEUED antes de empezar

      const loginRes = await fetch(
        `${config.API_URL}/api/login_maria_training/`,
        { method: "POST", credentials: "include" }
      );
      if (!loginRes.ok) throw new Error("Login IA failed");

      const trainRes = await fetch(
        `${config.API_URL}/api/train-expo/${expoId}/`,
        {
          method: "POST",
          headers: getHeaders(),
          credentials: "include",
        }
      );
      if (!trainRes.ok) throw new Error("Error starting train");

      setStatus("RUNNING");
      startPolling();
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${config.API_URL}/api/expo/${expoId}/state/`,
          {
            headers: getHeaders(),
            credentials: "include",
          }
        );
        const data = await res.json();

        if (data.state === "RUNNING") {
          setStatus("RUNNING");
        } else if (data.state === "DISPONIBLE") {
          setStatus("OK");
          setLoading(false);
          clearInterval(intervalRef.current);
        } else {
          setStatus("ERROR");
          setLoading(false);
          clearInterval(intervalRef.current);
        }
      } catch (e) {
        console.error(e);
        setStatus("ERROR");
        setLoading(false);
        clearInterval(intervalRef.current);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Función para obtener el color dinámico según la spec
  const getStatusStyles = () => {
    switch (status) {
      case "OK": return "bg-green-600 text-white";
      case "RUNNING": return "bg-blue-600 text-white animate-pulse";
      case "QUEUED": return "bg-yellow-500 text-black";
      case "ERROR": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white hover:bg-gray-700";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "OK": return "OK ✓";
      case "RUNNING": return t("dashboard.ia.running");
      case "QUEUED": return t("dashboard.ia.queued");
      case "ERROR": return t("dashboard.ia.error");
      default: return t("dashboard.ia.idle");
    }
  };

  const disabled = loading || status === "RUNNING" || status === "OK" || status === "QUEUED";

  // Cambia la etiqueta de retorno del IATrainButton por esta:
  return (
  <button
    onClick={startTraining}
    disabled={disabled}
    className={`w-full sm:w-auto min-w-[110px] cursor-pointer md:min-w-[140px] flex flex-col items-center justify-center px-5 py-1.5 rounded-xl font-bold transition-all duration-200 shadow-md active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed ${getStatusStyles()}`}
  >
    <span className="text-[10px] md:text-[11px] uppercase tracking-tight opacity-80 leading-none mb-0.5">
      {t("dashboard.ia.currentTrain")}
    </span>
    
    <div className="flex items-center gap-2">
      {status === "RUNNING" && (
        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
        {getStatusText()}
      </span>
    </div>
  </button>
);
}