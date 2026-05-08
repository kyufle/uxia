import uxiaLogo from '../assets/uxiaLogo.png'
import uxiaLogoBlack from '../assets/uxiaLogo-black.png'
import ThemeButton from './ThemeButton'
import Selecti18n from './Selecti18n'
import { useTheme } from '../context/themeContext'

export default function Header() {
    const { isDarkMode, setIsDarkMode } = useTheme();

    return (
        <header className='w-full shadow-md'>
            <div className={`max-w-full mx-auto flex items-center gap-4 p-4 sm:p-8 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <img src={isDarkMode ? uxiaLogoBlack : uxiaLogo} className='w-20' alt="Logo d'uxia"/>
                <p className="font-semibold">UXIA</p>
                <div className="ml-auto flex items-center gap-4">
                    <Selecti18n 
                        isDarkMode={isDarkMode} 
                    />
                    <ThemeButton 
                        isDarkMode={isDarkMode} 
                        setIsDarkMode={setIsDarkMode}
                    />
                </div>
                
            </div>
        </header>
    );
}