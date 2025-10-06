import{j as e}from"./iframe-Dz2LC5nm.js";import{B as r}from"./Button-C1GbBzw5.js";import{S as t}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./button-D6Z5Xr5r.js";import"./omit-DXgDXInf.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useSize-oyF83k_j.js";import"./Compact-ObzKHgFl.js";import"./toArray-CcRQ9JCW.js";import"./presetColors-DLnX3ho6.js";import"./LoadingOutlined-BrYRsAZK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";const ce={title:"Navigation/Button",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de botón para disparar acciones y eventos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/button)
- [🎨 API de Props](https://ant.design/components/button#api)
- [💡 Ejemplos](https://ant.design/components/button#examples)

## Cuándo usar

- Un botón significa una operación (o una serie de operaciones). Al hacer clic en un botón, se activará la lógica empresarial correspondiente.
- Use botones primarios para acciones principales y secundarios para acciones menos importantes.

## Tipos de Botones

- **Primary**: Para la acción principal en una página o sección
- **Default**: Para acciones secundarias
- **Dashed**: Para acciones de agregar o crear
- **Text**: Para acciones de menor énfasis
- **Link**: Para navegación que se parece a enlaces
        `}}},argTypes:{type:{control:{type:"select"},options:["primary","default","dashed","text","link"],description:"Type of button"},size:{control:{type:"select"},options:["large","middle","small"],description:"Size of button"},shape:{control:{type:"select"},options:["default","circle","round"],description:"Shape of button"},disabled:{control:{type:"boolean"},description:"Disabled state of button"},loading:{control:{type:"boolean"},description:"Loading state of button"},danger:{control:{type:"boolean"},description:"Danger state of button"},block:{control:{type:"boolean"},description:"Option to fit button width to its parent width"},fullWidth:{control:{type:"boolean"},description:"Custom prop: Option to fit button width to 100%"},htmlType:{control:{type:"select"},options:["button","submit","reset"],description:"HTML button type"},onClick:{action:"clicked",description:"Callback when button is clicked"}}},n={args:{children:"Button"}},a={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{type:"primary",children:"Primary"}),e.jsx(r,{children:"Default"}),e.jsx(r,{type:"dashed",children:"Dashed"}),e.jsx(r,{type:"text",children:"Text"}),e.jsx(r,{type:"link",children:"Link"})]})},o={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{size:"large",type:"primary",children:"Large"}),e.jsx(r,{type:"primary",children:"Default"}),e.jsx(r,{size:"small",type:"primary",children:"Small"})]})},i={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{type:"primary",disabled:!0,children:"Primary"}),e.jsx(r,{disabled:!0,children:"Default"}),e.jsx(r,{type:"dashed",disabled:!0,children:"Dashed"}),e.jsx(r,{type:"text",disabled:!0,children:"Text"}),e.jsx(r,{type:"link",disabled:!0,children:"Link"})]})},s={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{type:"primary",loading:!0,children:"Loading"}),e.jsx(r,{loading:!0,children:"Loading"}),e.jsx(r,{type:"primary",loading:!0,icon:e.jsx("div",{children:"📄"}),children:"Loading with icon"})]})},p={args:{fullWidth:!0,type:"primary",children:"Full Width Button"}},d={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{type:"primary",danger:!0,children:"Primary Danger"}),e.jsx(r,{danger:!0,children:"Default Danger"}),e.jsx(r,{type:"dashed",danger:!0,children:"Dashed Danger"}),e.jsx(r,{type:"text",danger:!0,children:"Text Danger"}),e.jsx(r,{type:"link",danger:!0,children:"Link Danger"})]})},c={render:()=>e.jsxs(t,{wrap:!0,children:[e.jsx(r,{type:"primary",children:"Default"}),e.jsx(r,{type:"primary",shape:"circle",children:"A"}),e.jsx(r,{type:"primary",shape:"round",children:"Round"})]})};var l,u,m;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    children: 'Button'
  }
}`,...(m=(u=n.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var y,h,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button type="primary">Primary</Button>\r
      <Button>Default</Button>\r
      <Button type="dashed">Dashed</Button>\r
      <Button type="text">Text</Button>\r
      <Button type="link">Link</Button>\r
    </Space>
}`,...(g=(h=a.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var B,x,b;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button size="large" type="primary">Large</Button>\r
      <Button type="primary">Default</Button>\r
      <Button size="small" type="primary">Small</Button>\r
    </Space>
}`,...(b=(x=o.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var D,j,f;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button type="primary" disabled>Primary</Button>\r
      <Button disabled>Default</Button>\r
      <Button type="dashed" disabled>Dashed</Button>\r
      <Button type="text" disabled>Text</Button>\r
      <Button type="link" disabled>Link</Button>\r
    </Space>
}`,...(f=(j=i.parameters)==null?void 0:j.docs)==null?void 0:f.source}}};var S,k,L;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button type="primary" loading>Loading</Button>\r
      <Button loading>Loading</Button>\r
      <Button type="primary" loading icon={<div>📄</div>}>Loading with icon</Button>\r
    </Space>
}`,...(L=(k=s.parameters)==null?void 0:k.docs)==null?void 0:L.source}}};var w,P,T;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    fullWidth: true,
    type: 'primary',
    children: 'Full Width Button'
  }
}`,...(T=(P=p.parameters)==null?void 0:P.docs)==null?void 0:T.source}}};var z,v,W;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button type="primary" danger>Primary Danger</Button>\r
      <Button danger>Default Danger</Button>\r
      <Button type="dashed" danger>Dashed Danger</Button>\r
      <Button type="text" danger>Text Danger</Button>\r
      <Button type="link" danger>Link Danger</Button>\r
    </Space>
}`,...(W=(v=d.parameters)==null?void 0:v.docs)==null?void 0:W.source}}};var A,C,F;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button type="primary">Default</Button>\r
      <Button type="primary" shape="circle">A</Button>\r
      <Button type="primary" shape="round">Round</Button>\r
    </Space>
}`,...(F=(C=c.parameters)==null?void 0:C.docs)==null?void 0:F.source}}};const le=["Basic","Types","Sizes","Disabled","Loading","FullWidth","Danger","Shapes"];export{n as Basic,d as Danger,i as Disabled,p as FullWidth,s as Loading,c as Shapes,o as Sizes,a as Types,le as __namedExportsOrder,ce as default};
