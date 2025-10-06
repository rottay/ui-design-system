import{r as c,j as e}from"./iframe-Dz2LC5nm.js";import{w as S}from"./index-DAr4GXfC.js";import{g as X}from"./PurePanel-CuHF6Qyt.js";import{D as Z}from"./index-Dv9s7dGv.js";import{u as $}from"./useVariants-CQySXX5A.js";import{S as s}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useMergedState-DIkF75NH.js";import"./isVisible-DhUEo0yb.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";import"./genStyleUtils-BYYxHtb1.js";import"./move-DcXnB1RZ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./slide-ewzjqjuQ.js";import"./roundedArrow-Dc2oY277.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./LoadingOutlined-BrYRsAZK.js";import"./SearchOutlined-DEJcv9Lk.js";import"./omit-DXgDXInf.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./Overflow-DfKHW_HQ.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./useZIndex-Dv1QJmGl.js";import"./useCSSVarCls-BbjthPCx.js";import"./button-D6Z5Xr5r.js";import"./index-BKBr2mfS.js";import"./reactNode-B7JGm4rf.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";var ee=function(t,m){var i={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&m.indexOf(o)<0&&(i[o]=t[o]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var a=0,o=Object.getOwnPropertySymbols(t);a<o.length;a++)m.indexOf(o[a])<0&&Object.prototype.propertyIsEnumerable.call(t,o[a])&&(i[o[a]]=t[o[a]]);return i};const{TimePicker:re,RangePicker:oe}=Z,te=c.forwardRef((t,m)=>c.createElement(oe,Object.assign({},t,{picker:"time",mode:void 0,ref:m}))),r=c.forwardRef((t,m)=>{var{addon:i,renderExtraFooter:o,variant:a,bordered:G}=t,J=ee(t,["addon","renderExtraFooter","variant","bordered"]);const[K]=$("timePicker",a,G),Q=c.useMemo(()=>{if(o)return o;if(i)return i},[i,o]);return c.createElement(re,Object.assign({},J,{mode:void 0,ref:m,renderExtraFooter:Q,variant:K}))}),q=X(r,"popupAlign",void 0,"picker");r._InternalPanelDoNotUseOrYouWillBeFired=q;r.RangePicker=te;r._InternalPanelDoNotUseOrYouWillBeFired=q;const ir={title:"Inputs/TimePicker",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Selector de tiempo que permite elegir horas y minutos de manera intuitiva.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/time-picker)
- [🎨 API de Props](https://ant.design/components/time-picker#api)
- [💡 Ejemplos](https://ant.design/components/time-picker#examples)

## Cuándo usar

- Para seleccionar horarios específicos en formularios
- Cuando necesitas entrada de tiempo con formato consistente
- Para programación de eventos, citas, o recordatorios
        `}}},argTypes:{disabled:{control:"boolean"},size:{control:"select",options:["small","middle","large"]},use12Hours:{control:"boolean"}}},n={args:{placeholder:"Select time"}},p={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{format:"HH:mm:ss",placeholder:"HH:mm:ss"}),e.jsx(r,{format:"HH:mm",placeholder:"HH:mm"}),e.jsx(r,{format:"mm:ss",placeholder:"mm:ss"})]})},l={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r.RangePicker,{}),e.jsx(r.RangePicker,{use12Hours:!0,format:"h:mm A"})]})},d={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{disabled:!0,placeholder:"Disabled"}),e.jsx(r.RangePicker,{disabled:!0})]})},u={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{use12Hours:!0,format:"h:mm A",placeholder:"12 hour format"}),e.jsx(r,{use12Hours:!0,format:"h:mm:ss A",placeholder:"12 hour with seconds"})]})},h={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{size:"small",placeholder:"Small"}),e.jsx(r,{size:"middle",placeholder:"Middle (default)"}),e.jsx(r,{size:"large",placeholder:"Large"})]})},f={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{defaultValue:S("12:08:23","HH:mm:ss")}),e.jsx(r.RangePicker,{defaultValue:[S("08:00","HH:mm"),S("18:00","HH:mm")]})]})},g={render:()=>e.jsxs(s,{direction:"vertical",children:[e.jsx(r,{hourStep:2,minuteStep:15,secondStep:10}),e.jsx(r,{hourStep:1,minuteStep:30,placeholder:"30 min intervals"})]})},P={args:{allowClear:!0,placeholder:"Select time",defaultValue:S("12:00","HH:mm")}};var H,k,j;n.parameters={...n.parameters,docs:{...(H=n.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    placeholder: 'Select time'
  }
}`,...(j=(k=n.parameters)==null?void 0:k.docs)==null?void 0:j.source}}};var x,v,b;p.parameters={...p.parameters,docs:{...(x=p.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker format="HH:mm:ss" placeholder="HH:mm:ss" />\r
      <TimePicker format="HH:mm" placeholder="HH:mm" />\r
      <TimePicker format="mm:ss" placeholder="mm:ss" />\r
    </Space>
}`,...(b=(v=p.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var T,R,y;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker.RangePicker />\r
      <TimePicker.RangePicker use12Hours format="h:mm A" />\r
    </Space>
}`,...(y=(R=l.parameters)==null?void 0:R.docs)==null?void 0:y.source}}};var O,D,w;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker disabled placeholder="Disabled" />\r
      <TimePicker.RangePicker disabled />\r
    </Space>
}`,...(w=(D=d.parameters)==null?void 0:D.docs)==null?void 0:w.source}}};var A,E,V;u.parameters={...u.parameters,docs:{...(A=u.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker use12Hours format="h:mm A" placeholder="12 hour format" />\r
      <TimePicker use12Hours format="h:mm:ss A" placeholder="12 hour with seconds" />\r
    </Space>
}`,...(V=(E=u.parameters)==null?void 0:E.docs)==null?void 0:V.source}}};var z,F,I;h.parameters={...h.parameters,docs:{...(z=h.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker size="small" placeholder="Small" />\r
      <TimePicker size="middle" placeholder="Middle (default)" />\r
      <TimePicker size="large" placeholder="Large" />\r
    </Space>
}`,...(I=(F=h.parameters)==null?void 0:F.docs)==null?void 0:I.source}}};var C,_,B;f.parameters={...f.parameters,docs:{...(C=f.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker defaultValue={dayjs('12:08:23', 'HH:mm:ss')} />\r
      <TimePicker.RangePicker defaultValue={[dayjs('08:00', 'HH:mm'), dayjs('18:00', 'HH:mm')]} />\r
    </Space>
}`,...(B=(_=f.parameters)==null?void 0:_.docs)==null?void 0:B.source}}};var U,W,M;g.parameters={...g.parameters,docs:{...(U=g.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <TimePicker hourStep={2} minuteStep={15} secondStep={10} />\r
      <TimePicker hourStep={1} minuteStep={30} placeholder="30 min intervals" />\r
    </Space>
}`,...(M=(W=g.parameters)==null?void 0:W.docs)==null?void 0:M.source}}};var L,N,Y;P.parameters={...P.parameters,docs:{...(L=P.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    allowClear: true,
    placeholder: 'Select time',
    defaultValue: dayjs('12:00', 'HH:mm')
  }
}`,...(Y=(N=P.parameters)==null?void 0:N.docs)==null?void 0:Y.source}}};const sr=["Basic","Formats","RangePickerStory","Disabled","Use12Hours","Sizes","WithDefaultValue","HourStep","AllowClear"];export{P as AllowClear,n as Basic,d as Disabled,p as Formats,g as HourStep,l as RangePickerStory,h as Sizes,u as Use12Hours,f as WithDefaultValue,sr as __namedExportsOrder,ir as default};
