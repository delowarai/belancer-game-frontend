// Apply the saved preference before the page paints.
(() => {
  let saved;
  try { saved = localStorage.getItem('belancer-theme'); } catch {}
  const theme = saved === 'light' || saved === 'dark' ? saved :
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
})();
