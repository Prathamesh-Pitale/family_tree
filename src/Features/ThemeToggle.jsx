import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
  
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  
    console.log('Theme is now', isDark ? 'dark' : 'light');
    console.log('html classes:', root.classList.toString());
  }, [isDark]);

  useEffect(() => {
    console.log('Theme is now', isDark ? 'dark' : 'light');
    console.log('html classes:', document.documentElement.className);
  }, [isDark]);
  

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
    >
      {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}

export default ThemeToggle;
