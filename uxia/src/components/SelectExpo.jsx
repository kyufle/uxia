import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import config from '../config';

const SelectExpo = ({ seleccionado, setSeleccionado, isDarkMode }) => {
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState({ expos: [], coches: [] });

    useEffect(() => {
    async function lookforData() {
        if (seleccionado && seleccionado.length >= 3) {
            try {
                const response = await fetch(`${config.API_URL}/api/expo/?search=${seleccionado}`);
                const data = await response.json();
                
                const query = seleccionado.toLowerCase();

                const uniqueExpos = [...new Set(
                    data.map(item => item.expo.replaceAll('-', ' '))
                        .filter(name => name.toLowerCase().includes(query))
                )];
                
                const uniqueCoches = [...new Set(
                    data.map(item => item.name.replaceAll('-', ' '))
                        .filter(name => name.toLowerCase().includes(query))
                )];

                setResults({
                    expos: uniqueExpos,
                    coches: uniqueCoches
                });
            } catch (error) {
                console.error("Error filtrando:", error.message);
            }
        } else {
            setResults({ expos: [], coches: [] });
        }
    }
    lookforData();
}, [seleccionado]);

    const renderItem = (nombre, tipo) => (
        <p key={`${tipo}-${nombre}`}
            onClick={() => {
                setSeleccionado(nombre);
                setOpen(false);
            }}
            className={`cursor-pointer px-4 py-2 text-left transition-colors ${
                isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-50 text-black"
            } ${seleccionado === nombre ? (isDarkMode ? "bg-sky-600" : "bg-blue-50") : ""}`}
        >
            {nombre}
        </p>
    );

    const hasResults = results.expos.length > 0 || results.coches.length > 0;

    return (
        <div className="relative w-full mt-2" onFocus={() => setOpen(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>

            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>

            <input
                className={"w-full border border-solid p-2 pl-10 rounded-sm focus:outline-none " + (isDarkMode ? "bg-gray-900 text-white border-gray-700 focus:border-orange-300" : "bg-white border-gray-200 focus:border-sky-500")}
                type="text"
                placeholder="Busca exposicions o cotxes..."
                onChange={(e) => setSeleccionado(e.target.value)}
                value={seleccionado ?? ""}
            />

            <div className={`border-x border-b border-solid rounded-b-sm absolute left-0 right-0 z-50 shadow-xl ${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-h-60 overflow-y-auto top-full ${!open ? "hidden" : ""}`} tabIndex="-1">
                
                {seleccionado.length >= 3 && (
                    <>
                        {results.expos.length > 0 && (
                            <div>
                                <div className={`px-4 py-1 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                    Exposicions
                                </div>
                                {results.expos.map(n => renderItem(n, 'expo'))}
                            </div>
                        )}

                        {results.coches.length > 0 && (
                            <div>
                                <div className={`px-4 py-1 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                    Cotxes/Items
                                </div>
                                {results.coches.map(n => renderItem(n, 'coche'))}
                            </div>
                        )}

                        {!hasResults && (
                            <p className={`px-4 py-2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>No s'han trobat resultats</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SelectExpo;