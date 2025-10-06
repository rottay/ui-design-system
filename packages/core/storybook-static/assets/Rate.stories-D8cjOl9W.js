import{j as e,r as E}from"./iframe-Dz2LC5nm.js";import{R as P}from"./index-Cy4EY4Ds.js";import{S as H}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./useMergedState-DIkF75NH.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./omit-DXgDXInf.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./reactNode-B7JGm4rf.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";const r=a=>e.jsx(P,{...a});r.displayName="Rate";r.__docgenInfo={description:"",methods:[],displayName:"Rate",composes:["AntRateProps"]};const de={title:"Feedback/Rate",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de calificación para recopilar opiniones del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/rate)
- [🎨 API de Props](https://ant.design/components/rate#api)
- [💡 Ejemplos](https://ant.design/components/rate#examples)

## Cuándo usar

- Para evaluar productos, servicios o experiencias mediante estrellas.
- Soporta medias estrellas, iconos personalizados y tooltips.
        `}}},argTypes:{allowHalf:{control:"boolean"},allowClear:{control:"boolean"},disabled:{control:"boolean"},count:{control:"number"}}},o={args:{defaultValue:3}},t={args:{defaultValue:2.5,allowHalf:!0}},s={args:{defaultValue:3,allowClear:!0}},n={args:{defaultValue:2,disabled:!0}},l={render:()=>e.jsxs(H,{direction:"vertical",children:[e.jsx(r,{defaultValue:3,count:3}),e.jsx(r,{defaultValue:5,count:5}),e.jsx(r,{defaultValue:7,count:10})]})},c={render:()=>{const a=["terrible","bad","normal","good","wonderful"],[i,y]=E.useState(3);return e.jsxs(H,{children:[e.jsx(r,{tooltips:a,onChange:y,value:i}),i?e.jsx("span",{children:a[i-1]}):null]})}};var p,u,m;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    defaultValue: 3
  }
}`,...(m=(u=o.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var d,f,g;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    defaultValue: 2.5,
    allowHalf: true
  }
}`,...(g=(f=t.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var x,V,S;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    defaultValue: 3,
    allowClear: true
  }
}`,...(S=(V=s.parameters)==null?void 0:V.docs)==null?void 0:S.source}}};var b,C,R;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    defaultValue: 2,
    disabled: true
  }
}`,...(R=(C=n.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var w,h,j;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <Rate defaultValue={3} count={3} />\r
      <Rate defaultValue={5} count={5} />\r
      <Rate defaultValue={7} count={10} />\r
    </Space>
}`,...(j=(h=l.parameters)==null?void 0:h.docs)==null?void 0:j.source}}};var v,A,D;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
    const [value, setValue] = useState(3);
    return <Space>\r
        <Rate tooltips={desc} onChange={setValue} value={value} />\r
        {value ? <span>{desc[value - 1]}</span> : null}\r
      </Space>;
  }
}`,...(D=(A=c.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};const fe=["Basic","AllowHalf","AllowClear","Disabled","CustomCount","WithText"];export{s as AllowClear,t as AllowHalf,o as Basic,l as CustomCount,n as Disabled,c as WithText,fe as __namedExportsOrder,de as default};
