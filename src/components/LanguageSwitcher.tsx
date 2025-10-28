
import React, { useState, useEffect, useRef } from 'react';
import { GlobeIcon } from './icons';
import { Language, TranslationStrings } from '../types';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  translations: TranslationStrings;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange, translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const selectLanguage = (lang: Language) => {
    onLangChange(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        className="flex items-center p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        aria-label={translations.language}
      >
        <GlobeIcon className="h-6 w-6 text-white" />
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20 max-h-64 overflow-y-auto"
        >
          {[
            { code: 'en', name: 'English' },
            { code: 'zh-TW', name: '繁體中文' },
            { code: 'zh-CN', name: '简体中文' },
            { code: 'ja', name: '日本語' },
            { code: 'ko', name: '한국어' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'de', name: 'Deutsch' },
          ].map((lang) => (
            <a
              key={lang.code}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                selectLanguage(lang.code as any);
              }}
              className={`block px-4 py-2 text-sm ${currentLang === lang.code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-50`}
            >
              {lang.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};