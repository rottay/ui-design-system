import{j as e}from"./iframe-Dz2LC5nm.js";import{T as r}from"./index-COuO7qNq.js";import{S as a}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./DownOutlined-DLjCd-2z.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./BaseInput-j0EJArUA.js";import"./isMobile-DjGTsQxe.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./useVariants-CQySXX5A.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";const ae={title:"Inputs/InputNumber",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Campo de entrada numérica con controles para incrementar y decrementar valores.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/input-number)
- [🎨 API de Props](https://ant.design/components/input-number#api)
- [💡 Ejemplos](https://ant.design/components/input-number#examples)

## Cuándo usar

- Cuando necesitas entrada de valores numéricos con validación
- Para cantidades, precios, o cualquier dato que requiera precisión numérica
- Cuando quieres limitar valores dentro de un rango específico
        `}}},argTypes:{size:{control:"select",options:["small","middle","large"]},disabled:{control:"boolean"},min:{control:"number"},max:{control:"number"},step:{control:"number"}}},t={args:{defaultValue:3,style:{width:200}}},s={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsx(r,{size:"small",defaultValue:3,style:{width:200}}),e.jsx(r,{size:"middle",defaultValue:3,style:{width:200}}),e.jsx(r,{size:"large",defaultValue:3,style:{width:200}})]})},i={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Min: 1, Max: 10"}),e.jsx(r,{min:1,max:10,defaultValue:3,style:{width:200,marginLeft:16}})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Min: 0, Max: 100"}),e.jsx(r,{min:0,max:100,defaultValue:50,style:{width:200,marginLeft:16}})]})]})},d={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Step: 0.1"}),e.jsx(r,{step:.1,defaultValue:1.5,style:{width:200,marginLeft:16}})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Step: 10"}),e.jsx(r,{step:10,defaultValue:100,style:{width:200,marginLeft:16}})]})]})},o={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Currency:"}),e.jsx(r,{defaultValue:1e3,formatter:n=>`$ ${n}`.replace(/\B(?=(\d{3})+(?!\d))/g,","),parser:n=>n==null?void 0:n.replace(/\$\s?|(,*)/g,""),style:{width:200,marginLeft:16}})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Percentage:"}),e.jsx(r,{defaultValue:100,min:0,max:100,formatter:n=>`${n}%`,parser:n=>n==null?void 0:n.replace("%",""),style:{width:200,marginLeft:16}})]})]})},l={args:{disabled:!0,defaultValue:3,style:{width:200}}},c={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsx(r,{defaultValue:3,controls:!0,style:{width:200}}),e.jsx(r,{defaultValue:3,controls:!1,style:{width:200}})]})},p={render:()=>e.jsxs(a,{direction:"vertical",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Precision: 2"}),e.jsx(r,{defaultValue:1.5,precision:2,step:.01,style:{width:200,marginLeft:16}})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Precision: 0 (integers only)"}),e.jsx(r,{defaultValue:5,precision:0,style:{width:200,marginLeft:16}})]})]})};var u,m,f;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    defaultValue: 3,
    style: {
      width: 200
    }
  }
}`,...(f=(m=t.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var h,x,g;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <InputNumber size="small" defaultValue={3} style={{
      width: 200
    }} />\r
      <InputNumber size="middle" defaultValue={3} style={{
      width: 200
    }} />\r
      <InputNumber size="large" defaultValue={3} style={{
      width: 200
    }} />\r
    </Space>
}`,...(g=(x=s.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var v,y,j;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <div>\r
        <span>Min: 1, Max: 10</span>\r
        <InputNumber min={1} max={10} defaultValue={3} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
      <div>\r
        <span>Min: 0, Max: 100</span>\r
        <InputNumber min={0} max={100} defaultValue={50} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
    </Space>
}`,...(j=(y=i.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var w,S,V;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <div>\r
        <span>Step: 0.1</span>\r
        <InputNumber step={0.1} defaultValue={1.5} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
      <div>\r
        <span>Step: 10</span>\r
        <InputNumber step={10} defaultValue={100} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
    </Space>
}`,...(V=(S=d.parameters)==null?void 0:S.docs)==null?void 0:V.source}}};var b,I,L;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <div>\r
        <span>Currency:</span>\r
        <InputNumber defaultValue={1000} formatter={value => \`$ \${value}\`.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')} parser={value => value?.replace(/\\$\\s?|(,*)/g, '') as any} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
      <div>\r
        <span>Percentage:</span>\r
        <InputNumber defaultValue={100} min={0} max={100} formatter={value => \`\${value}%\`} parser={value => value?.replace('%', '') as any} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
    </Space>
}`,...(L=(I=o.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var N,M,P;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 3,
    style: {
      width: 200
    }
  }
}`,...(P=(M=l.parameters)==null?void 0:M.docs)==null?void 0:P.source}}};var z,C,$;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <InputNumber defaultValue={3} controls style={{
      width: 200
    }} />\r
      <InputNumber defaultValue={3} controls={false} style={{
      width: 200
    }} />\r
    </Space>
}`,...($=(C=c.parameters)==null?void 0:C.docs)==null?void 0:$.source}}};var D,q,B;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <div>\r
        <span>Precision: 2</span>\r
        <InputNumber defaultValue={1.5} precision={2} step={0.01} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
      <div>\r
        <span>Precision: 0 (integers only)</span>\r
        <InputNumber defaultValue={5} precision={0} style={{
        width: 200,
        marginLeft: 16
      }} />\r
      </div>\r
    </Space>
}`,...(B=(q=p.parameters)==null?void 0:q.docs)==null?void 0:B.source}}};const te=["Basic","Sizes","MinMax","Step","Formatter","Disabled","Controls","Precision"];export{t as Basic,c as Controls,l as Disabled,o as Formatter,i as MinMax,p as Precision,s as Sizes,d as Step,te as __namedExportsOrder,ae as default};
