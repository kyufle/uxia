import { useEffect, useState } from "react";
import { marcasDeCoches } from "../App";

const filterMarcas = (query) => marcasDeCoches.filter((coche) => coche.toLowerCase().includes(query.toLowerCase()));

const SelectExpo = () => {
    const [inputValue, setInputValue] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if(!open){
            if (!marcasDeCoches.includes(inputValue)){
                setInputValue("");
            }
        }
    }, [open])

    const cochesFiltradosPorInput = filterMarcas(inputValue);
    const listadoCoches = (!inputValue || inputValue.length < 3) ? marcasDeCoches : cochesFiltradosPorInput;
    
    return <div
        className="relative w-full "
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                setOpen(false);
            }
        }}>
        <input
            className="w-full border-1 border-solid p-2 border-gray-200 rounded-sm"
            type="text"
            placeholder="Busca o selecciona una opción..."
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue ?? ""}
        />
        <div
            className={`border-1 border-solid border-gray-200 rounded-sm  absolute left-0 right-0 z-50 shadow-xl bg-white max-h-40 overflow-y-auto top-full my-1 ${!open ? "hidden" : "" }`}
            tabIndex="-1"
        >
            {listadoCoches.map((coche, index) => {
                const isSelected = inputValue === coche;
                return <p key={coche} 
                onClick={() => {
                    setInputValue(coche);
                    setOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 text-left transition-colors ${
                    isSelected 
                    ? "bg-blue-50 text-black" 
                    : "hover:bg-gray-50 text-black"
                }`}
            >{coche}
            </p>;
            })}
            {!listadoCoches.length && <p>No hay opciones</p>}
        </div>
    </div>
}

export default SelectExpo;