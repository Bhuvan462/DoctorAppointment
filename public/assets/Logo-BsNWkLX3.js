import{j as e}from"./index-7rdTY9PN.js";import{L as x}from"./vendor-BX3LQpRV.js";import{m as c}from"./animations-DspJcQLh.js";const u=({size:a="md",showText:n=!0,linkTo:o="/",animate:l=!0})=>{const r={sm:{container:"w-8 h-8",icon:"w-4 h-4",text:"text-lg",rounded:"rounded-xl"},md:{container:"w-10 h-10",icon:"w-5 h-5",text:"text-xl",rounded:"rounded-xl"},lg:{container:"w-14 h-14",icon:"w-7 h-7",text:"text-2xl",rounded:"rounded-2xl"},xl:{container:"w-20 h-20",icon:"w-10 h-10",text:"text-4xl",rounded:"rounded-3xl"}},t=r[a]||r.md,s=()=>e.jsx(c.div,{className:`
        ${t.container} ${t.rounded}
        bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500
        flex items-center justify-center
        shadow-glow-blue flex-shrink-0
      `,whileHover:l?{scale:1.05,rotate:-5}:{},transition:{type:"spring",stiffness:400,damping:20},children:e.jsx("svg",{className:`${t.icon} text-white`,fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2.5,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 6v6m0 0v6m0-6h6m-6 0H6"})})}),i=()=>e.jsxs("span",{className:`
        ${t.text} font-bold tracking-tight
        bg-gradient-to-r from-white via-slate-100 to-slate-300
        bg-clip-text text-transparent
        select-none
      `,children:["Medi",e.jsx("span",{className:"bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent",children:"Book"})]});return o?e.jsxs(x,{to:o,className:"flex items-center gap-3 group",children:[e.jsx(s,{}),n&&e.jsx(i,{})]}):e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(s,{}),n&&e.jsx(i,{})]})};export{u as L};
