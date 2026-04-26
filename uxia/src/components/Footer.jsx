import gene from '../../src/assets/footer logos/gene.png'
import geneBlack from '../../src/assets/footer logos/gene-black.png'
import gobiernoEspana from '../../src/assets/footer logos/gobiernoEspana.png'

export default function Footer({isDarkMode}) {
    return (
        <footer className={`w-full shadow-inner fixed bottom-0 left-0  ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"} z-50`}>
            <div className='max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 p-4 sm:p-8 xl:px-20'>
                <a href="https://sites.google.com/xtec.cat/proyectos-de-innovacion/inicio" className="flex-1 flex justify-start">
                    <img className='w-full max-w-[200px] md:max-w-[300px] xl:w-80' src={isDarkMode ? geneBlack : gene} alt="Logo Generalitat de Catalunya" />
                </a>
                <a href="https://www.boe.es/boe/dias/2023/09/01/pdfs/BOE-B-2023-24805.pdf" className="flex-1 flex justify-end">
                    <img className='w-full max-w-[200px] md:max-w-[300px] xl:w-80' src={gobiernoEspana} alt="Logo Govern d'Espanya" />
                </a>
            </div>
        </footer>
    );
}