"use client";

import { useServerInsertedHTML } from "next/navigation";

export const browserDetectScript = `try{var u=navigator.userAgent,iOS=/iPhone|iPad|iPod/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),safari=/Safari\\//.test(u),other=/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo|GSA|Instagram/.test(u);if(iOS&&safari&&!other)document.documentElement.setAttribute('data-browser','ios-safari')}catch(e){}`;

export const introScript = `try{var p=location.pathname;if((p==='/'||/^\\/[a-z]{2}\\/?$/.test(p))&&sessionStorage.getItem('bigban-intro-played')!=='true'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-pending')}}catch(e){}`;

export default function PreHydrationScripts() {
  useServerInsertedHTML(() => (
    <>
      <script suppressHydrationWarning>{browserDetectScript}</script>
      <script suppressHydrationWarning>{introScript}</script>
    </>
  ));
  return null;
}
