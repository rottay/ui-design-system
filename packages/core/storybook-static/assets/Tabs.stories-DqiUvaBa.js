import{j as t}from"./iframe-Dz2LC5nm.js";import{T as G}from"./index-BfB3k0in.js";import"./preload-helper-C1FmrZbK.js";import"./CloseOutlined-Uef9iQNA.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./PlusOutlined-ChoHNIra.js";import"./useMergedState-DIkF75NH.js";import"./isMobile-DjGTsQxe.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./Dropdown-ncGrBRcY.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./isVisible-DhUEo0yb.js";import"./KeyCode-HJ8jGXz0.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./omit-DXgDXInf.js";import"./useCSSVarCls-BbjthPCx.js";import"./useSize-oyF83k_j.js";import"./motion-Ct_bxEw8.js";import"./genStyleUtils-BYYxHtb1.js";import"./slide-ewzjqjuQ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";const a=N=>t.jsx(G,{...N});a.displayName="Tabs";a.__docgenInfo={description:"",methods:[],displayName:"Tabs",composes:["AntTabsProps"]};const fe={title:"Navigation/Tabs",component:a,tags:["autodocs"],parameters:{docs:{description:{component:`
Pestañas que organizan y permiten navegar entre grupos de contenido relacionado.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tabs)
- [🎨 API de Props](https://ant.design/components/tabs#api)
- [💡 Ejemplos](https://ant.design/components/tabs#examples)

## Cuándo usar

- Para organizar contenido en categorías o secciones relacionadas
- Cuando necesitas alternar entre diferentes vistas sin cambiar de página
- Para dashboards o interfaces con múltiples paneles de información
        `}}},argTypes:{type:{control:{type:"select"},options:["line","card","editable-card"],description:"Type of tabs",defaultValue:"line"},size:{control:{type:"select"},options:["large","middle","small"],description:"Size of tabs",defaultValue:"middle"},tabPosition:{control:{type:"select"},options:["top","right","bottom","left"],description:"Position of tabs",defaultValue:"top"},items:{control:{type:"object"},description:"Tab items"},activeKey:{control:{type:"text"},description:"Current active tab key"},defaultActiveKey:{control:{type:"text"},description:"Initial active tab key"},centered:{control:{type:"boolean"},description:"Center tabs"},animated:{control:{type:"boolean"},description:"Enable animation",defaultValue:!0},tabBarGutter:{control:{type:"number"},description:"Gap between tabs"},onChange:{action:"tab-changed",description:"Callback when tab is changed"},onTabClick:{action:"tab-clicked",description:"Callback when tab is clicked"}}},e=[{key:"1",label:"Tab 1",children:"Content of Tab Pane 1"},{key:"2",label:"Tab 2",children:"Content of Tab Pane 2"},{key:"3",label:"Tab 3",children:"Content of Tab Pane 3"}],o={args:{defaultActiveKey:"1",items:e}},r={args:{defaultActiveKey:"1",centered:!0,items:e}},s={args:{type:"card",defaultActiveKey:"1",items:e}},n={args:{type:"editable-card",defaultActiveKey:"1",items:e}},i={render:()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[t.jsx(a,{size:"large",items:e}),t.jsx(a,{size:"middle",items:e}),t.jsx(a,{size:"small",items:e})]})},c={render:()=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[t.jsx(a,{tabPosition:"top",items:e}),t.jsx(a,{tabPosition:"left",items:e,style:{height:220}}),t.jsx(a,{tabPosition:"right",items:e,style:{height:220}}),t.jsx(a,{tabPosition:"bottom",items:e})]})},l={args:{defaultActiveKey:"1",items:[{key:"1",label:"Tab 1",children:"Content of Tab 1"},{key:"2",label:"Tab 2",children:"Content of Tab 2",disabled:!0},{key:"3",label:"Tab 3",children:"Content of Tab 3"}]}},d={args:{defaultActiveKey:"1",items:[{key:"1",label:"Home",children:"Content of Home"},{key:"2",label:"Profile",children:"Content of Profile"},{key:"3",label:"Settings",children:"Content of Settings"}]}},m={args:{defaultActiveKey:"1",items:e,tabBarExtraContent:t.jsx("button",{children:"Extra Action"})}};var p,b,u;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    defaultActiveKey: '1',
    items: items
  }
}`,...(u=(b=o.parameters)==null?void 0:b.docs)==null?void 0:u.source}}};var y,f,g;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    defaultActiveKey: '1',
    centered: true,
    items: items
  }
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var h,x,T;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    type: 'card',
    defaultActiveKey: '1',
    items: items
  }
}`,...(T=(x=s.parameters)==null?void 0:x.docs)==null?void 0:T.source}}};var C,v,P;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    type: 'editable-card',
    defaultActiveKey: '1',
    items: items
  }
}`,...(P=(v=n.parameters)==null?void 0:v.docs)==null?void 0:P.source}}};var A,k,K;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  }}>\r
      <Tabs size="large" items={items} />\r
      <Tabs size="middle" items={items} />\r
      <Tabs size="small" items={items} />\r
    </div>
}`,...(K=(k=i.parameters)==null?void 0:k.docs)==null?void 0:K.source}}};var S,j,z;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  }}>\r
      <Tabs tabPosition="top" items={items} />\r
      <Tabs tabPosition="left" items={items} style={{
      height: 220
    }} />\r
      <Tabs tabPosition="right" items={items} style={{
      height: 220
    }} />\r
      <Tabs tabPosition="bottom" items={items} />\r
    </div>
}`,...(z=(j=c.parameters)==null?void 0:j.docs)==null?void 0:z.source}}};var E,D,B;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    defaultActiveKey: '1',
    items: [{
      key: '1',
      label: 'Tab 1',
      children: 'Content of Tab 1'
    }, {
      key: '2',
      label: 'Tab 2',
      children: 'Content of Tab 2',
      disabled: true
    }, {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab 3'
    }]
  }
}`,...(B=(D=l.parameters)==null?void 0:D.docs)==null?void 0:B.source}}};var I,H,V;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    defaultActiveKey: '1',
    items: [{
      key: '1',
      label: 'Home',
      children: 'Content of Home'
    }, {
      key: '2',
      label: 'Profile',
      children: 'Content of Profile'
    }, {
      key: '3',
      label: 'Settings',
      children: 'Content of Settings'
    }]
  }
}`,...(V=(H=d.parameters)==null?void 0:H.docs)==null?void 0:V.source}}};var W,_,w;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    defaultActiveKey: '1',
    items: items,
    tabBarExtraContent: <button>Extra Action</button>
  }
}`,...(w=(_=m.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};const ge=["Basic","Centered","Card","CardWithAddButton","Sizes","Position","Disabled","WithIcon","ExtraContent"];export{o as Basic,s as Card,n as CardWithAddButton,r as Centered,l as Disabled,m as ExtraContent,c as Position,i as Sizes,d as WithIcon,ge as __namedExportsOrder,fe as default};
