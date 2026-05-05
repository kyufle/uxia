import { useState, useEffect, useRef } from "react";
import config from "../config";

export default function IATrainButton({ expoId, isDarkMode }) {
  const [status, setStatus] = useState("IDLE");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");
  const intervalRef = useRef(null);

  const getHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const startTraining = async () => {
    try {
      setLoading(true);
      setStatus("RUNNING");
      setLog("Connectant amb la IA...");

      // 1. LOGIN IA
      const loginRes = await fetch(`${config.API_URL}/api/login_maria_training/`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.error || "Login IA failed");
      }
      setLog("Login OK. Pujant imatges i entrenant...");

      // 2. TRAIN EXPO (delete + upload + train)
      const trainRes = await fetch(`${config.API_URL}/api/train-expo/${expoId}/`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
      if (!trainRes.ok) {
        const err = await trainRes.json();
        throw new Error(err.error || "Error iniciant entrenament");
      }

      setLog("Entrenament iniciat. Esperant resultats...");
      startPolling();

    } catch (err) {
      console.error(err);
      setLog(`Error: ${err.message}`);
      setStatus("ERROR");
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${config.API_URL}/api/train/check/?expo_id=${expoId}`,
          { headers: getHeaders(), credentials: "include" }
        );
        const data = await res.json();

        if (data.status === "QUEUED") {
          setLog(`En cua, posició: ${data.queue_position || "?"}`);
        }
        if (data.status === "RUNNING") {
          setStatus("RUNNING");
          if (data.global_percentage) {
            setLog(`Entrenant... ${data.global_percentage} — ETA: ${data.eta || "?"}`);
          }
        }
        if (data.status === "OK") {
          setStatus("OK");
          setLoading(false);
          setLog("Entrenament completat ✓");
          clearInterval(intervalRef.current);
        }
        if (["ERROR", "CANCELLED"].includes(data.status)) {
          setStatus("ERROR");
          setLoading(false);
          setLog(`Error: ${data.status}`);
          clearInterval(intervalRef.current);
        }
      } catch (e) {
        console.error(e);
        setStatus("ERROR");
        setLoading(false);
        setLog("Error de connexió durant el polling");
        clearInterval(intervalRef.current);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={startTraining}
        disabled={loading || status === "RUNNING"}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
          transition-all active:scale-95 shadow-md disabled:opacity-50
          ${status === "OK" ? "bg-green-500 text-white"
            : status === "ERROR" ? "bg-red-500 text-white"
            : "bg-purple-600 text-white hover:bg-purple-700"}
        `}
      >
        {(loading || status === "RUNNING") && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {status === "IDLE" && "Entrena IA"}
        {status === "RUNNING" && "Entrenant..."}
        {status === "OK" && "✓ IA OK"}
        {status === "ERROR" && "✗ Error — Tornar a intentar"}
      </button>

      {log && (
        <p className={`text-xs px-1 ${
          status === "ERROR" ? "text-red-500"
          : status === "OK" ? "text-green-500"
          : isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          {log}
        </p>
      )}
    </div>
  );
}