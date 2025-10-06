import{j as t}from"./iframe-Dz2LC5nm.js";import{F as a}from"./index-CXpVOJlS.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./scrollTo-BMQPlNtM.js";import"./throttleByAnimationFrame-DlhRwyTR.js";import"./omit-DXgDXInf.js";import"./convertToTooltipProps-Dw8imluH.js";import"./useZIndex-Dv1QJmGl.js";import"./index-7Swwaeny.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./reactNode-B7JGm4rf.js";import"./Keyframes-DYCYu-A0.js";import"./genStyleUtils-BYYxHtb1.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./useMergedState-DIkF75NH.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./zoom-CWPxwh-U.js";import"./motion-DteYqKxb.js";import"./util-DIS73dAr.js";import"./fade-QfD4GzOS.js";import"./CloseOutlined-Uef9iQNA.js";const e=G=>t.jsx(a,{...G});e.displayName="FloatButton";e.Group=a.Group;e.BackTop=a.BackTop;e.__docgenInfo={description:"",methods:[],displayName:"FloatButton"};const ut={title:"Navigation/FloatButton",component:e,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`
Botón flotante que permanece visible en una posición fija de la pantalla.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/float-button)
- [🎨 API de Props](https://ant.design/components/float-button#api)
- [💡 Ejemplos](https://ant.design/components/float-button#examples)

## Cuándo usar

- Para acciones principales que deben estar siempre accesibles
- Cuando necesitas un acceso rápido a funciones frecuentes
- Para menús de acciones flotantes con múltiples opciones
        `}}},argTypes:{type:{control:{type:"select"},options:["default","primary"],description:"Type of button"},shape:{control:{type:"select"},options:["circle","square"],description:"Shape of button",defaultValue:"circle"},icon:{control:!1,description:"Custom icon"},description:{control:{type:"text"},description:"Description of button"},tooltip:{control:{type:"text"},description:"Tooltip text"},badge:{control:{type:"object"},description:"Badge props"},onClick:{action:"clicked",description:"Callback when button is clicked"}}},o={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Hover over the float button on the bottom right"}),t.jsx(e,{})]})},r={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Float buttons with different shapes"}),t.jsx(e,{shape:"circle",style:{right:94}}),t.jsx(e,{shape:"square",style:{right:24}})]})},i={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Float buttons with different types"}),t.jsx(e,{type:"default",style:{right:94}}),t.jsx(e,{type:"primary",style:{right:24}})]})},s={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Float button with description"}),t.jsx(e,{shape:"square",description:"Help",style:{right:24}})]})},n={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Float button with badge"}),t.jsx(e,{badge:{count:5},style:{right:24}})]})},p={render:()=>t.jsxs("div",{style:{height:"100vh",position:"relative"},children:[t.jsx("p",{style:{padding:"20px"},children:"Float button group"}),t.jsxs(e.Group,{trigger:"hover",style:{right:24},children:[t.jsx(e,{}),t.jsx(e,{}),t.jsx(e,{})]})]})};var l,d,c;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    position: 'relative'
  }}>\r
      <p style={{
      padding: '20px'
    }}>Hover over the float button on the bottom right</p>\r
      <FloatButton />\r
    </div>
}`,...(c=(d=o.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var h,u,m;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    position: 'relative'
  }}>\r
      <p style={{
      padding: '20px'
    }}>Float buttons with different shapes</p>\r
      <FloatButton shape="circle" style={{
      right: 94
    }} />\r
      <FloatButton shape="square" style={{
      right: 24
    }} />\r
    </div>
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var g,y,v;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    position: 'relative'
  }}>\r
      <p style={{
      padding: '20px'
    }}>Float buttons with different types</p>\r
      <FloatButton type="default" style={{
      right: 94
    }} />\r
      <FloatButton type="primary" style={{
      right: 24
    }} />\r
    </div>
}`,...(v=(y=i.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var x,f,b;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    position: 'relative'
  }}>\r
      <p style={{
      padding: '20px'
    }}>Float button with description</p>\r
      <FloatButton shape="square" description="Help" style={{
      right: 24
    }} />\r
    </div>
}`,...(b=(f=s.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var j,F,B;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div style={{
    height: '100vh',
    position: 'relative'
  }}>\r
      <p style={{
      padding: '20px'
    }}>Float button with badge</p>\r
      <FloatButton badge={{
      count: 5
    }} style={{
      right: 24
    }} />\r
    </div>
}`,...(B=(F=n.parameters)==null?void 0:F.docs)==null?void 0:B.source}}};var w,S,q;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    return <div style={{
      height: '100vh',
      position: 'relative'
    }}>\r
        <p style={{
        padding: '20px'
      }}>Float button group</p>\r
        <FloatButton.Group trigger="hover" style={{
        right: 24
      }}>\r
          <FloatButton />\r
          <FloatButton />\r
          <FloatButton />\r
        </FloatButton.Group>\r
      </div>;
  }
}`,...(q=(S=p.parameters)==null?void 0:S.docs)==null?void 0:q.source}}};const mt=["Basic","Shapes","Types","WithDescription","WithBadge","Group"];export{o as Basic,p as Group,r as Shapes,i as Types,n as WithBadge,s as WithDescription,mt as __namedExportsOrder,ut as default};
