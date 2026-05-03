"use client";

import { useServerInsertedHTML } from "next/navigation";

export const browserDetectScript = `try{var u=navigator.userAgent,iOS=/iPhone|iPad|iPod/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),safari=/Safari\\//.test(u),other=/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo|GSA|Instagram/.test(u);if(iOS&&safari&&!other)document.documentElement.setAttribute('data-browser','ios-safari')}catch(e){}`;

// intro-pending クラスはイントロ再生中だけ main を visibility:hidden で隠す
// (FOUC 防止のため SSR HTML 段階で付与)。HomeIntro が mount したら useEffect で
// 削除する設計だが、Framer Motion / hydration / Strict Mode の race で削除が
// 走らないと永久に main が hidden = 真っ黒画面になるため、DOM レベルで
// 必ず 6 秒で剥がれるフェイルセーフ setTimeout を併設する。
export const introScript = `try{var p=location.pathname;if((p==='/'||/^\\/[a-z]{2}\\/?$/.test(p))&&sessionStorage.getItem('bigban-intro-played')!=='true'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-pending');setTimeout(function(){document.documentElement.classList.remove('intro-pending')},6000)}}catch(e){}`;

export default function PreHydrationScripts() {
  useServerInsertedHTML(() => (
    <>
      <script suppressHydrationWarning>{browserDetectScript}</script>
      <script suppressHydrationWarning>{introScript}</script>
    </>
  ));
  return null;
}
