import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SelectExpo = ({ seleccionado, setSeleccionado, isDarkMode }) => {
    const [open, setOpen] = useState(false);
    const [expo, setExpo] = useState([]);
    const [expoSelected, setExpoSelected] = useState([]);

    useEffect(() => {
        async function chargeExpos() {
            try {
                const response = await fetch("https://uxiaweb2.ieti.site/api/coches/");
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const data = await response.json();
                const arrayExpo = [];
                data.forEach((coche) => {
                    if (!arrayExpo.includes(coche.expo)) arrayExpo.push(coche.expo);
                });
                setExpo(arrayExpo);
            } catch (error) {
                console.error(error.message);
            }
        }
        chargeExpos();
    }, []);

    useEffect(() => {
        async function lookforExpo() {
            if (seleccionado && seleccionado.length >= 3) {
                try {
                    const response = await fetch(`https://uxiaweb2.ieti.site/api/expo/?expo=${seleccionado}`);
                    const data = await response.json();
                    const uniqueNames = [...new Set(data.map(item => item.expo))];
                    setExpoSelected(uniqueNames);
                } catch (error) {
                    console.error("Error filtrando:", error.message);
                }
            } else {
                setExpoSelected([]);
            }
        }
        lookforExpo();
    }, [seleccionado]);

    useEffect(() => {
        if (!open) {
            if (!expo.includes(seleccionado)) {
                setSeleccionado("");
                setExpoSelected([]);
            }
        }
    }, [open, expo, seleccionado, setSeleccionado]);

    return (
        <div
            className="relative w-full mt-2"
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false);
                }
            }}>

            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>

            <input
                className={"w-full border border-solid p-2 pl-10 rounded-sm focus:outline-none focus:border-sky-500 " + (isDarkMode ? "border-gray-50  placeholder-gray-50" : "border-gray-200 placeholder-dark")}
                type="text"
                placeholder="Escriu almenys 3 lletres per buscar..."
                onChange={(e) => setSeleccionado(e.target.value)}
                value={seleccionado ?? ""}
            />

            {/* He cambiado border-1 por border-x border-b para quitar la línea superior */}
            <div className={`border-x border-b border-solid rounded-b-sm absolute left-0 right-0 z-50 shadow-xl ${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} max-h-40 overflow-y-auto top-full ${!open ? "hidden" : ""}`} tabIndex="-1">
                {seleccionado.length >= 3 && expoSelected.length > 0 && expoSelected.map((nombre) => (
                    <p key={nombre}
                        onClick={() => {
                            setSeleccionado(nombre);
                            setOpen(false);
                        }}
                        className={`cursor-pointer px-4 py-2 text-left transition-colors ${isDarkMode ? "hover:bg-gray-750 text-white" : "hover:bg-gray-50 text-black"} ${
                            seleccionado === nombre ? `${isDarkMode ? "bg-sky-500" :"bg-blue-50"}` : ""
                        }`}
                    >
                        {nombre}
                    </p>
                ))}

                {seleccionado.length >= 3 && expoSelected.length === 0 && (
                    <p className={`px-4 py-2 ${isDarkMode ? "text-gray-800 text-white" : "text-gray-400"}`}>No s'han trobat resultats</p>
                )}
            </div>
        </div>
    );
}

export default SelectExpo;
