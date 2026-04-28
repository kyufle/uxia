import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin, logout } from "../utils/auth";
import config from "../config";
import EditExpoModal from "../components/EditExpoModal";

const STATE_LABELS = {
  INIT: "Inicial",
  DISPONIBLE: "Disponible",
  ACTUALIZABLE: "Actualitzable",
};

const STATE_STYLES = {
  INIT: "bg-blue-50 text-blue-800",
  DISPONIBLE: "bg-green-50 text-green-800",
  ACTUALIZABLE: "bg-amber-50 text-amber-800",
};

export default function AdminExpoList() {
  const navigate = useNavigate();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpo, setEditingExpo] = useState(null);

  useEffect(() => {
    if (!isAdmin()) { logout(); navigate("/admin-login"); }
  }, [navigate]);

  const fetchExpos = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${config.API_URL}/api/my-expos/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(setExpos)
      .catch((e) => setError("Error carregant les expos: " + e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpos();
  }, []);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer flex items-center gap-1 transition"
        >
          ← Tornar
        </button>
        <h1 className="text-xl font-bold text-gray-900">Les meves expos</h1>
      </div>

      {loading && <p className="text-gray-400 text-center py-10">Carregant...</p>}
      {error && <p className="text-red-500 text-center py-10">{error}</p>}

      <div className="flex flex-col gap-4">
        {expos.map((expo) => (
          <div
            key={expo.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/my-expos/${expo.id}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{expo.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATE_STYLES[expo.state]}`}>
                    {STATE_LABELS[expo.state]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{expo.creationDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingExpo(expo)}
                  className="text-gray-400 hover:text-blue-600 transition p-1 cursor-pointer rounded"
                >
                  <svg className="w-8 h-8" fill="none"  stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.415.586H9v-2.414a2 2 0 01.586-1.414z"/>
                  </svg>
                </button>
                <span
                    onClick={() => navigate(`/my-expos/${expo.id}`)}
                    className="text-gray-400 text-2xl cursor-pointer"
                    >→</span>
              </div>
            </div>

            {expo.items_preview?.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {expo.items_preview.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-1 w-16">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                      {item.featured_image
                        ? <img src={`${config.API_URL}${item.featured_image}`} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-gray-300 text-xs">-</span>
                      }
                    </div>
                    <span className="text-xs text-gray-400 truncate w-full text-center">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingExpo && (
        <EditExpoModal
          isOpen={!!editingExpo}
          onClose={() => setEditingExpo(null)}
          expo={editingExpo}
          isDarkMode={false}
          onSuccess={() => {
            setEditingExpo(null);
            fetchExpos();
          }}
        />
      )}
    </div>
  );
}