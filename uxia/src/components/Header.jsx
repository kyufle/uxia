import uxiaLogo from '../assets/uxiaLogo.png'
export default function Header() {
    return (
        <div className='shadow-md flex items-center gap-4 p-4 sm:p-8 flex-row justify-left container mx-auto xl:max-w-none xl:w-full'>
            <img src={uxiaLogo} className='w-20' alt="Logo d'uxia"/><p>uxia</p>
        </div>
    );
}