import{j as e}from"./iframe-Dz2LC5nm.js";import{S as o}from"./index-giBHWRYY.js";import{S as H}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useShowArrow-CzgaiXTk.js";import"./useMergedState-DIkF75NH.js";import"./isMobile-DjGTsQxe.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./Overflow-DfKHW_HQ.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./shadow-smhd3i8u.js";import"./useId-Cbrt0Rk4.js";import"./isVisible-DhUEo0yb.js";import"./omit-DXgDXInf.js";import"./List-0KMFp5pO.js";import"./compact-item-BQH2bmb8.js";import"./genStyleUtils-BYYxHtb1.js";import"./move-DcXnB1RZ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./AntdIcon-Bjoc2A0G.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./LoadingOutlined-BrYRsAZK.js";import"./SearchOutlined-DEJcv9Lk.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./PurePanel-CuHF6Qyt.js";import"./useVariants-CQySXX5A.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";import"./useLocale-i3AsUBCw.js";import"./useCSSVarCls-BbjthPCx.js";const Ge={title:"Inputs/Select",component:o,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de selección para elegir opciones de una lista desplegable.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/select)
- [🎨 API de Props](https://ant.design/components/select#api)
- [💡 Ejemplos](https://ant.design/components/select#examples)

## Cuándo usar

- Para seleccionar una o múltiples opciones de una lista.
- Soporta búsqueda, múltiple selección, grupos y tags personalizados.
        `}}},argTypes:{size:{control:"select",options:["small","middle","large"]},disabled:{control:"boolean"},loading:{control:"boolean"},mode:{control:"select",options:["multiple","tags"]}}},r=[{value:"jack",label:"Jack"},{value:"lucy",label:"Lucy"},{value:"tom",label:"Tom"},{value:"jerry",label:"Jerry"}],t={args:{options:r,placeholder:"Select a person",style:{width:200}}},s={args:{mode:"multiple",options:r,placeholder:"Select multiple",style:{width:"100%",minWidth:300},maxTagCount:"responsive"}},a={render:()=>e.jsx(o,{showSearch:!0,options:r,placeholder:"Search to select",style:{width:200},filterOption:(u,h)=>((h==null?void 0:h.label)??"").toString().toLowerCase().includes(u.toLowerCase())})},l={args:{mode:"tags",placeholder:"Type to add tags",style:{width:"100%",minWidth:300}}},i={render:()=>e.jsx(o,{placeholder:"Select with option groups",style:{width:200},options:[{label:"Manager",options:[{label:"Jack",value:"jack"},{label:"Lucy",value:"lucy"}]},{label:"Engineer",options:[{label:"Tom",value:"tom"},{label:"Jerry",value:"jerry"}]}]})},p={args:{options:r,loading:!0,placeholder:"Loading...",style:{width:200}}},n={render:()=>e.jsxs(H,{direction:"vertical",style:{width:"100%"},children:[e.jsx(o,{size:"small",options:r,placeholder:"Small",style:{width:200}}),e.jsx(o,{size:"middle",options:r,placeholder:"Middle (default)",style:{width:200}}),e.jsx(o,{size:"large",options:r,placeholder:"Large",style:{width:200}})]})},d={render:()=>e.jsxs(H,{direction:"vertical",style:{width:"100%"},children:[e.jsx(o,{options:r,disabled:!0,placeholder:"Disabled",style:{width:200}}),e.jsx(o,{options:r,defaultValue:"lucy",disabled:!0,style:{width:200}})]})},c={args:{options:r,allowClear:!0,placeholder:"Select with clear",style:{width:200}}},m={render:()=>e.jsx(o,{options:r,placeholder:"Custom dropdown render",style:{width:200},dropdownRender:u=>e.jsxs("div",{children:[u,e.jsx("div",{style:{padding:"8px",borderTop:"1px solid #f0f0f0"},children:e.jsx("a",{href:"#",style:{color:"#1677ff"},children:"Add new item"})})]})})};var g,w,y;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    options,
    placeholder: 'Select a person',
    style: {
      width: 200
    }
  }
}`,...(y=(w=t.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var S,b,v;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    mode: 'multiple',
    options,
    placeholder: 'Select multiple',
    style: {
      width: '100%',
      minWidth: 300
    },
    maxTagCount: 'responsive'
  }
}`,...(v=(b=s.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var x,f,j;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Select showSearch options={options} placeholder="Search to select" style={{
    width: 200
  }} filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())} />
}`,...(j=(f=a.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var C,L,T;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    mode: 'tags',
    placeholder: 'Type to add tags',
    style: {
      width: '100%',
      minWidth: 300
    }
  }
}`,...(T=(L=l.parameters)==null?void 0:L.docs)==null?void 0:T.source}}};var z,D,A;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <Select placeholder="Select with option groups" style={{
    width: 200
  }} options={[{
    label: 'Manager',
    options: [{
      label: 'Jack',
      value: 'jack'
    }, {
      label: 'Lucy',
      value: 'lucy'
    }]
  }, {
    label: 'Engineer',
    options: [{
      label: 'Tom',
      value: 'tom'
    }, {
      label: 'Jerry',
      value: 'jerry'
    }]
  }]} />
}`,...(A=(D=i.parameters)==null?void 0:D.docs)==null?void 0:A.source}}};var k,J,M;p.parameters={...p.parameters,docs:{...(k=p.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    options,
    loading: true,
    placeholder: 'Loading...',
    style: {
      width: 200
    }
  }
}`,...(M=(J=p.parameters)==null?void 0:J.docs)==null?void 0:M.source}}};var E,R,W;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Select size="small" options={options} placeholder="Small" style={{
      width: 200
    }} />\r
      <Select size="middle" options={options} placeholder="Middle (default)" style={{
      width: 200
    }} />\r
      <Select size="large" options={options} placeholder="Large" style={{
      width: 200
    }} />\r
    </Space>
}`,...(W=(R=n.parameters)==null?void 0:R.docs)==null?void 0:W.source}}};var O,P,B;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Select options={options} disabled placeholder="Disabled" style={{
      width: 200
    }} />\r
      <Select options={options} defaultValue="lucy" disabled style={{
      width: 200
    }} />\r
    </Space>
}`,...(B=(P=d.parameters)==null?void 0:P.docs)==null?void 0:B.source}}};var G,I,V;c.parameters={...c.parameters,docs:{...(G=c.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    options,
    allowClear: true,
    placeholder: 'Select with clear',
    style: {
      width: 200
    }
  }
}`,...(V=(I=c.parameters)==null?void 0:I.docs)==null?void 0:V.source}}};var _,q,F;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <Select options={options} placeholder="Custom dropdown render" style={{
    width: 200
  }} dropdownRender={menu => <div>\r
          {menu}\r
          <div style={{
      padding: '8px',
      borderTop: '1px solid #f0f0f0'
    }}>\r
            <a href="#" style={{
        color: '#1677ff'
      }}>\r
              Add new item\r
            </a>\r
          </div>\r
        </div>} />
}`,...(F=(q=m.parameters)==null?void 0:q.docs)==null?void 0:F.source}}};const Ie=["Basic","Multiple","Searchable","Tags","Groups","Loading","Sizes","Disabled","AllowClear","CustomDropdown"];export{c as AllowClear,t as Basic,m as CustomDropdown,d as Disabled,i as Groups,p as Loading,s as Multiple,a as Searchable,n as Sizes,l as Tags,Ie as __namedExportsOrder,Ge as default};
