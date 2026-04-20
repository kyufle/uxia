import { useEffect, useState } from "react";
import { marcasDeCoches } from '../constants.js'

const filterMarcas = (query) => marcasDeCoches.filter((coche) => coche.toLowerCase().includes(query.toLowerCase()));

const SelectExpo = ({ seleccionado, setSeleccionado }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if(!open){
            if (!marcasDeCoches.includes(seleccionado)){
                setSeleccionado("");
            }
        }
    }, [open, seleccionado, setSeleccionado])

    const cochesFiltradosPorInput = filterMarcas(seleccionado);
    const listadoCoches = (!seleccionado || seleccionado.length < 3) ? marcasDeCoches : cochesFiltradosPorInput;
    
    return (
        <div
            className="relative w-full"
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false);
                }
            }}>
            <input
                className="w-full border-1 border-solid p-2 border-gray-200 rounded-sm"
                type="text"
                placeholder="Cerca o selecciona una opció..."
                onChange={(e) => setSeleccionado(e.target.value)}
                value={seleccionado ?? ""}
            />
            
            <div className={`border-1 border-solid border-gray-200 rounded-sm absolute left-0 right-0 z-50 shadow-xl bg-white max-h-40 overflow-y-auto top-full my-1 ${!open ? "hidden" : "" }`} tabIndex="-1">
                {listadoCoches.map((coche) => {
                    const isSelected = seleccionado === coche;
                    return (
                        <p key={coche} 
                            onClick={() => {
                                setSeleccionado(coche);
                                setOpen(false);
                            }}
                            className={`cursor-pointer px-4 py-2 text-left transition-colors ${
                                isSelected ? "bg-blue-50 text-black" : "hover:bg-gray-50 text-black"
                            }`}
                        >
                            {coche}
                        </p>
                    );
                })}
                {!listadoCoches.length && <p className="px-4 py-2 text-gray-400">No hi ha opcions</p>}
            </div>
        </div>
    );
}

export default SelectExpo;