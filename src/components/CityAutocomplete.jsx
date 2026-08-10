import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Check, Loader2 } from 'lucide-react';

// Comprehensive Fallback Philippine Cities & Municipalities + International Top Cities
const fallbackPhilippineLocations = [
  // National Capital Region (NCR)
  { city: 'Manila', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Quezon City', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Caloocan', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Las Piñas', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Makati', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Malabon', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Mandaluyong', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Marikina', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Muntinlupa', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Navotas', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Parañaque', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Pasay', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Pasig', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Pateros', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'San Juan', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Taguig', province: 'Metro Manila', flag: '🇵🇭' },
  { city: 'Valenzuela', province: 'Metro Manila', flag: '🇵🇭' },

  // Region I & II (Northern Luzon)
  { city: 'Laoag City', province: 'Ilocos Norte', flag: '🇵🇭' },
  { city: 'Vigan City', province: 'Ilocos Sur', flag: '🇵🇭' },
  { city: 'San Fernando', province: 'La Union', flag: '🇵🇭' },
  { city: 'Dagupan City', province: 'Pangasinan', flag: '🇵🇭' },
  { city: 'Tuguegarao City', province: 'Cagayan', flag: '🇵🇭' },
  { city: 'Cauayan City', province: 'Isabela', flag: '🇵🇭' },

  // Region III & IV-A (Central Luzon & CALABARZON)
  { city: 'Angeles City', province: 'Pampanga', flag: '🇵🇭' },
  { city: 'San Fernando', province: 'Pampanga', flag: '🇵🇭' },
  { city: 'Olongapo City', province: 'Zambales', flag: '🇵🇭' },
  { city: 'Malolos City', province: 'Bulacan', flag: '🇵🇭' },
  { city: 'Meycauayan', province: 'Bulacan', flag: '🇵🇭' },
  { city: 'Antipolo City', province: 'Rizal', flag: '🇵🇭' },
  { city: 'Bacoor City', province: 'Cavite', flag: '🇵🇭' },
  { city: 'Imus City', province: 'Cavite', flag: '🇵🇭' },
  { city: 'Dasmarinas City', province: 'Cavite', flag: '🇵🇭' },
  { city: 'Tagaytay City', province: 'Cavite', flag: '🇵🇭' },
  { city: 'Calamba City', province: 'Laguna', flag: '🇵🇭' },
  { city: 'Santa Rosa City', province: 'Laguna', flag: '🇵🇭' },
  { city: 'Biñan City', province: 'Laguna', flag: '🇵🇭' },
  { city: 'Batangas City', province: 'Batangas', flag: '🇵🇭' },
  { city: 'Lipa City', province: 'Batangas', flag: '🇵🇭' },
  { city: 'Lucena City', province: 'Quezon', flag: '🇵🇭' },

  // Region IV-B & V (MIMAROPA & Bicol)
  { city: 'Puerto Princesa City', province: 'Palawan', flag: '🇵🇭' },
  { city: 'Calapan City', province: 'Oriental Mindoro', flag: '🇵🇭' },
  { city: 'Legazpi City', province: 'Albay', flag: '🇵🇭' },
  { city: 'Naga City', province: 'Camarines Sur', flag: '🇵🇭' },
  { city: 'Sorsogon City', province: 'Sorsogon', flag: '🇵🇭' },

  // Visayas (Region VI, VII, VIII)
  { city: 'Iloilo City', province: 'Iloilo', flag: '🇵🇭' },
  { city: 'Roxas City', province: 'Capiz', flag: '🇵🇭' },
  { city: 'Bacolod City', province: 'Negros Occidental', flag: '🇵🇭' },
  { city: 'Cebu City', province: 'Cebu', flag: '🇵🇭' },
  { city: 'Mandaue City', province: 'Cebu', flag: '🇵🇭' },
  { city: 'Lapu-Lapu City', province: 'Cebu', flag: '🇵🇭' },
  { city: 'Tagbilaran City', province: 'Bohol', flag: '🇵🇭' },
  { city: 'Dumaguete City', province: 'Negros Oriental', flag: '🇵🇭' },
  { city: 'Tacloban City', province: 'Leyte', flag: '🇵🇭' },
  { city: 'Ormoc City', province: 'Leyte', flag: '🇵🇭' },
  { city: 'Calbayog City', province: 'Samar', flag: '🇵🇭' },

  // Mindanao (Region IX, X, XI, XII, XIII, BARMM)
  { city: 'Zamboanga City', province: 'Zamboanga del Sur', flag: '🇵🇭' },
  { city: 'Cagayan de Oro City', province: 'Misamis Oriental', flag: '🇵🇭' },
  { city: 'Iligan City', province: 'Lanao del Norte', flag: '🇵🇭' },
  { city: 'Malaybalay City', province: 'Bukidnon', flag: '🇵🇭' },
  { city: 'Davao City', province: 'Davao del Sur', flag: '🇵🇭' },
  { city: 'Tagum City', province: 'Davao del Norte', flag: '🇵🇭' },
  { city: 'General Santos City', province: 'South Cotabato', flag: '🇵🇭' },
  { city: 'Koronadal City', province: 'South Cotabato', flag: '🇵🇭' },
  { city: 'Cotabato City', province: 'Maguindanao', flag: '🇵🇭' },
  { city: 'Butuan City', province: 'Agusan del Norte', flag: '🇵🇭' },
  { city: 'Surigao City', province: 'Surigao del Norte', flag: '🇵🇭' },
  { city: 'Marawi City', province: 'Lanao del Sur', flag: '🇵🇭' },

  // CAR
  { city: 'Baguio City', province: 'Benguet', flag: '🇵🇭' },

  // International Cities (Outside PH)
  { city: 'Tokyo', province: 'Japan', flag: '🇯🇵' },
  { city: 'Singapore', province: 'Singapore', flag: '🇸🇬' },
  { city: 'London', province: 'United Kingdom', flag: '🇬🇧' },
  { city: 'New York', province: 'United States', flag: '🇺🇸' },
  { city: 'Sydney', province: 'Australia', flag: '🇦🇺' },
  { city: 'Toronto', province: 'Canada', flag: '🇨🇦' },
  { city: 'Seoul', province: 'South Korea', flag: '🇰🇷' },
  { city: 'Berlin', province: 'Germany', flag: '🇩🇪' },
  { city: 'Paris', province: 'France', flag: '🇫🇷' },
  { city: 'Dubai', province: 'United Arab Emirates', flag: '🇦🇪' }
];

export default function CityAutocomplete({ value, onChange }) {
  const [philippineCities, setPhilippineCities] = useState(fallbackPhilippineLocations);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Fetch full PSGC Philippine Cities & Municipalities API on mount
  useEffect(() => {
    async function fetchPsgcData() {
      setIsLoadingApi(true);
      try {
        const res = await fetch('https://psgc.gitlab.io/api/cities-municipalities.json');
        if (res.ok) {
          const data = await res.json();
          // Transform API results
          const transformed = data.map((item) => ({
            city: item.name,
            province: item.provinceName || item.regionName || 'Philippines',
            flag: '🇵🇭'
          }));
          // Combine API Philippine cities + International cities
          const international = fallbackPhilippineLocations.filter((c) => c.flag !== '🇵🇭');
          setPhilippineCities([...transformed, ...international]);
        }
      } catch (err) {
        console.log('Using robust offline Philippine locations dataset');
      } finally {
        setIsLoadingApi(false);
      }
    }
    fetchPsgcData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = philippineCities.filter(
    (c) =>
      c.city.toLowerCase().includes(query.toLowerCase()) ||
      c.province.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    const formatted = `${item.city}, ${item.flag} ${item.province}`;
    setQuery(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-2 select-none">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search all Philippine cities & municipalities (e.g. Manila, Cebu, Davao)..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white outline-none placeholder-slate-500"
        />
        {isLoadingApi && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 animate-spin" size={14} />
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {[
          { city: 'Manila', province: 'Metro Manila', flag: '🇵🇭' },
          { city: 'Quezon City', province: 'Metro Manila', flag: '🇵🇭' },
          { city: 'Cebu City', province: 'Cebu', flag: '🇵🇭' },
          { city: 'Davao City', province: 'Davao del Sur', flag: '🇵🇭' },
          { city: 'Baguio City', province: 'Benguet', flag: '🇵🇭' }
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(chip)}
            className="text-[10px] bg-slate-900 border border-slate-800 hover:border-sky-500 text-sky-300 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1"
          >
            <span>{chip.flag}</span>
            <span>{chip.city}</span>
          </button>
        ))}
      </div>

      {/* Filtered Dropdown List */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-12 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl max-h-52 overflow-y-auto pr-1">
          <div className="p-2 border-b border-slate-800 text-[10px] font-bold text-sky-400 flex items-center justify-between">
            <span>PHILIPPINE CITIES & MUNICIPALITIES ({filtered.length} matched)</span>
            <span className="text-slate-500">PSGC API Enabled</span>
          </div>

          {filtered.slice(0, 50).map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              className="p-2.5 hover:bg-sky-500/20 cursor-pointer flex items-center justify-between text-xs text-slate-200 border-b border-slate-800/40 last:border-none transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.flag}</span>
                <span className="font-bold text-white">{item.city}</span>
                <span className="text-slate-500 text-[10px]">({item.province})</span>
              </div>
              {query.includes(item.city) && <Check size={14} className="text-sky-400" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
