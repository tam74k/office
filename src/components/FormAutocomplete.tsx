import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Briefcase, Globe } from 'lucide-react';
import { Profession, Country } from '../types';
import { matchesFlexibleArabic } from '../utils/helpers';

interface ProfessionAutocompleteProps {
  professions: Profession[];
  selectedId: string;
  onChange: (profession: Profession) => void;
  placeholder?: string;
  error?: string;
}

export const ProfessionAutocomplete: React.FC<ProfessionAutocompleteProps> = ({
  professions,
  selectedId,
  onChange,
  placeholder = 'ابحث عن مهنة (مثال: سائق، عاملة منزلية...)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedProfession = useMemo(() => {
    return professions.find(p => p.id === selectedId);
  }, [professions, selectedId]);

  useEffect(() => {
    if (selectedProfession) {
      setQuery(selectedProfession.name);
    } else {
      setQuery('');
    }
  }, [selectedProfession]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query back to selected profession name if closed without selecting
        if (selectedProfession) {
          setQuery(selectedProfession.name);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProfession]);

  const filteredProfessions = useMemo(() => {
    if (!query.trim() || (selectedProfession && query.trim() === selectedProfession.name)) {
      return professions;
    }
    return professions.filter(p => 
      matchesFlexibleArabic(p.name, query) ||
      matchesFlexibleArabic(p.category, query) ||
      (p.description && matchesFlexibleArabic(p.description, query))
    );
  }, [professions, query, selectedProfession]);

  const handleSelect = (prof: Profession) => {
    onChange(prof);
    setQuery(prof.name);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {filteredProfessions.length > 0 ? (
            filteredProfessions.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full text-right px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{p.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.category === 'منزلية' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      الراتب: {p.default_salary} {p.currency || 'SAR'}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              لا توجد مهنة مطابقة لكلمة البحث "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CountryAutocompleteProps {
  countries: Country[];
  selectedId: string;
  onChange: (country: Country) => void;
  placeholder?: string;
  onlyWorkerCountries?: boolean;
}

export const CountryAutocomplete: React.FC<CountryAutocompleteProps> = ({
  countries,
  selectedId,
  onChange,
  placeholder = 'ابحث عن دولة (مثال: الهند، الفلبين...)',
  onlyWorkerCountries = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const availableCountries = useMemo(() => {
    if (onlyWorkerCountries) {
      const list = countries.filter(c => !c.is_sponsor_country);
      return list.length > 0 ? list : countries;
    }
    return countries;
  }, [countries, onlyWorkerCountries]);

  const selectedCountry = useMemo(() => {
    return countries.find(c => c.id === selectedId);
  }, [countries, selectedId]);

  useEffect(() => {
    if (selectedCountry) {
      setQuery(`${selectedCountry.flag_emoji || ''} ${selectedCountry.name}`.trim());
    } else {
      setQuery('');
    }
  }, [selectedCountry]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedCountry) {
          setQuery(`${selectedCountry.flag_emoji || ''} ${selectedCountry.name}`.trim());
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    if (!query.trim() || (selectedCountry && query.trim() === `${selectedCountry.flag_emoji || ''} ${selectedCountry.name}`.trim())) {
      return availableCountries;
    }
    return availableCountries.filter(c => 
      matchesFlexibleArabic(c.name, query) ||
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.phone_code.includes(query)
    );
  }, [availableCountries, query, selectedCountry]);

  const handleSelect = (country: Country) => {
    onChange(country);
    setQuery(`${country.flag_emoji || ''} ${country.name}`.trim());
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full text-right px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{c.flag_emoji}</span>
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">({c.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {c.phone_code}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              لا توجد دولة مطابقة لكلمة البحث "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
