import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
        theme === 'light'
          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300/80'
          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
      } ${className}`}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={15} className="text-indigo-600" />
          <span className="hidden sm:inline font-semibold">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={15} className="text-amber-400" />
          <span className="hidden sm:inline font-semibold">Light Mode</span>
        </>
      )}
    </button>
  );
}
