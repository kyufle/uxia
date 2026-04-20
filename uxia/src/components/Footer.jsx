import gene from '../../src/assets/footer logos/gene.png'
import gobiernoEspana from '../../src/assets/footer logos/gobiernoEspana.png'

export default function Footer() {
    return (
        <footer className='shadow-inner flex items-center gap-4 p-4 sm:p-8 sm:w-full flex-row justify-between container mx-auto xl:max-w-none xl:w-full xl:px-20'>
            <a href="https://web.gencat.cat/ca/ciutadania/inici">
                <img className='w-1/1 xl:w-80' src={gene} alt="Logo Generalitat de Catalunya" />
            </a>
            <a href="https://www.educacionfpydeportes.gob.es/mc/sgctie/cooperacion-territorial/fondo-social-europeo.html">
                <img className='w-1/1 xl:w-80' src={gobiernoEspana} alt="Logo Govern d'Espanya" />
            </a>
        </footer>
    );
}