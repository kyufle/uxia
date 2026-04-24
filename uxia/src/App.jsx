import { useState } from 'react'
import Footer from './components/Footer'
import './App.css'
import Carrousel from './components/Carrousel'
import SelectExpo from './components/SelectExpo';
import Header from './components/Header';
import { CameraMaria } from './components/CameraMaria';

function App() {
  const [seleccionado, setSeleccionado] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className='flex flex-col min-h-screen w-full'>
      <Header />
      <main className='flex-grow flex flex-col items-center w-full bg-gray-50 pb-32'>
      
        {!showCamera && (
          <>
            <div className="w-full max-w-3xl xl:max-w-4xl mx-auto px-8 md:px-4">
              <SelectExpo seleccionado={seleccionado} setSeleccionado={setSeleccionado} />
            </div>

            <div className="my-8 w-full max-w-3xl xl:max-w-4xl mx-auto px-8 md:px-4">
              {!seleccionado ? <p className='sm:text-center'> No has seleccionat cap exposició</p> : <Carrousel seleccionado={seleccionado} />}

            
            </div>
          </>
        )}

        <div className="w-full max-w-xs md:max-w-md xl:max-w-xl mx-6 md:mx-auto p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.12)] bg-gray-50 border border-gray-100">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-tight tracking-tight">
            Quin cotxe tens davant?
          </h2>

          <p className="mt-2 mb-6 text-sm md:text-base text-gray-500 font-light">
            La nostra intel·ligència artificial l'identificarà a l'instant amb només una foto.
          </p>
          
          <div className="w-full">
            <CameraMaria showCamera={showCamera} setShowCamera={setShowCamera} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App;
