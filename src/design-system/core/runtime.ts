import { designSystemIds, type DesignSystemId } from './types';

export const DESIGN_STORAGE_KEY = 'sp-design';

export const DESIGN_SESSION_KEY = 'sp-design-session';

export const defaultDesignSystem: DesignSystemId = 'aurora';

export const DESIGN_ATTRIBUTE = 'data-design';

const ids = JSON.stringify(designSystemIds);
const chosenKey = JSON.stringify(DESIGN_STORAGE_KEY);
const sessionKey = JSON.stringify(DESIGN_SESSION_KEY);
const attribute = JSON.stringify(DESIGN_ATTRIBUTE);
const fallback = JSON.stringify(defaultDesignSystem);

export const designInitScript = `(function(){
var v=${ids},d=null;
try{var s=localStorage.getItem(${chosenKey});if(v.indexOf(s)>-1)d=s;}catch(e){}
if(!d){try{var r=sessionStorage.getItem(${sessionKey});if(v.indexOf(r)>-1)d=r;}catch(e){}}
if(!d){d=v[Math.floor(Math.random()*v.length)];try{sessionStorage.setItem(${sessionKey},d);}catch(e){}}
try{document.documentElement.setAttribute(${attribute},d||${fallback});}catch(e){}
})();`;
