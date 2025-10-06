import{j as e,r as O}from"./iframe-Dz2LC5nm.js";import{S as R}from"./index-AJ3X-x4m.js";import"./preload-helper-C1FmrZbK.js";import"./useMergedState-DIkF75NH.js";import"./omit-DXgDXInf.js";import"./useId-Cbrt0Rk4.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";const s=a=>e.jsx(R,{...a});s.displayName="Segmented";s.__docgenInfo={description:"",methods:[],displayName:"Segmented",composes:["AntSegmentedProps"]};const F={title:"Navigation/Segmented",component:s,tags:["autodocs"],parameters:{docs:{description:{component:`
Control segmentado que permite seleccionar una opción entre múltiples alternativas.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/segmented)
- [🎨 API de Props](https://ant.design/components/segmented#api)
- [💡 Ejemplos](https://ant.design/components/segmented#examples)

## Cuándo usar

- Para alternar entre vistas o modos de visualización
- Cuando necesitas selección exclusiva entre pocas opciones
- Para filtros o categorías con opciones mutuamente excluyentes
        `}}},argTypes:{options:{control:{type:"object"},description:"Set options of segmented"},value:{control:{type:"text"},description:"Current selected value"},defaultValue:{control:{type:"text"},description:"Default selected value"},disabled:{control:{type:"boolean"},description:"Disable all segments"},block:{control:{type:"boolean"},description:"Option to fit width to its parent width"},size:{control:{type:"select"},options:["large","middle","small"],description:"Size of segmented",defaultValue:"middle"},onChange:{action:"changed",description:"Callback when value changes"}}},t={args:{options:["Daily","Weekly","Monthly","Quarterly","Yearly"]}},o={args:{options:["Daily","Weekly","Monthly"],defaultValue:"Weekly"}},r={args:{options:["Daily","Weekly","Monthly"],block:!0}},n={args:{options:["Daily","Weekly","Monthly"],disabled:!0}},l={args:{options:["Daily",{label:"Weekly",value:"Weekly",disabled:!0},"Monthly",{label:"Quarterly",value:"Quarterly",disabled:!0},"Yearly"]}},i={args:{options:[{label:"User 1",value:"user1"},{label:"User 2",value:"user2"},{label:"User 3",value:"user3"}]}},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(s,{size:"large",options:["Daily","Weekly","Monthly"]}),e.jsx(s,{options:["Daily","Weekly","Monthly"]}),e.jsx(s,{size:"small",options:["Daily","Weekly","Monthly"]})]})},p={render:()=>{const[a,E]=O.useState("Map");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(s,{options:["Map","Transit","Satellite"],value:a,onChange:E}),e.jsxs("div",{children:["Selected: ",a]})]})}};var d,u,m;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
  }
}`,...(m=(u=t.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var y,g,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    defaultValue: 'Weekly'
  }
}`,...(h=(g=o.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var v,b,x;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    block: true
  }
}`,...(x=(b=r.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var D,S,k;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    disabled: true
  }
}`,...(k=(S=n.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var f,W,M;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    options: ['Daily', {
      label: 'Weekly',
      value: 'Weekly',
      disabled: true
    }, 'Monthly', {
      label: 'Quarterly',
      value: 'Quarterly',
      disabled: true
    }, 'Yearly']
  }
}`,...(M=(W=l.parameters)==null?void 0:W.docs)==null?void 0:M.source}}};var j,C,z;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    options: [{
      label: 'User 1',
      value: 'user1'
    }, {
      label: 'User 2',
      value: 'user2'
    }, {
      label: 'User 3',
      value: 'user3'
    }]
  }
}`,...(z=(C=i.parameters)==null?void 0:C.docs)==null?void 0:z.source}}};var V,Q,U;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>\r
      <Segmented size="large" options={['Daily', 'Weekly', 'Monthly']} />\r
      <Segmented options={['Daily', 'Weekly', 'Monthly']} />\r
      <Segmented size="small" options={['Daily', 'Weekly', 'Monthly']} />\r
    </div>
}`,...(U=(Q=c.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var P,A,B;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | number>('Map');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>\r
        <Segmented options={['Map', 'Transit', 'Satellite']} value={value} onChange={setValue} />\r
        <div>Selected: {value}</div>\r
      </div>;
  }
}`,...(B=(A=p.parameters)==null?void 0:A.docs)==null?void 0:B.source}}};const G=["Basic","WithValue","Block","Disabled","DisabledOption","CustomRender","Sizes","Controlled"];export{t as Basic,r as Block,p as Controlled,i as CustomRender,n as Disabled,l as DisabledOption,c as Sizes,o as WithValue,G as __namedExportsOrder,F as default};
