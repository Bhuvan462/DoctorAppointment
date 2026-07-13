import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
      <Globe className="w-4 h-4 text-slate-400 mr-2" />
      <select
        className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer appearance-none pr-4"
        value={i18n.language}
        onChange={changeLanguage}
      >
        <option value="en" className="bg-slate-900 text-white">English</option>
        <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
        <option value="te" className="bg-slate-900 text-white">తెలుగు</option>
      </select>
    </div>
  );
}
