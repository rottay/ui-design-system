import{j as e}from"./iframe-Dz2LC5nm.js";import{S as _}from"./index-DuulPivk.js";import{S as T}from"./index-_UlGzK8j.js";import{A as d}from"./index-BuhmEhxr.js";import"./preload-helper-C1FmrZbK.js";import"./index-CUWDS_la.js";import"./reactNode-B7JGm4rf.js";import"./Keyframes-DYCYu-A0.js";import"./genStyleUtils-BYYxHtb1.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./pickAttrs-C7BJ3CXo.js";const r=W=>e.jsx(_,{...W});r.displayName="Spin";r.__docgenInfo={description:"",methods:[],displayName:"Spin",composes:["AntSpinProps"]};const ee={title:"Feedback/Spin",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de carga para mostrar el estado de carga de una página o sección.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/spin)
- [🎨 API de Props](https://ant.design/components/spin#api)
- [💡 Ejemplos](https://ant.design/components/spin#examples)

## Cuándo usar

- Para indicar que una operación está en progreso.
- Puede envolver contenido o mostrarse de forma independiente.
        `}}},argTypes:{size:{control:"select",options:["small","default","large"]},spinning:{control:"boolean"}}},t={args:{}},s={render:()=>e.jsxs(T,{size:"large",children:[e.jsx(r,{size:"small"}),e.jsx(r,{}),e.jsx(r,{size:"large"})]})},n={render:()=>e.jsx("div",{style:{padding:24,background:"#f5f5f5"},children:e.jsx(r,{children:e.jsx(d,{message:"Alert message title",description:"Further details about the context of this alert.",type:"info"})})})},i={render:()=>e.jsx("div",{style:{padding:24,background:"#f5f5f5"},children:e.jsx(r,{tip:"Loading...",children:e.jsx(d,{message:"Alert message title",description:"Further details about the context of this alert.",type:"info"})})})},o={render:()=>e.jsx("div",{style:{padding:24,background:"#f5f5f5"},children:e.jsx(r,{spinning:!0,children:e.jsx(d,{message:"Alert message title",description:"Further details about the context of this alert.",type:"info"})})})},a={render:()=>e.jsx("div",{style:{padding:24,background:"#f5f5f5"},children:e.jsx(r,{spinning:!0,delay:500,children:e.jsx(d,{message:"Alert message title",description:"Further details about the context of this alert.",type:"info"})})})},p={render:()=>e.jsxs("div",{style:{height:400,position:"relative"},children:[e.jsx(r,{spinning:!0,fullscreen:!0}),e.jsxs("div",{style:{padding:50},children:[e.jsx("p",{children:"Some content here..."}),e.jsx("p",{children:"Some content here..."}),e.jsx("p",{children:"Some content here..."})]})]})};var c,l,m;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {}
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var g,u,h;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Space size="large">\r
      <Spin size="small" />\r
      <Spin />\r
      <Spin size="large" />\r
    </Space>
}`,...(h=(u=s.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var f,S,x;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 24,
    background: '#f5f5f5'
  }}>\r
      <Spin>\r
        <Alert message="Alert message title" description="Further details about the context of this alert." type="info" />\r
      </Spin>\r
    </div>
}`,...(x=(S=n.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var y,j,v;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 24,
    background: '#f5f5f5'
  }}>\r
      <Spin tip="Loading...">\r
        <Alert message="Alert message title" description="Further details about the context of this alert." type="info" />\r
      </Spin>\r
    </div>
}`,...(v=(j=i.parameters)==null?void 0:j.docs)==null?void 0:v.source}}};var b,A,F;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 24,
    background: '#f5f5f5'
  }}>\r
      <Spin spinning={true}>\r
        <Alert message="Alert message title" description="Further details about the context of this alert." type="info" />\r
      </Spin>\r
    </div>
}`,...(F=(A=o.parameters)==null?void 0:A.docs)==null?void 0:F.source}}};var k,z,D;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 24,
    background: '#f5f5f5'
  }}>\r
      <Spin spinning={true} delay={500}>\r
        <Alert message="Alert message title" description="Further details about the context of this alert." type="info" />\r
      </Spin>\r
    </div>
}`,...(D=(z=a.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var E,P,C;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div style={{
    height: 400,
    position: 'relative'
  }}>\r
      <Spin spinning={true} fullscreen />\r
      <div style={{
      padding: 50
    }}>\r
        <p>Some content here...</p>\r
        <p>Some content here...</p>\r
        <p>Some content here...</p>\r
      </div>\r
    </div>
}`,...(C=(P=p.parameters)==null?void 0:P.docs)==null?void 0:C.source}}};const re=["Basic","Sizes","WithContainer","WithTip","Embedded","Delay","FullScreen"];export{t as Basic,a as Delay,o as Embedded,p as FullScreen,s as Sizes,n as WithContainer,i as WithTip,re as __namedExportsOrder,ee as default};
