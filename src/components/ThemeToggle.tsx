import {useState} from 'react';

export default function ThemeToggle(){
  const [theme,setTheme]=useState(document.documentElement.dataset.theme==='dark'?'dark':'light');
  function toggle(){
    const next=theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('belancer-theme',next)}catch{}
    setTheme(next);
  }
  const label=`Switch to ${theme==='dark'?'light':'dark'} mode`;
  return <button type="button" className="theme-toggle secondary" onClick={toggle} aria-label={label} title={label}>
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {theme==='dark'?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>}
    </svg>
  </button>;
}
