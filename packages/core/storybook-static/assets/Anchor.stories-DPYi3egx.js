import{r as o,C as se,c as B,u as V,a as je,t as Te,b as Be,v as H,G as Le,j as a}from"./iframe-Dz2LC5nm.js";import{e as Ie}from"./index-DKjRcP81.js";import{g as Ne,s as Oe}from"./scrollTo-BMQPlNtM.js";import{A as ze}from"./index-DNuXpo7a.js";import{u as _e}from"./useCSSVarCls-BbjthPCx.js";import{g as De,m as Re}from"./genStyleUtils-BYYxHtb1.js";import"./preload-helper-C1FmrZbK.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./throttleByAnimationFrame-DlhRwyTR.js";const ce=o.createContext(void 0),le=t=>{const{href:e,title:i,prefixCls:u,children:s,className:v,target:l,replace:f}=t,S=o.useContext(ce),{registerLink:b,unregisterLink:$,scrollTo:h,onClick:P,activeLink:k,direction:I}=S||{};o.useEffect(()=>(b==null||b(e),()=>{$==null||$(e)}),[e]);const A=g=>{if(P==null||P(g,{title:i,href:e}),h==null||h(e),g.defaultPrevented)return;if(e.startsWith("http://")||e.startsWith("https://")){f&&(g.preventDefault(),window.location.replace(e));return}g.preventDefault();const E=f?"replaceState":"pushState";window.history[E](null,"",e)},{getPrefixCls:w}=o.useContext(se),d=w("anchor",u),N=k===e,C=B(`${d}-link`,v,{[`${d}-link-active`]:N}),O=B(`${d}-link-title`,{[`${d}-link-title-active`]:N});return o.createElement("div",{className:C},o.createElement("a",{className:O,href:e,title:typeof i=="string"?i:"",target:l,onClick:A},i),I!=="horizontal"?s:null)},Fe=t=>{const{componentCls:e,holderOffsetBlock:i,motionDurationSlow:u,lineWidthBold:s,colorPrimary:v,lineType:l,colorSplit:f,calc:S}=t;return{[`${e}-wrapper`]:{marginBlockStart:S(i).mul(-1).equal(),paddingBlockStart:i,[e]:Object.assign(Object.assign({},je(t)),{position:"relative",paddingInlineStart:s,[`${e}-link`]:{paddingBlock:t.linkPaddingBlock,paddingInline:`${V(t.linkPaddingInlineStart)} 0`,"&-title":Object.assign(Object.assign({},Te),{position:"relative",display:"block",marginBlockEnd:t.anchorTitleBlock,color:t.colorText,transition:`all ${t.motionDurationSlow}`,"&:only-child":{marginBlockEnd:0}}),[`&-active > ${e}-link-title`]:{color:t.colorPrimary},[`${e}-link`]:{paddingBlock:t.anchorPaddingBlockSecondary}}}),[`&:not(${e}-wrapper-horizontal)`]:{[e]:{"&::before":{position:"absolute",insetInlineStart:0,top:0,height:"100%",borderInlineStart:`${V(s)} ${l} ${f}`,content:'" "'},[`${e}-ink`]:{position:"absolute",insetInlineStart:0,display:"none",transform:"translateY(-50%)",transition:`top ${u} ease-in-out`,width:s,backgroundColor:v,[`&${e}-ink-visible`]:{display:"inline-block"}}}},[`${e}-fixed ${e}-ink ${e}-ink`]:{display:"none"}}}},We=t=>{const{componentCls:e,motionDurationSlow:i,lineWidthBold:u,colorPrimary:s}=t;return{[`${e}-wrapper-horizontal`]:{position:"relative","&::before":{position:"absolute",left:{_skip_check_:!0,value:0},right:{_skip_check_:!0,value:0},bottom:0,borderBottom:`${V(t.lineWidth)} ${t.lineType} ${t.colorSplit}`,content:'" "'},[e]:{overflowX:"scroll",position:"relative",display:"flex",scrollbarWidth:"none","&::-webkit-scrollbar":{display:"none"},[`${e}-link:first-of-type`]:{paddingInline:0},[`${e}-ink`]:{position:"absolute",bottom:0,transition:`left ${i} ease-in-out, width ${i} ease-in-out`,height:u,backgroundColor:s}}}}},qe=t=>({linkPaddingBlock:t.paddingXXS,linkPaddingInlineStart:t.padding}),Me=De("Anchor",t=>{const{fontSize:e,fontSizeLG:i,paddingXXS:u,calc:s}=t,v=Re(t,{holderOffsetBlock:u,anchorPaddingBlockSecondary:s(u).div(2).equal(),anchorTitleBlock:s(e).div(14).mul(3).equal(),anchorBallSize:s(i).div(2).equal()});return[Fe(v),We(v)]},qe);function He(){return window}function Z(t,e){if(!t.getClientRects().length)return 0;const i=t.getBoundingClientRect();return i.width||i.height?e===window?i.top-t.ownerDocument.documentElement.clientTop:i.top-e.getBoundingClientRect().top:i.top}const ee=/#([\S ]+)$/,Ve=t=>{var e;const{rootClassName:i,prefixCls:u,className:s,style:v,offsetTop:l,affix:f=!0,showInkInFixed:S=!1,children:b,items:$,direction:h="vertical",bounds:P,targetOffset:k,onClick:I,onChange:A,getContainer:w,getCurrentAnchor:d,replace:N}=t,[C,O]=o.useState([]),[g,X]=o.useState(null),E=o.useRef(g),G=o.useRef(null),D=o.useRef(null),R=o.useRef(!1),{direction:pe,getPrefixCls:ue,className:fe,style:he}=Be("anchor"),{getTargetContainer:ge}=o.useContext(se),m=ue("anchor",u),J=_e(m),[me,ve,ke]=Me(m,J),j=(e=w??ge)!==null&&e!==void 0?e:He,F=JSON.stringify(C),xe=H(n=>{C.includes(n)||O(r=>[].concat(Le(r),[n]))}),ye=H(n=>{C.includes(n)&&O(r=>r.filter(p=>p!==n))}),Ce=()=>{var n;const r=(n=G.current)===null||n===void 0?void 0:n.querySelector(`.${m}-link-title-active`);if(r&&D.current){const{style:p}=D.current,c=h==="horizontal";p.top=c?"":`${r.offsetTop+r.clientHeight/2}px`,p.height=c?"":`${r.clientHeight}px`,p.left=c?`${r.offsetLeft}px`:"",p.width=c?`${r.clientWidth}px`:"",c&&Ie(r,{scrollMode:"if-needed",block:"nearest"})}},Se=(n,r=0,p=5)=>{const c=[],M=j();return n.forEach(y=>{const x=ee.exec(y==null?void 0:y.toString());if(!x)return;const T=document.getElementById(x[1]);if(T){const U=Z(T,M);U<=r+p&&c.push({link:y,top:U})}}),c.length?c.reduce((x,T)=>T.top>x.top?T:x).link:""},W=H(n=>{if(E.current===n)return;const r=typeof d=="function"?d(n):n;X(r),E.current=r,A==null||A(n)}),q=o.useCallback(()=>{if(R.current)return;const n=Se(C,k!==void 0?k:l||0,P);W(n)},[F,k,l]),Y=o.useCallback(n=>{W(n);const r=ee.exec(n);if(!r)return;const p=document.getElementById(r[1]);if(!p)return;const c=j(),M=Ne(c),y=Z(p,c);let x=M+y;x-=k!==void 0?k:l||0,R.current=!0,Oe(x,{getContainer:j,callback(){R.current=!1}})},[k,l]),be=B(ve,ke,J,i,`${m}-wrapper`,{[`${m}-wrapper-horizontal`]:h==="horizontal",[`${m}-rtl`]:pe==="rtl"},s,fe),$e=B(m,{[`${m}-fixed`]:!f&&!S}),Pe=B(`${m}-ink`,{[`${m}-ink-visible`]:g}),Ae=Object.assign(Object.assign({maxHeight:l?`calc(100vh - ${l}px)`:"100vh"},he),v),K=n=>Array.isArray(n)?n.map(r=>o.createElement(le,Object.assign({replace:N},r,{key:r.key}),h==="vertical"&&K(r.children))):null,Q=o.createElement("div",{ref:G,className:be,style:Ae},o.createElement("div",{className:$e},o.createElement("span",{className:Pe,ref:D}),"items"in t?K($):b));o.useEffect(()=>{const n=j();return q(),n==null||n.addEventListener("scroll",q),()=>{n==null||n.removeEventListener("scroll",q)}},[F]),o.useEffect(()=>{typeof d=="function"&&W(d(E.current||""))},[d]),o.useEffect(()=>{Ce()},[h,d,F,g]);const we=o.useMemo(()=>({registerLink:xe,unregisterLink:ye,scrollTo:Y,activeLink:g,onClick:I,direction:h}),[g,I,Y,h]),Ee=f&&typeof f=="object"?f:void 0;return me(o.createElement(ce.Provider,{value:we},f?o.createElement(ze,Object.assign({offsetTop:l,target:j},Ee),Q):Q))},de=Ve;de.Link=le;const L=t=>a.jsx(de,{...t});L.displayName="Anchor";L.__docgenInfo={description:"",methods:[],displayName:"Anchor",composes:["AntAnchorProps"]};const ot={title:"Navigation/Anchor",component:L,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`
Navegación tipo ancla que permite saltar a secciones específicas de la página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/anchor)
- [🎨 API de Props](https://ant.design/components/anchor#api)
- [💡 Ejemplos](https://ant.design/components/anchor#examples)

## Cuándo usar

- Para navegar entre secciones de un documento largo
- Cuando necesitas un índice o tabla de contenidos interactiva
- Para mejorar la navegación en páginas con múltiples secciones
        `}}},argTypes:{affix:{control:{type:"boolean"},description:"Fixed mode of Anchor",defaultValue:!0},bounds:{control:{type:"number"},description:"Bounding distance of anchor area"},offsetTop:{control:{type:"number"},description:"Pixels to offset from top when calculating position of scroll"},targetOffset:{control:{type:"number"},description:"Anchor scroll offset"},items:{control:{type:"object"},description:"Data configuration option content, support nesting"},direction:{control:{type:"select"},options:["vertical","horizontal"],description:"Set Anchor direction"},onChange:{action:"changed",description:"Callback when active link changes"},onClick:{action:"clicked",description:"Callback when item is clicked"}}},z={render:()=>a.jsxs("div",{style:{display:"flex",gap:"20px",padding:"20px"},children:[a.jsx(L,{items:[{key:"part-1",href:"#part-1",title:"Part 1"},{key:"part-2",href:"#part-2",title:"Part 2"},{key:"part-3",href:"#part-3",title:"Part 3"}]}),a.jsxs("div",{children:[a.jsxs("div",{id:"part-1",style:{height:"400px",paddingTop:"10px"},children:[a.jsx("h2",{children:"Part 1"}),a.jsx("p",{children:"Content of Part 1"})]}),a.jsxs("div",{id:"part-2",style:{height:"400px",paddingTop:"10px"},children:[a.jsx("h2",{children:"Part 2"}),a.jsx("p",{children:"Content of Part 2"})]}),a.jsxs("div",{id:"part-3",style:{height:"400px",paddingTop:"10px"},children:[a.jsx("h2",{children:"Part 3"}),a.jsx("p",{children:"Content of Part 3"})]})]})]})},_={render:()=>a.jsx(L,{affix:!1,items:[{key:"introduction",href:"#introduction",title:"Introduction"},{key:"features",href:"#features",title:"Features",children:[{key:"feature-1",href:"#feature-1",title:"Feature 1"},{key:"feature-2",href:"#feature-2",title:"Feature 2"}]},{key:"api",href:"#api",title:"API"}]})};var te,ne,oe;z.parameters={...z.parameters,docs:{...(te=z.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '20px',
    padding: '20px'
  }}>\r
      <Anchor items={[{
      key: 'part-1',
      href: '#part-1',
      title: 'Part 1'
    }, {
      key: 'part-2',
      href: '#part-2',
      title: 'Part 2'
    }, {
      key: 'part-3',
      href: '#part-3',
      title: 'Part 3'
    }]} />\r
      <div>\r
        <div id="part-1" style={{
        height: '400px',
        paddingTop: '10px'
      }}>\r
          <h2>Part 1</h2>\r
          <p>Content of Part 1</p>\r
        </div>\r
        <div id="part-2" style={{
        height: '400px',
        paddingTop: '10px'
      }}>\r
          <h2>Part 2</h2>\r
          <p>Content of Part 2</p>\r
        </div>\r
        <div id="part-3" style={{
        height: '400px',
        paddingTop: '10px'
      }}>\r
          <h2>Part 3</h2>\r
          <p>Content of Part 3</p>\r
        </div>\r
      </div>\r
    </div>
}`,...(oe=(ne=z.parameters)==null?void 0:ne.docs)==null?void 0:oe.source}}};var re,ie,ae;_.parameters={..._.parameters,docs:{...(re=_.parameters)==null?void 0:re.docs,source:{originalSource:`{
  render: () => <Anchor affix={false} items={[{
    key: 'introduction',
    href: '#introduction',
    title: 'Introduction'
  }, {
    key: 'features',
    href: '#features',
    title: 'Features',
    children: [{
      key: 'feature-1',
      href: '#feature-1',
      title: 'Feature 1'
    }, {
      key: 'feature-2',
      href: '#feature-2',
      title: 'Feature 2'
    }]
  }, {
    key: 'api',
    href: '#api',
    title: 'API'
  }]} />
}`,...(ae=(ie=_.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};const rt=["Basic","Static"];export{z as Basic,_ as Static,rt as __namedExportsOrder,ot as default};
