import{j as e}from"./iframe-Dz2LC5nm.js";import{w as t}from"./index-DAr4GXfC.js";import{D as r}from"./index-Dv9s7dGv.js";import{S as n}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useMergedState-DIkF75NH.js";import"./isVisible-DhUEo0yb.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";import"./genStyleUtils-BYYxHtb1.js";import"./move-DcXnB1RZ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./slide-ewzjqjuQ.js";import"./roundedArrow-Dc2oY277.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./LoadingOutlined-BrYRsAZK.js";import"./SearchOutlined-DEJcv9Lk.js";import"./PurePanel-CuHF6Qyt.js";import"./omit-DXgDXInf.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./Overflow-DfKHW_HQ.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./useZIndex-Dv1QJmGl.js";import"./useVariants-CQySXX5A.js";import"./useCSSVarCls-BbjthPCx.js";import"./button-D6Z5Xr5r.js";import"./index-BKBr2mfS.js";import"./reactNode-B7JGm4rf.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";const We={title:"Inputs/DatePicker",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente selector de fechas para elegir fechas y rangos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/date-picker)
- [🎨 API de Props](https://ant.design/components/date-picker#api)
- [💡 Ejemplos](https://ant.design/components/date-picker#examples)

## Cuándo usar

- Para seleccionar fechas, rangos de fechas o fechas con hora.
- Soporta diferentes formatos, presets y selectores de semana/mes/año.
        `}}},argTypes:{disabled:{control:"boolean"},size:{control:"select",options:["small","middle","large"]},showTime:{control:"boolean"}}},{RangePicker:a}=r,o={args:{placeholder:"Select date"}},s={render:()=>e.jsxs(n,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{}),e.jsx(a,{showTime:!0}),e.jsx(a,{picker:"week"}),e.jsx(a,{picker:"month"}),e.jsx(a,{picker:"quarter"}),e.jsx(a,{picker:"year"})]})},i={render:()=>e.jsxs(n,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{disabled:!0,placeholder:"Disabled"}),e.jsx(a,{disabled:!0})]})},c={args:{showTime:!0,placeholder:"Select date and time"}},p={render:()=>e.jsxs(n,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{format:"YYYY-MM-DD"}),e.jsx(r,{format:"YYYY/MM/DD"}),e.jsx(r,{format:"DD-MM-YYYY"}),e.jsx(r,{format:"YYYY-MM-DD HH:mm:ss",showTime:!0})]})},m={render:()=>e.jsxs(n,{direction:"vertical",style:{width:"100%"},children:[e.jsx(r,{size:"small",placeholder:"Small"}),e.jsx(r,{size:"middle",placeholder:"Middle"}),e.jsx(r,{size:"large",placeholder:"Large"})]})},d={render:()=>{const C=[{label:"Today",value:t()},{label:"Yesterday",value:t().add(-1,"d")},{label:"Last Week",value:t().add(-7,"d")},{label:"Last Month",value:t().add(-1,"month")}];return e.jsx(r,{presets:C})}};var l,h,u;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    placeholder: 'Select date'
  }
}`,...(u=(h=o.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var g,k,D;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <RangePicker />\r
      <RangePicker showTime />\r
      <RangePicker picker="week" />\r
      <RangePicker picker="month" />\r
      <RangePicker picker="quarter" />\r
      <RangePicker picker="year" />\r
    </Space>
}`,...(D=(k=s.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var Y,S,j;i.parameters={...i.parameters,docs:{...(Y=i.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <DatePicker disabled placeholder="Disabled" />\r
      <RangePicker disabled />\r
    </Space>
}`,...(j=(S=i.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var P,x,y;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    showTime: true,
    placeholder: 'Select date and time'
  }
}`,...(y=(x=c.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var f,w,M;p.parameters={...p.parameters,docs:{...(f=p.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <DatePicker format="YYYY-MM-DD" />\r
      <DatePicker format="YYYY/MM/DD" />\r
      <DatePicker format="DD-MM-YYYY" />\r
      <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime />\r
    </Space>
}`,...(M=(w=p.parameters)==null?void 0:w.docs)==null?void 0:M.source}}};var b,v,R;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <DatePicker size="small" placeholder="Small" />\r
      <DatePicker size="middle" placeholder="Middle" />\r
      <DatePicker size="large" placeholder="Large" />\r
    </Space>
}`,...(R=(v=m.parameters)==null?void 0:v.docs)==null?void 0:R.source}}};var T,z,L;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => {
    const presets = [{
      label: 'Today',
      value: dayjs()
    }, {
      label: 'Yesterday',
      value: dayjs().add(-1, 'd')
    }, {
      label: 'Last Week',
      value: dayjs().add(-7, 'd')
    }, {
      label: 'Last Month',
      value: dayjs().add(-1, 'month')
    }];
    return <DatePicker presets={presets} />;
  }
}`,...(L=(z=d.parameters)==null?void 0:z.docs)==null?void 0:L.source}}};const Ae=["Basic","RangePickerStory","Disabled","ShowTime","CustomFormat","Sizes","WithPresets"];export{o as Basic,p as CustomFormat,i as Disabled,s as RangePickerStory,c as ShowTime,m as Sizes,d as WithPresets,Ae as __namedExportsOrder,We as default};
