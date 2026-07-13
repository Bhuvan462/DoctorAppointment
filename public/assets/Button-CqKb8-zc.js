import{j as t}from"./index-7rdTY9PN.js";import{r as h}from"./vendor-BX3LQpRV.js";import{c as x}from"./utils-ozT4J7If.js";import{m as n,A as z}from"./animations-DspJcQLh.js";const Y=({children:g,variant:w="primary",size:v="md",loading:r=!1,disabled:i=!1,icon:l=null,iconRight:a=null,fullWidth:y=!1,onClick:d,type:j="button",className:N="",ripple:k=!0,...R})=>{const[C,u]=h.useState([]),p=h.useRef(null),c={xs:"px-3 py-1.5 text-xs rounded-lg gap-1.5",sm:"px-4 py-2 text-sm rounded-xl gap-2",md:"px-5 py-2.5 text-sm rounded-xl gap-2",lg:"px-6 py-3 text-base rounded-xl gap-2.5",xl:"px-8 py-4 text-base rounded-2xl gap-3"},m={primary:`
      bg-gradient-to-r from-blue-600 to-blue-700
      hover:from-blue-500 hover:to-blue-600
      text-white font-semibold
      shadow-button hover:shadow-glow-blue
      border border-blue-500/30
    `,secondary:`
      bg-white/[0.06] hover:bg-white/[0.10]
      border border-white/10 hover:border-white/20
      text-slate-200 font-semibold
      backdrop-blur-xl
    `,teal:`
      bg-gradient-to-r from-teal-600 to-teal-700
      hover:from-teal-500 hover:to-teal-600
      text-white font-semibold
      hover:shadow-glow-teal
      border border-teal-500/30
    `,purple:`
      bg-gradient-to-r from-purple-600 to-purple-700
      hover:from-purple-500 hover:to-purple-600
      text-white font-semibold
      hover:shadow-glow-purple
      border border-purple-500/30
    `,danger:`
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-500 hover:to-red-600
      text-white font-semibold
      border border-red-500/30
    `,success:`
      bg-gradient-to-r from-emerald-600 to-emerald-700
      hover:from-emerald-500 hover:to-emerald-600
      text-white font-semibold
      border border-emerald-500/30
    `,ghost:`
      text-slate-400 hover:text-slate-100
      hover:bg-white/[0.06]
      font-medium
    `,outline:`
      bg-transparent
      border border-white/20 hover:border-white/40
      text-slate-200 font-semibold
      hover:bg-white/[0.04]
    `,link:`
      text-blue-400 hover:text-blue-300
      font-medium underline-offset-4
      hover:underline
      p-0
    `},B=e=>{if(!k||i||r)return;const b=p.current.getBoundingClientRect(),D=e.clientX-b.left,E=e.clientY-b.top,f=Date.now();u(s=>[...s,{x:D,y:E,id:f}]),setTimeout(()=>{u(s=>s.filter(T=>T.id!==f))},700)},A=e=>{B(e),d&&d(e)},o=i||r;return t.jsxs(n.button,{ref:p,type:j,onClick:A,disabled:o,className:x("relative inline-flex items-center justify-center","font-sans transition-all duration-200 overflow-hidden","focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50","select-none no-select",c[v]||c.md,m[w]||m.primary,o?"opacity-50 cursor-not-allowed pointer-events-none":"cursor-pointer",y&&"w-full",N),whileHover:o?{}:{y:-1,scale:1.005},whileTap:o?{}:{y:0,scale:.98},transition:{type:"spring",stiffness:400,damping:25},...R,children:[t.jsx(z,{children:C.map(e=>t.jsx(n.span,{className:"absolute rounded-full bg-white/20 pointer-events-none",style:{left:e.x-10,top:e.y-10,width:20,height:20},initial:{scale:0,opacity:1},animate:{scale:15,opacity:0},exit:{opacity:0},transition:{duration:.6,ease:"easeOut"}},e.id))}),r&&t.jsx(n.div,{className:"absolute inset-0 flex items-center justify-center",initial:{opacity:0},animate:{opacity:1},children:t.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"})}),t.jsxs("span",{className:x("flex items-center justify-center gap-2 transition-opacity duration-200",r&&"opacity-0"),children:[l&&t.jsx("span",{className:"flex-shrink-0 w-4 h-4 flex items-center justify-center",children:l}),g,a&&t.jsx("span",{className:"flex-shrink-0 w-4 h-4 flex items-center justify-center",children:a})]})]})};export{Y as B};
