import{j as e}from"./iframe-Dz2LC5nm.js";import{P as C}from"./progress-DOdRphW3.js";import{S as b}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CheckOutlined-BbyNuZCI.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./omit-DXgDXInf.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./useMergedState-DIkF75NH.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./reactNode-B7JGm4rf.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";const r=f=>e.jsx(C,{...f});r.displayName="Progress";r.__docgenInfo={description:"",methods:[],displayName:"Progress",composes:["AntProgressProps"]};const ie={title:"Feedback/Progress",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de progreso para mostrar el estado actual de una operación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/progress)
- [🎨 API de Props](https://ant.design/components/progress#api)
- [💡 Ejemplos](https://ant.design/components/progress#examples)

## Cuándo usar

- Para mostrar el progreso de operaciones o tareas de larga duración.
- Disponible en formatos de línea, círculo y dashboard.
        `}}}},s={args:{percent:50}},t={render:()=>e.jsxs(b,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{percent:30}),e.jsx(r,{percent:50,status:"active"}),e.jsx(r,{percent:70,status:"exception"}),e.jsx(r,{percent:100})]})},o={args:{type:"circle",percent:75}},p={render:()=>e.jsxs(b,{size:"large",children:[e.jsx(r,{type:"circle",percent:75,width:80}),e.jsx(r,{type:"circle",percent:100,width:100}),e.jsx(r,{type:"circle",percent:50,width:120,status:"exception"})]})},a={args:{type:"dashboard",percent:75}};var c,i,n;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    percent: 50
  }
}`,...(n=(i=s.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};var m,d,g;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Progress percent={30} />\r
      <Progress percent={50} status="active" />\r
      <Progress percent={70} status="exception" />\r
      <Progress percent={100} />\r
    </Space>
}`,...(g=(d=t.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var l,u,h;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    type: 'circle',
    percent: 75
  }
}`,...(h=(u=o.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var x,P,y;p.parameters={...p.parameters,docs:{...(x=p.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Space size="large">\r
      <Progress type="circle" percent={75} width={80} />\r
      <Progress type="circle" percent={100} width={100} />\r
      <Progress type="circle" percent={50} width={120} status="exception" />\r
    </Space>
}`,...(y=(P=p.parameters)==null?void 0:P.docs)==null?void 0:y.source}}};var S,j,w;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    type: 'dashboard',
    percent: 75
  }
}`,...(w=(j=a.parameters)==null?void 0:j.docs)==null?void 0:w.source}}};const ne=["Line","LineStates","Circle","CircleSizes","Dashboard"];export{o as Circle,p as CircleSizes,a as Dashboard,s as Line,t as LineStates,ne as __namedExportsOrder,ie as default};
