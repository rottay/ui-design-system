import{j as e}from"./iframe-Dz2LC5nm.js";import{C as b}from"./Collapse-zK5P7h_T.js";import{S as j}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./RightOutlined-BDL0sfNG.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./useMergedState-DIkF75NH.js";import"./toArray-CcRQ9JCW.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./omit-DXgDXInf.js";import"./motion-Ct_bxEw8.js";import"./reactNode-B7JGm4rf.js";import"./useSize-oyF83k_j.js";import"./collapse-BbEVqHco.js";import"./genStyleUtils-BYYxHtb1.js";import"./Compact-ObzKHgFl.js";const s=C=>e.jsx(b,{...C});s.displayName="Collapse";s.__docgenInfo={description:"",methods:[],displayName:"Collapse",composes:["AntCollapseProps"]};const J={title:"Display/Collapse",component:s,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de panel plegable para organizar contenido en secciones expandibles.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/collapse)
- [🎨 API de Props](https://ant.design/components/collapse#api)
- [💡 Ejemplos](https://ant.design/components/collapse#examples)

## Cuándo usar

- Para organizar grandes cantidades de contenido de forma compacta.
- Permite al usuario expandir y contraer secciones según necesidad.
        `}}},argTypes:{accordion:{control:"boolean"},bordered:{control:"boolean"},expandIconPosition:{control:"select",options:["start","end"]}}},o=[{key:"1",label:"This is panel header 1",children:e.jsx("p",{children:"Panel content 1"})},{key:"2",label:"This is panel header 2",children:e.jsx("p",{children:"Panel content 2"})},{key:"3",label:"This is panel header 3",children:e.jsx("p",{children:"Panel content 3"})}],r={args:{items:o,defaultActiveKey:["1"]}},t={args:{items:o,accordion:!0,defaultActiveKey:["1"]}},a={args:{items:o,bordered:!1,defaultActiveKey:["1"]}},n={render:()=>e.jsxs(j,{direction:"vertical",style:{width:"100%"},children:[e.jsx(s,{items:o,expandIconPosition:"start",defaultActiveKey:["1"]}),e.jsx(s,{items:o,expandIconPosition:"end",defaultActiveKey:["1"]})]})},i={args:{items:o,ghost:!0,defaultActiveKey:["1"]}};var c,p,d;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    items,
    defaultActiveKey: ['1']
  }
}`,...(d=(p=r.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var l,m,u;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    items,
    accordion: true,
    defaultActiveKey: ['1']
  }
}`,...(u=(m=t.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var g,h,y;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    items,
    bordered: false,
    defaultActiveKey: ['1']
  }
}`,...(y=(h=a.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var f,x,A;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Collapse items={items} expandIconPosition="start" defaultActiveKey={['1']} />\r
      <Collapse items={items} expandIconPosition="end" defaultActiveKey={['1']} />\r
    </Space>
}`,...(A=(x=n.parameters)==null?void 0:x.docs)==null?void 0:A.source}}};var P,v,K;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    items,
    ghost: true,
    defaultActiveKey: ['1']
  }
}`,...(K=(v=i.parameters)==null?void 0:v.docs)==null?void 0:K.source}}};const L=["Basic","Accordion","Borderless","ExpandIconPosition","Ghost"];export{t as Accordion,r as Basic,a as Borderless,n as ExpandIconPosition,i as Ghost,L as __namedExportsOrder,J as default};
