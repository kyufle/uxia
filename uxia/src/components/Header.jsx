import uxiaLogo from '../assets/uxiaLogo.png'
import ThemeButton from './ThemeButton'
import { useTheme } from '../context/themeContext'

export default function Header() {
    const { isDarkMode, setIsDarkMode } = useTheme();

    return (
        <header className='w-full shadow-md'>
            <div className={`max-w-[1440px] mx-auto flex items-center gap-4 p-4 sm:p-8 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <img src={uxiaLogo} className='w-20' alt="Logo d'uxia"/>
                <p className="font-semibold">UXIA</p>
                <ThemeButton 
                    isDarkMode={isDarkMode} 
                    setIsDarkMode={setIsDarkMode}
                />
            </div>
        </header>
    );
}