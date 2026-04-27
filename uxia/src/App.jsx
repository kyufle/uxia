import { useState } from 'react'
import Footer from './components/Footer'
import './App.css'
import Carrousel from './components/Carrousel'
import SelectExpo from './components/SelectExpo';
import Header from './components/Header';
import { CameraMaria } from './components/CameraMaria';
import {ThemeContext} from './context/themeContext'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
function App() {
  const [seleccionado, setSeleccionado] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
  <BrowserRouter>
    <div className='flex flex-col min-h-screen w-full'>

      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <Header />
      </ThemeContext.Provider>

      <Routes>

        {/* 🟢 HOME (tu app actual) */}
        <Route path="/" element={
          <main
              className={
                "flex-1 flex flex-col items-center w-full p-5 overflow-y-auto min-h-0 " +
                (isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50")
              }
            >
            <div className="flex flex-col items-center w-full mt-10">

              {!showCamera && (
                <>
                  <div className='w-full max-w-xs md:max-w-md xl:max-w-xl'>
                    <SelectExpo isDarkMode={isDarkMode} seleccionado={seleccionado} setSeleccionado={setSeleccionado} />
                  </div>

                  <div className="my-8 p-3 w-full max-w-xs md:max-w-md xl:max-w-xl">
                    {!seleccionado
                      ? <p className='text-center'> No has seleccionat cap exposició</p>
                      : <Carrousel seleccionado={seleccionado} isDarkMode={isDarkMode} />
                    }
                  </div>
                </>
              )}

              <div className={`w-full max-w-xs md:max-w-md xl:max-w-xl mx-auto p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.12)] border ${ isDarkMode ? "bg-gray-950 border-gray-900" : "bg-gray-50 border-gray-100"}`}>

                <h2 className={`text-xl md:text-2xl font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"} leading-tight tracking-tight`}>
                  Quin cotxe tens davant?
                </h2>

                <p className={`mt-2 mb-6 text-sm md:text-base ${isDarkMode ? "text-gray-500" : "text-gray-500"} font-light`}>
                  La nostra intel·ligència artificial l'identificarà a l'instant amb només una foto.
                </p>

                <div className="w-full">
                  <CameraMaria showCamera={showCamera} isDarkMode={isDarkMode} setShowCamera={setShowCamera} />
                </div>

              </div>

            </div>
          </main>
        } />

        {/* 🔵 ADMIN DASHBOARD */}
        <Route path="/admin-dashboard" element={
          <main className="flex-1 flex flex-col">
            <AdminDashboard />
          </main>
        } />

        {/* 🔴 ADMIN LOGIN */}
        <Route path="/admin-login" element={
          <main className="flex-1 flex flex-col">
            <AdminLogin />
          </main>
        } />

      </Routes>

      <Footer isDarkMode={isDarkMode} />
    </div>
  </BrowserRouter>
);
}

export default App;