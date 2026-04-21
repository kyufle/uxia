import { useState } from 'react'
import Footer from './components/Footer'
import './App.css'
import Carrousel from './components/Carrousel'
import SelectExpo from './components/SelectExpo';
import Header from './components/Header';

function App() {
  const [seleccionado, setSeleccionado] = useState("");
  const mockImagenes = [
    "https://picsum.photos/id/1020/400",
    "https://picsum.photos/id/1060/400",
    "https://picsum.photos/id/1080/400",
  ]

  return (
    <div className='flex flex-col min-h-screen w-full'>
      <Header/>
      
      <main className='flex-grow flex flex-col items-center justify-center w-full'>
        <div className='w-full max-w-xs md:max-w-md xl:w-200 xl:px-20'>
          <SelectExpo seleccionado={seleccionado} setSeleccionado={setSeleccionado} />
        </div>
        <div className="my-8 p-3 w-full max-w-xs md:max-w-md xl:max-w-full xl:px-10">
          {!seleccionado ? <p className='sm:text-center'> No has seleccionat cap exposició</p> : <Carrousel photos={mockImagenes}/>}
        </div>
      </main>

      <Footer/>
    </div>
  )
}

export default App;