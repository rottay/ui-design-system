import{j as e}from"./iframe-Dz2LC5nm.js";import{a as r}from"./index-CXuNHkuM.js";import{S as a}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useMergedState-DIkF75NH.js";import"./KeyCode-HJ8jGXz0.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./shadow-smhd3i8u.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./omit-DXgDXInf.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./reactNode-B7JGm4rf.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";const ve={title:"Inputs/Slider",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Control deslizante para seleccionar valores o rangos numéricos mediante interacción visual.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/slider)
- [🎨 API de Props](https://ant.design/components/slider#api)
- [💡 Ejemplos](https://ant.design/components/slider#examples)

## Cuándo usar

- Para ajustar valores dentro de un rango continuo
- Cuando necesitas seleccionar rangos de valores (por ejemplo, filtros de precio)
- Para controles de volumen, brillo, u otras configuraciones graduales
        `}}},argTypes:{disabled:{control:"boolean"},vertical:{control:"boolean"},min:{control:"number"},max:{control:"number"},step:{control:"number"}}},s={args:{defaultValue:30}},o={args:{range:!0,defaultValue:[20,50]}},i={render:()=>{const t={0:"0°C",26:"26°C",37:"37°C",100:{style:{color:"#f50"},label:e.jsx("strong",{children:"100°C"})}};return e.jsxs(a,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{marks:t,defaultValue:37}),e.jsx(r,{marks:t,range:!0,defaultValue:[26,37]})]})}},l={render:()=>e.jsxs(a,{size:50,children:[e.jsx(r,{vertical:!0,defaultValue:30,style:{height:300}}),e.jsx(r,{vertical:!0,range:!0,defaultValue:[20,50],style:{height:300}})]})},n={render:()=>e.jsxs(a,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{disabled:!0,defaultValue:30}),e.jsx(r,{disabled:!0,range:!0,defaultValue:[20,50]})]})},d={render:()=>e.jsxs(a,{direction:"vertical",style:{width:"100%"},children:[e.jsxs("div",{children:[e.jsx("span",{children:"Step: 10"}),e.jsx(r,{defaultValue:30,step:10})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Step: null (continuous)"}),e.jsx(r,{defaultValue:30,step:null})]})]})},c={render:()=>e.jsxs(a,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{defaultValue:30,tooltip:{open:!0}}),e.jsx(r,{defaultValue:30,tooltip:{placement:"bottom"}})]})},p={render:()=>e.jsx(r,{defaultValue:30,tooltip:{formatter:t=>`${t}%`}})},u={render:()=>e.jsxs(a,{direction:"vertical",style:{width:"100%"},children:[e.jsxs("div",{children:[e.jsx("span",{children:"Min: 0, Max: 100"}),e.jsx(r,{min:0,max:100,defaultValue:50})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Min: -100, Max: 100"}),e.jsx(r,{min:-100,max:100,defaultValue:0})]})]})};var m,x,S;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    defaultValue: 30
  }
}`,...(S=(x=s.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var g,f,h;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    range: true,
    defaultValue: [20, 50]
  }
}`,...(h=(f=o.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var v,j,V;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const marks = {
      0: '0°C',
      26: '26°C',
      37: '37°C',
      100: {
        style: {
          color: '#f50'
        },
        label: <strong>100°C</strong>
      }
    };
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Slider marks={marks} defaultValue={37} />\r
        <Slider marks={marks} range defaultValue={[26, 37]} />\r
      </Space>;
  }
}`,...(V=(j=i.parameters)==null?void 0:j.docs)==null?void 0:V.source}}};var y,b,M;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Space size={50}>\r
      <Slider vertical defaultValue={30} style={{
      height: 300
    }} />\r
      <Slider vertical range defaultValue={[20, 50]} style={{
      height: 300
    }} />\r
    </Space>
}`,...(M=(b=l.parameters)==null?void 0:b.docs)==null?void 0:M.source}}};var C,w,k;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Slider disabled defaultValue={30} />\r
      <Slider disabled range defaultValue={[20, 50]} />\r
    </Space>
}`,...(k=(w=n.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var D,T,P;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <div>\r
        <span>Step: 10</span>\r
        <Slider defaultValue={30} step={10} />\r
      </div>\r
      <div>\r
        <span>Step: null (continuous)</span>\r
        <Slider defaultValue={30} step={null as any} />\r
      </div>\r
    </Space>
}`,...(P=(T=d.parameters)==null?void 0:T.docs)==null?void 0:P.source}}};var R,z,A;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Slider defaultValue={30} tooltip={{
      open: true
    }} />\r
      <Slider defaultValue={30} tooltip={{
      placement: 'bottom'
    }} />\r
    </Space>
}`,...(A=(z=c.parameters)==null?void 0:z.docs)==null?void 0:A.source}}};var E,B,I;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <Slider defaultValue={30} tooltip={{
    formatter: value => \`\${value}%\`
  }} />
}`,...(I=(B=p.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var W,_,$;u.parameters={...u.parameters,docs:{...(W=u.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <div>\r
        <span>Min: 0, Max: 100</span>\r
        <Slider min={0} max={100} defaultValue={50} />\r
      </div>\r
      <div>\r
        <span>Min: -100, Max: 100</span>\r
        <Slider min={-100} max={100} defaultValue={0} />\r
      </div>\r
    </Space>
}`,...($=(_=u.parameters)==null?void 0:_.docs)==null?void 0:$.source}}};const je=["Basic","Range","Marks","Vertical","Disabled","Step","WithTooltip","CustomTooltip","MinMax"];export{s as Basic,p as CustomTooltip,n as Disabled,i as Marks,u as MinMax,o as Range,d as Step,l as Vertical,c as WithTooltip,je as __namedExportsOrder,ve as default};
