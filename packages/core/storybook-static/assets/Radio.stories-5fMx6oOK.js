import{j as e,r as k}from"./iframe-Dz2LC5nm.js";import{R as a}from"./index-Bp9XUfoE.js";import{S as n}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useId-Cbrt0Rk4.js";import"./useMergedState-DIkF75NH.js";import"./pickAttrs-C7BJ3CXo.js";import"./useCSSVarCls-BbjthPCx.js";import"./useSize-oyF83k_j.js";import"./useBubbleLock-CZY2ua_G.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./context-DwFXXsmv.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./useForm-CaVhMe50.js";import"./index-DKjRcP81.js";import"./Compact-ObzKHgFl.js";const ne={title:"Inputs/Radio",component:a,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de botón de radio para seleccionar una opción de varias.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/radio)
- [🎨 API de Props](https://ant.design/components/radio#api)
- [💡 Ejemplos](https://ant.design/components/radio#examples)

## Cuándo usar

- Para permitir al usuario seleccionar solo una opción de un conjunto.
- Incluye variantes de botones y grupos de radios.
        `}}},argTypes:{disabled:{control:"boolean"},checked:{control:"boolean"}}},o={args:{children:"Radio"}},r={render:()=>{const[s,c]=k.useState(1);return e.jsxs(a.Group,{onChange:M=>c(M.target.value),value:s,children:[e.jsx(a,{value:1,children:"A"}),e.jsx(a,{value:2,children:"B"}),e.jsx(a,{value:3,children:"C"}),e.jsx(a,{value:4,children:"D"})]})}},t={render:()=>e.jsx(a.Group,{defaultValue:1,children:e.jsxs(n,{direction:"vertical",children:[e.jsx(a,{value:1,children:"Option A"}),e.jsx(a,{value:2,children:"Option B"}),e.jsx(a,{value:3,children:"Option C"}),e.jsx(a,{value:4,children:"Option D"})]})})},i={render:()=>e.jsxs(n,{direction:"vertical",children:[e.jsxs(a.Group,{defaultValue:"a",children:[e.jsx(a.Button,{value:"a",children:"Hangzhou"}),e.jsx(a.Button,{value:"b",children:"Shanghai"}),e.jsx(a.Button,{value:"c",children:"Beijing"}),e.jsx(a.Button,{value:"d",children:"Chengdu"})]}),e.jsxs(a.Group,{defaultValue:"a",buttonStyle:"solid",children:[e.jsx(a.Button,{value:"a",children:"Hangzhou"}),e.jsx(a.Button,{value:"b",children:"Shanghai"}),e.jsx(a.Button,{value:"c",children:"Beijing"}),e.jsx(a.Button,{value:"d",children:"Chengdu"})]})]})},d={render:()=>e.jsxs(n,{direction:"vertical",children:[e.jsx(a,{disabled:!0,children:"Disabled"}),e.jsx(a,{disabled:!0,checked:!0,children:"Disabled and checked"}),e.jsxs(a.Group,{disabled:!0,defaultValue:1,children:[e.jsx(a,{value:1,children:"Option A"}),e.jsx(a,{value:2,children:"Option B"}),e.jsx(a,{value:3,children:"Option C"})]})]})},l={render:()=>e.jsxs(n,{direction:"vertical",children:[e.jsxs(a.Group,{defaultValue:"a",size:"small",children:[e.jsx(a.Button,{value:"a",children:"Small"}),e.jsx(a.Button,{value:"b",children:"Small"}),e.jsx(a.Button,{value:"c",children:"Small"})]}),e.jsxs(a.Group,{defaultValue:"a",size:"middle",children:[e.jsx(a.Button,{value:"a",children:"Middle"}),e.jsx(a.Button,{value:"b",children:"Middle"}),e.jsx(a.Button,{value:"c",children:"Middle"})]}),e.jsxs(a.Group,{defaultValue:"a",size:"large",children:[e.jsx(a.Button,{value:"a",children:"Large"}),e.jsx(a.Button,{value:"b",children:"Large"}),e.jsx(a.Button,{value:"c",children:"Large"})]})]})},u={render:()=>{const s=[{label:"Apple",value:"Apple"},{label:"Pear",value:"Pear"},{label:"Orange",value:"Orange"}],c=[{label:"Apple",value:"Apple"},{label:"Pear",value:"Pear"},{label:"Orange",value:"Orange",disabled:!0}];return e.jsxs(n,{direction:"vertical",children:[e.jsx(a.Group,{options:s,defaultValue:"Apple"}),e.jsx(a.Group,{options:c,defaultValue:"Apple"})]})}};var p,R,v;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: 'Radio'
  }
}`,...(v=(R=o.parameters)==null?void 0:R.docs)==null?void 0:v.source}}};var h,m,A;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState(1);
    return <AntRadio.Group onChange={e => setValue(e.target.value)} value={value}>\r
        <Radio value={1}>A</Radio>\r
        <Radio value={2}>B</Radio>\r
        <Radio value={3}>C</Radio>\r
        <Radio value={4}>D</Radio>\r
      </AntRadio.Group>;
  }
}`,...(A=(m=r.parameters)==null?void 0:m.docs)==null?void 0:A.source}}};var B,g,j;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <AntRadio.Group defaultValue={1}>\r
      <Space direction="vertical">\r
        <Radio value={1}>Option A</Radio>\r
        <Radio value={2}>Option B</Radio>\r
        <Radio value={3}>Option C</Radio>\r
        <Radio value={4}>Option D</Radio>\r
      </Space>\r
    </AntRadio.Group>
}`,...(j=(g=t.parameters)==null?void 0:g.docs)==null?void 0:j.source}}};var x,b,S;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <AntRadio.Group defaultValue="a">\r
        <AntRadio.Button value="a">Hangzhou</AntRadio.Button>\r
        <AntRadio.Button value="b">Shanghai</AntRadio.Button>\r
        <AntRadio.Button value="c">Beijing</AntRadio.Button>\r
        <AntRadio.Button value="d">Chengdu</AntRadio.Button>\r
      </AntRadio.Group>\r
      <AntRadio.Group defaultValue="a" buttonStyle="solid">\r
        <AntRadio.Button value="a">Hangzhou</AntRadio.Button>\r
        <AntRadio.Button value="b">Shanghai</AntRadio.Button>\r
        <AntRadio.Button value="c">Beijing</AntRadio.Button>\r
        <AntRadio.Button value="d">Chengdu</AntRadio.Button>\r
      </AntRadio.Group>\r
    </Space>
}`,...(S=(b=i.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var G,O,f;d.parameters={...d.parameters,docs:{...(G=d.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <Radio disabled>Disabled</Radio>\r
      <Radio disabled checked>\r
        Disabled and checked\r
      </Radio>\r
      <AntRadio.Group disabled defaultValue={1}>\r
        <Radio value={1}>Option A</Radio>\r
        <Radio value={2}>Option B</Radio>\r
        <Radio value={3}>Option C</Radio>\r
      </AntRadio.Group>\r
    </Space>
}`,...(f=(O=d.parameters)==null?void 0:O.docs)==null?void 0:f.source}}};var V,D,C;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <AntRadio.Group defaultValue="a" size="small">\r
        <AntRadio.Button value="a">Small</AntRadio.Button>\r
        <AntRadio.Button value="b">Small</AntRadio.Button>\r
        <AntRadio.Button value="c">Small</AntRadio.Button>\r
      </AntRadio.Group>\r
      <AntRadio.Group defaultValue="a" size="middle">\r
        <AntRadio.Button value="a">Middle</AntRadio.Button>\r
        <AntRadio.Button value="b">Middle</AntRadio.Button>\r
        <AntRadio.Button value="c">Middle</AntRadio.Button>\r
      </AntRadio.Group>\r
      <AntRadio.Group defaultValue="a" size="large">\r
        <AntRadio.Button value="a">Large</AntRadio.Button>\r
        <AntRadio.Button value="b">Large</AntRadio.Button>\r
        <AntRadio.Button value="c">Large</AntRadio.Button>\r
      </AntRadio.Group>\r
    </Space>
}`,...(C=(D=l.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};var z,P,L;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => {
    const options = [{
      label: 'Apple',
      value: 'Apple'
    }, {
      label: 'Pear',
      value: 'Pear'
    }, {
      label: 'Orange',
      value: 'Orange'
    }];
    const optionsWithDisabled = [{
      label: 'Apple',
      value: 'Apple'
    }, {
      label: 'Pear',
      value: 'Pear'
    }, {
      label: 'Orange',
      value: 'Orange',
      disabled: true
    }];
    return <Space direction="vertical">\r
        <AntRadio.Group options={options} defaultValue="Apple" />\r
        <AntRadio.Group options={optionsWithDisabled} defaultValue="Apple" />\r
      </Space>;
  }
}`,...(L=(P=u.parameters)==null?void 0:P.docs)==null?void 0:L.source}}};const oe=["Basic","RadioGroup","RadioGroupVertical","RadioButton","Disabled","Sizes","WithOptions"];export{o as Basic,d as Disabled,i as RadioButton,r as RadioGroup,t as RadioGroupVertical,l as Sizes,u as WithOptions,oe as __namedExportsOrder,ne as default};
