import{r as a,C as ie,c as pe,j as i}from"./iframe-Dz2LC5nm.js";import{o as W}from"./omit-DXgDXInf.js";import{g as le}from"./PurePanel-CuHF6Qyt.js";import{S as C}from"./index-giBHWRYY.js";import{t as ne}from"./toArray-CcRQ9JCW.js";import{u as ce}from"./useZIndex-Dv1QJmGl.js";import{S as $}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useMergedState-DIkF75NH.js";import"./useShowArrow-CzgaiXTk.js";import"./isMobile-DjGTsQxe.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./Overflow-DfKHW_HQ.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./shadow-smhd3i8u.js";import"./useId-Cbrt0Rk4.js";import"./isVisible-DhUEo0yb.js";import"./List-0KMFp5pO.js";import"./compact-item-BQH2bmb8.js";import"./genStyleUtils-BYYxHtb1.js";import"./move-DcXnB1RZ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./AntdIcon-Bjoc2A0G.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./LoadingOutlined-BrYRsAZK.js";import"./SearchOutlined-DEJcv9Lk.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./motion-Ct_bxEw8.js";import"./useVariants-CQySXX5A.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";import"./useLocale-i3AsUBCw.js";import"./useCSSVarCls-BbjthPCx.js";const{Option:A}=C;function j(e){return(e==null?void 0:e.type)&&(e.type.isSelectOption||e.type.isSelectOptGroup)}const de=(e,r)=>{var s,O;const{prefixCls:F,className:G,popupClassName:J,dropdownClassName:X,children:y,dataSource:w,dropdownStyle:Y,dropdownRender:Z,popupRender:H,onDropdownVisibleChange:K,onOpenChange:Q,styles:p,classNames:l}=e,n=ne(y),d=((s=p==null?void 0:p.popup)===null||s===void 0?void 0:s.root)||Y,ee=((O=l==null?void 0:l.popup)===null||O===void 0?void 0:O.root)||J||X,oe=H||Z,te=Q||K;let S;n.length===1&&a.isValidElement(n[0])&&!j(n[0])&&([S]=n);const re=S?()=>S:void 0;let f;n.length&&j(n[0])?f=y:f=w?w.map(o=>{if(a.isValidElement(o))return o;switch(typeof o){case"string":return a.createElement(A,{key:o,value:o},o);case"object":{const{value:b}=o;return a.createElement(A,{key:b,value:b},o.text)}default:return}}):[];const{getPrefixCls:se}=a.useContext(ie),x=se("select",F),[ae]=ce("SelectLike",d==null?void 0:d.zIndex);return a.createElement(C,Object.assign({ref:r,suffixIcon:null},W(e,["dataSource","dropdownClassName","popupClassName"]),{prefixCls:x,classNames:{popup:{root:ee},root:l==null?void 0:l.root},styles:{popup:{root:Object.assign(Object.assign({},d),{zIndex:ae})},root:p==null?void 0:p.root},className:pe(`${x}-auto-complete`,G),mode:C.SECRET_COMBOBOX_MODE_DO_NOT_USE,popupRender:oe,onOpenChange:te,getInputElement:re}),f)},q=a.forwardRef(de),{Option:ue}=C,me=le(q,"dropdownAlign",e=>W(e,["visible"])),t=q;t.Option=ue;t._InternalPanelDoNotUseOrYouWillBeFired=me;const po={title:"Inputs/AutoComplete",component:t,tags:["autodocs"],parameters:{docs:{description:{component:`
Campo de autocompletado que sugiere opciones mientras el usuario escribe.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/auto-complete)
- [🎨 API de Props](https://ant.design/components/auto-complete#api)
- [💡 Ejemplos](https://ant.design/components/auto-complete#examples)

## Cuándo usar

- Cuando necesitas sugerencias automáticas basadas en la entrada del usuario
- Para mejorar la experiencia de búsqueda con resultados predictivos
- Cuando quieres reducir el esfuerzo de escritura del usuario
        `}}},argTypes:{size:{control:"select",options:["small","middle","large"]},disabled:{control:"boolean"},placeholder:{control:"text"}}},c=[{value:"Burns Bay Road"},{value:"Downing Street"},{value:"Wall Street"},{value:"Main Street"},{value:"Park Avenue"}],u={args:{options:c,placeholder:"Type to search...",style:{width:200}}},m={render:()=>i.jsx($,{direction:"vertical",style:{width:"100%"},children:i.jsx(t,{options:c,placeholder:"Search street",filterOption:(e,r)=>(r==null?void 0:r.value.toUpperCase().indexOf(e.toUpperCase()))!==-1,style:{width:300}})})},h={render:()=>{const e=[{value:"React"},{value:"TypeScript"},{value:"JavaScript"},{value:"Vue"},{value:"Angular"}];return i.jsx(t,{options:e,placeholder:"Search framework...",filterOption:(r,s)=>(s==null?void 0:s.value.toLowerCase().includes(r.toLowerCase()))??!1,style:{width:250}})}},v={render:()=>i.jsxs($,{direction:"vertical",style:{width:"100%"},children:[i.jsx(t,{size:"small",options:c,placeholder:"Small",style:{width:200}}),i.jsx(t,{size:"middle",options:c,placeholder:"Middle (default)",style:{width:200}}),i.jsx(t,{size:"large",options:c,placeholder:"Large",style:{width:200}})]})},g={args:{options:c,placeholder:"Disabled",disabled:!0,style:{width:200}}};var z,E,N;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    options: mockOptions,
    placeholder: 'Type to search...',
    style: {
      width: 200
    }
  }
}`,...(N=(E=u.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};var P,k,D;m.parameters={...m.parameters,docs:{...(P=m.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <AutoComplete options={mockOptions} placeholder="Search street" filterOption={(inputValue, option) => option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} style={{
        width: 300
      }} />\r
      </Space>;
  }
}`,...(D=(k=m.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var R,V,_;h.parameters={...h.parameters,docs:{...(R=h.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => {
    const options = [{
      value: 'React'
    }, {
      value: 'TypeScript'
    }, {
      value: 'JavaScript'
    }, {
      value: 'Vue'
    }, {
      value: 'Angular'
    }];
    return <AutoComplete options={options} placeholder="Search framework..." filterOption={(inputValue, option) => option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false} style={{
      width: 250
    }} />;
  }
}`,...(_=(V=h.parameters)==null?void 0:V.docs)==null?void 0:_.source}}};var I,B,L;v.parameters={...v.parameters,docs:{...(I=v.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <AutoComplete size="small" options={mockOptions} placeholder="Small" style={{
      width: 200
    }} />\r
      <AutoComplete size="middle" options={mockOptions} placeholder="Middle (default)" style={{
      width: 200
    }} />\r
      <AutoComplete size="large" options={mockOptions} placeholder="Large" style={{
      width: 200
    }} />\r
    </Space>
}`,...(L=(B=v.parameters)==null?void 0:B.docs)==null?void 0:L.source}}};var T,U,M;g.parameters={...g.parameters,docs:{...(T=g.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    options: mockOptions,
    placeholder: 'Disabled',
    disabled: true,
    style: {
      width: 200
    }
  }
}`,...(M=(U=g.parameters)==null?void 0:U.docs)==null?void 0:M.source}}};const lo=["Basic","WithOptions","CustomFilter","Sizes","Disabled"];export{u as Basic,h as CustomFilter,g as Disabled,v as Sizes,m as WithOptions,lo as __namedExportsOrder,po as default};
