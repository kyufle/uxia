import { useEffect, useState } from "react";
// libreria d iconos d tailwind.
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"; 

// const filterMarcas = (query) => expo.filter((coche) => coche.toLowerCase().includes(query.toLowerCase()));

const SelectExpo = ({ seleccionado, setSeleccionado }) => {
    const [open, setOpen] = useState(false);
    const [expo, setExpo] = useState([]);
    const [expoSelected, setExpoSelected] = useState([]);
    useEffect(()=>{
        async function chargeExpos(){
            try{
                const response = await fetch("https://uxiaweb2.ieti.site/api/coches/");
                if(!response.ok){
                     throw new Error(`Response status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);
                const arrayExpo = [];
                data.map((coche, index)=>{
                    if(!arrayExpo.includes(coche.expo)) arrayExpo.push(coche.expo);
                })
                setExpo(arrayExpo);
            } catch(error){
                console.error(error.message);
            } 
        }
        chargeExpos();
    },[])

    useEffect(() => {
        async function lookforExpo() {
            if (seleccionado.length >= 3) {
                try {
                    const response = await fetch(`https://uxiaweb2.ieti.site/api/expo/?expo=${seleccionado}`);
                    const data = await response.json();
                    const uniqueNames = [...new Set(data.map(item => item.expo))];
                    setExpoSelected(uniqueNames);
                } catch (error) { console.error("Error filtrando:", error.message); }
            } else {
                setExpoSelected([]);
            }
        }
        lookforExpo();
    }, [seleccionado]);
    
    const listadoAMostrar = seleccionado.length >= 3 ? expoSelected : expo;

    useEffect(() => {
        if(!open){
            if (!expo.includes(seleccionado)){
                setSeleccionado("");
                setExpoSelected([]);
            }
        }
    }, [open, expo, seleccionado, setSeleccionado])
    
    return (
        <div
            className="relative w-full"
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
                className="w-full border-1 border-solid p-2 pl-10 border-gray-200 rounded-sm"
                type="text"
                placeholder="Cerca o selecciona una opció..."
                onChange={(e) => setSeleccionado(e.target.value)}
                value={seleccionado ?? ""}
            />
            
            <div className={`border-1 border-solid border-gray-200 rounded-sm absolute left-0 right-0 z-50 shadow-xl bg-white max-h-40 overflow-y-auto top-full my-1 ${!open ? "hidden" : "" }`} tabIndex="-1">
                {listadoAMostrar.map((nombre) => (
                    <p key={nombre} 
                        onClick={() => {
                            setSeleccionado(nombre);
                            setOpen(false);
                        }}
                        className={`cursor-pointer px-4 py-2 text-left transition-colors hover:bg-gray-50 text-black ${
                            seleccionado === nombre ? "bg-blue-50" : ""
                        }`}
                    >
                        {nombre}
                    </p>
                ))}
                {listadoAMostrar.length === 0 && (
                    <p className="px-4 py-2 text-gray-400">No s'han trobat resultats</p>
                )}
            </div>
        </div>
    );
}

export default SelectExpo;