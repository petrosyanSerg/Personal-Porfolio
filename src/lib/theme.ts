export const THEME_STORAGE_KEY = 'sp-theme';

export const themes = ['dark', 'light', 'cinematic'] as const;

export type Theme = (typeof themes)[number];

export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='light'||s==='cinematic')?s:'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
