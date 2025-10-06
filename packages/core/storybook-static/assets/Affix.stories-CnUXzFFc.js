import{j as e}from"./iframe-Dz2LC5nm.js";import{A as g}from"./index-DNuXpo7a.js";import{B as s}from"./Button-C1GbBzw5.js";import"./preload-helper-C1FmrZbK.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./throttleByAnimationFrame-DlhRwyTR.js";import"./genStyleUtils-BYYxHtb1.js";import"./button-D6Z5Xr5r.js";import"./omit-DXgDXInf.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useSize-oyF83k_j.js";import"./Compact-ObzKHgFl.js";import"./presetColors-DLnX3ho6.js";import"./LoadingOutlined-BrYRsAZK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";const t=h=>e.jsx(g,{...h});t.displayName="Affix";t.__docgenInfo={description:"",methods:[],displayName:"Affix",composes:["AntAffixProps"]};const V={title:"Navigation/Affix",component:t,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`
Componente que fija elementos en una posición específica durante el scroll.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/affix)
- [🎨 API de Props](https://ant.design/components/affix#api)
- [💡 Ejemplos](https://ant.design/components/affix#examples)

## Cuándo usar

- Para mantener botones o elementos de navegación visibles durante el scroll
- Cuando necesitas fijar barras de herramientas o menús
- Para mejorar la accesibilidad de acciones importantes en páginas largas
        `}}},argTypes:{offsetTop:{control:{type:"number"},description:"Pixels to offset from top when fixed"},offsetBottom:{control:{type:"number"},description:"Pixels to offset from bottom when fixed"},target:{control:!1,description:"Set the container to scroll"},onChange:{action:"changed",description:"Callback when affix state changed"}}},o={args:{offsetTop:10,children:e.jsx(s,{type:"primary",children:"Affix Top"})}},r={render:()=>e.jsxs("div",{style:{height:"100vh",padding:"20px"},children:[e.jsx(t,{offsetTop:120,children:e.jsx(s,{type:"primary",children:"120px to affix top"})}),e.jsx("div",{style:{height:"1000px",paddingTop:"60px"},children:e.jsx("p",{children:"Scroll to see the affix effect"})})]})},i={render:()=>e.jsxs("div",{style:{height:"100vh",padding:"20px"},children:[e.jsx("div",{style:{height:"1000px",paddingBottom:"60px"},children:e.jsx("p",{children:"Scroll down to see the affix effect"})}),e.jsx(t,{offsetBottom:10,children:e.jsx(s,{type:"primary",children:"Affix Bottom"})})]})};var p,n,a;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    offsetTop: 10,
    children: <Button type="primary">Affix Top</Button>
  }
}`,...(a=(n=o.parameters)==null?void 0:n.docs)==null?void 0:a.source}}};var f,m,d;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    padding: '20px'
  }}>\r
      <Affix offsetTop={120}>\r
        <Button type="primary">120px to affix top</Button>\r
      </Affix>\r
      <div style={{
      height: '1000px',
      paddingTop: '60px'
    }}>\r
        <p>Scroll to see the affix effect</p>\r
      </div>\r
    </div>
}`,...(d=(m=r.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var c,l,x;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    padding: '20px'
  }}>\r
      <div style={{
      height: '1000px',
      paddingBottom: '60px'
    }}>\r
        <p>Scroll down to see the affix effect</p>\r
      </div>\r
      <Affix offsetBottom={10}>\r
        <Button type="primary">Affix Bottom</Button>\r
      </Affix>\r
    </div>
}`,...(x=(l=i.parameters)==null?void 0:l.docs)==null?void 0:x.source}}};const W=["Basic","OffsetTop","OffsetBottom"];export{o as Basic,i as OffsetBottom,r as OffsetTop,W as __namedExportsOrder,V as default};
