import uxiaLogo from '../assets/uxiaLogo.png'

export default function Header() {
    return (
        <header className='w-full shadow-md'>
            <div className='max-w-[1440px] mx-auto flex items-center gap-4 p-4 sm:p-8'>
                <img src={uxiaLogo} className='w-20' alt="Logo d'uxia"/>
                <p className="font-semibold">uxia</p>
            </div>
        </header>
    );
}