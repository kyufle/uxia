import { useEffect, useState } from 'react';
import config from "../config";

const AdminExpoItems = ({ expoName, isDarkMode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      if (!expoName) {
        setItems([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const expoSlug = expoName.trim().replace(/\s+/g, '-');
        const response = await fetch(`${config.API_URL}/api/items_expo/${encodeURIComponent(expoSlug)}/`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        setItems(data.map(item => ({
          ...item,
          name: item.name.replaceAll('-', ' '),
          expo: item.expo.replaceAll('-', ' '),
          description: item.description || '',
          featured_image: item.featured_image || '',
          images: Array.isArray(item.images) ? item.images : []
        })));
      } catch (fetchError) {
        console.error('Error cargando items:', fetchError);
        setError('No s’ha pogut carregar la llista d’items. Torna-ho a provar.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [expoName]);

  const renderThumbnail = (url, activeUrl) => (
    <img
      key={url}
      src={url}
      alt="Foto extra"
      className={`h-20 w-20 flex-shrink-0 object-cover rounded-lg border transition-all duration-200 ${url === activeUrl ? 'border-blue-500 shadow-lg scale-105' : 'border-transparent'}`}
    />
  );

  const subject = expoName ? expoName.replaceAll('-', ' ') : '';
  const formattedItems = items.filter(item => item.expo.toLowerCase() === subject.toLowerCase() || item.expo.toLowerCase().includes(subject.toLowerCase()));

  return (
    <section className={`w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className={`mb-8 rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-white border border-slate-200'}`}>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Items de l’exposició
        </h2>
        <p className={`mt-2 text-sm md:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Visualitza la col·lecció en un format de targetes responsive amb imatge principal i fotos addicionals.
        </p>
      </div>

      {loading && (
        <div className={`rounded-3xl p-8 text-center ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
          Carregant items...
        </div>
      )}

      {error && (
        <div className={`rounded-3xl p-8 text-center text-red-500 ${isDarkMode ? 'bg-slate-950 border border-red-600' : 'bg-red-50 border border-red-200'}`}>
          {error}
        </div>
      )}

      {!loading && !error && formattedItems.length === 0 && (
        <div className={`rounded-3xl p-8 text-center ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
          <p className="text-base font-medium">No s’han trobat items per aquesta exposició.</p>
          <p className="mt-2 text-sm text-slate-500">Comprova el nom de l’exposició o torna a seleccionar una altra.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {formattedItems.map(item => {
          const featuredUrl = item.featured_image ? `https://uxiaweb2.ieti.site${item.featured_image}` : '';
          const extraImages = item.images
            .map(image => image.url)
            .filter((url, index, list) => url && url !== featuredUrl && list.indexOf(url) === index)
            .slice(0, 4);

          const shortDescription = item.description.length > 120
            ? item.description.slice(0, 120).trim() + '...'
            : item.description;

          return (
            <article
              key={item.id}
              className={`group rounded-[32px] border p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-sky-300'}`}>
              <div className="overflow-hidden rounded-[28px] bg-slate-100 shadow-inner">
                {featuredUrl ? (
                  <img src={featuredUrl} alt={item.name} className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-slate-200 text-slate-500">No hi ha imatge destacada</div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{item.name}</h3>
                  <p className={`mt-2 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {shortDescription || 'Sense descripció disponible.'}
                  </p>
                </div>

                {extraImages.length > 0 && (
                  <div>
                    <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.28em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Altres imatges
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {extraImages.map(imageUrl => renderThumbnail(imageUrl, featuredUrl))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AdminExpoItems;
