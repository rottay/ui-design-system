import{j as e,r as W}from"./iframe-Dz2LC5nm.js";import{S as r}from"./index-ORKdBOW3.js";import{S as s}from"./index-_UlGzK8j.js";import{R as y}from"./CloseOutlined-Uef9iQNA.js";import{R as A}from"./CheckOutlined-BbyNuZCI.js";import"./preload-helper-C1FmrZbK.js";import"./LoadingOutlined-BrYRsAZK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./useMergedState-DIkF75NH.js";import"./KeyCode-HJ8jGXz0.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useSize-oyF83k_j.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";const re={title:"Inputs/Switch",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de interruptor para alternar entre dos estados.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/switch)
- [🎨 API de Props](https://ant.design/components/switch#api)
- [💡 Ejemplos](https://ant.design/components/switch#examples)

## Cuándo usar

- Para cambiar entre dos estados opuestos (on/off, yes/no).
- Soporta diferentes tamaños, estados de carga y textos personalizados.
        `}}},argTypes:{size:{control:"select",options:["small","default"]},disabled:{control:"boolean"},loading:{control:"boolean"}}},a={args:{defaultChecked:!0}},c={render:()=>e.jsxs(s,{children:[e.jsx(r,{size:"small",defaultChecked:!0}),e.jsx(r,{defaultChecked:!0})]})},o={render:()=>e.jsxs(s,{children:[e.jsx(r,{loading:!0,defaultChecked:!0}),e.jsx(r,{loading:!0,size:"small"})]})},n={render:()=>e.jsxs(s,{children:[e.jsx(r,{disabled:!0}),e.jsx(r,{disabled:!0,defaultChecked:!0})]})},d={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{checkedChildren:"On",unCheckedChildren:"Off",defaultChecked:!0}),e.jsx(r,{checkedChildren:e.jsx(A,{}),unCheckedChildren:e.jsx(y,{}),defaultChecked:!0})]})},i={render:()=>{const[t,h]=W.useState(!1);return e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{checked:t,onChange:h}),e.jsxs("span",{children:["Switch is ",t?"ON":"OFF"]})]})}},l={render:()=>{const t=h=>{console.log("Switch changed to:",h)};return e.jsx(r,{defaultChecked:!0,onChange:t,checkedChildren:"Yes",unCheckedChildren:"No"})}};var p,u,m;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...(m=(u=a.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var C,S,k;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Switch size="small" defaultChecked />\r
      <Switch defaultChecked />\r
    </Space>
}`,...(k=(S=c.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var g,f,x;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Switch loading defaultChecked />\r
      <Switch loading size="small" />\r
    </Space>
}`,...(x=(f=o.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var j,w,O;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Switch disabled />\r
      <Switch disabled defaultChecked />\r
    </Space>
}`,...(O=(w=n.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};var b,z,R;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />\r
      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} defaultChecked />\r
    </Space>
}`,...(R=(z=d.parameters)==null?void 0:z.docs)==null?void 0:R.source}}};var D,v,E;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Space direction="vertical">\r
        <Switch checked={checked} onChange={setChecked} />\r
        <span>Switch is {checked ? 'ON' : 'OFF'}</span>\r
      </Space>;
  }
}`,...(E=(v=i.parameters)==null?void 0:v.docs)==null?void 0:E.source}}};var F,I,N;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => {
    const onChange = (checked: boolean) => {
      console.log('Switch changed to:', checked);
    };
    return <Switch defaultChecked onChange={onChange} checkedChildren="Yes" unCheckedChildren="No" />;
  }
}`,...(N=(I=l.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};const se=["Basic","Sizes","Loading","Disabled","WithText","Controlled","WithOnChange"];export{a as Basic,i as Controlled,n as Disabled,o as Loading,c as Sizes,l as WithOnChange,d as WithText,se as __namedExportsOrder,re as default};
