import{a as oe,u as l,r as o,C as k,c as $,G as ce,j as u}from"./iframe-Dz2LC5nm.js";import{u as de}from"./useCSSVarCls-BbjthPCx.js";import{g as me,m as ge}from"./genStyleUtils-BYYxHtb1.js";import{R as pe}from"./LoadingOutlined-BrYRsAZK.js";import{t as ue}from"./toArray-CcRQ9JCW.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";const he=e=>{const{componentCls:t,calc:i}=e;return{[t]:Object.assign(Object.assign({},oe(e)),{margin:0,padding:0,listStyle:"none",[`${t}-item`]:{position:"relative",margin:0,paddingBottom:e.itemPaddingBottom,fontSize:e.fontSize,listStyle:"none","&-tail":{position:"absolute",insetBlockStart:e.itemHeadSize,insetInlineStart:i(i(e.itemHeadSize).sub(e.tailWidth)).div(2).equal(),height:`calc(100% - ${l(e.itemHeadSize)})`,borderInlineStart:`${l(e.tailWidth)} ${e.lineType} ${e.tailColor}`},"&-pending":{[`${t}-item-head`]:{fontSize:e.fontSizeSM,backgroundColor:"transparent"},[`${t}-item-tail`]:{display:"none"}},"&-head":{position:"absolute",width:e.itemHeadSize,height:e.itemHeadSize,backgroundColor:e.dotBg,border:`${l(e.dotBorderWidth)} ${e.lineType} transparent`,borderRadius:"50%","&-blue":{color:e.colorPrimary,borderColor:e.colorPrimary},"&-red":{color:e.colorError,borderColor:e.colorError},"&-green":{color:e.colorSuccess,borderColor:e.colorSuccess},"&-gray":{color:e.colorTextDisabled,borderColor:e.colorTextDisabled}},"&-head-custom":{position:"absolute",insetBlockStart:i(e.itemHeadSize).div(2).equal(),insetInlineStart:i(e.itemHeadSize).div(2).equal(),width:"auto",height:"auto",marginBlockStart:0,paddingBlock:e.customHeadPaddingVertical,lineHeight:1,textAlign:"center",border:0,borderRadius:0,transform:"translate(-50%, -50%)"},"&-content":{position:"relative",insetBlockStart:i(i(e.fontSize).mul(e.lineHeight).sub(e.fontSize)).mul(-1).add(e.lineWidth).equal(),marginInlineStart:i(e.margin).add(e.itemHeadSize).equal(),marginInlineEnd:0,marginBlockStart:0,marginBlockEnd:0,wordBreak:"break-word"},"&-last":{[`> ${t}-item-tail`]:{display:"none"},[`> ${t}-item-content`]:{minHeight:i(e.controlHeightLG).mul(1.2).equal()}}},[`&${t}-alternate,
        &${t}-right,
        &${t}-label`]:{[`${t}-item`]:{"&-tail, &-head, &-head-custom":{insetInlineStart:"50%"},"&-head":{marginInlineStart:i(e.marginXXS).mul(-1).equal(),"&-custom":{marginInlineStart:i(e.tailWidth).div(2).equal()}},"&-left":{[`${t}-item-content`]:{insetInlineStart:`calc(50% - ${l(e.marginXXS)})`,width:`calc(50% - ${l(e.marginSM)})`,textAlign:"start"}},"&-right":{[`${t}-item-content`]:{width:`calc(50% - ${l(e.marginSM)})`,margin:0,textAlign:"end"}}}},[`&${t}-right`]:{[`${t}-item-right`]:{[`${t}-item-tail,
            ${t}-item-head,
            ${t}-item-head-custom`]:{insetInlineStart:`calc(100% - ${l(i(i(e.itemHeadSize).add(e.tailWidth)).div(2).equal())})`},[`${t}-item-content`]:{width:`calc(100% - ${l(i(e.itemHeadSize).add(e.marginXS).equal())})`}}},[`&${t}-pending
        ${t}-item-last
        ${t}-item-tail`]:{display:"block",height:`calc(100% - ${l(e.margin)})`,borderInlineStart:`${l(e.tailWidth)} dotted ${e.tailColor}`},[`&${t}-reverse
        ${t}-item-last
        ${t}-item-tail`]:{display:"none"},[`&${t}-reverse ${t}-item-pending`]:{[`${t}-item-tail`]:{insetBlockStart:e.margin,display:"block",height:`calc(100% - ${l(e.margin)})`,borderInlineStart:`${l(e.tailWidth)} dotted ${e.tailColor}`},[`${t}-item-content`]:{minHeight:i(e.controlHeightLG).mul(1.2).equal()}},[`&${t}-label`]:{[`${t}-item-label`]:{position:"absolute",insetBlockStart:i(i(e.fontSize).mul(e.lineHeight).sub(e.fontSize)).mul(-1).add(e.tailWidth).equal(),width:`calc(50% - ${l(e.marginSM)})`,textAlign:"end"},[`${t}-item-right`]:{[`${t}-item-label`]:{insetInlineStart:`calc(50% + ${l(e.marginSM)})`,width:`calc(50% - ${l(e.marginSM)})`,textAlign:"start"}}},"&-rtl":{direction:"rtl",[`${t}-item-head-custom`]:{transform:"translate(50%, -50%)"}}})}},fe=e=>({tailColor:e.colorSplit,tailWidth:e.lineWidthBold,dotBorderWidth:e.wireframe?e.lineWidthBold:e.lineWidth*3,dotBg:e.colorBgContainer,itemPaddingBottom:e.padding*1.25}),be=me("Timeline",e=>{const t=ge(e,{itemHeadSize:10,customHeadPaddingVertical:e.paddingXXS,paddingInlineEnd:2});return he(t)},fe);var Se=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(i[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,r=Object.getOwnPropertySymbols(e);n<r.length;n++)t.indexOf(r[n])<0&&Object.prototype.propertyIsEnumerable.call(e,r[n])&&(i[r[n]]=e[r[n]]);return i};const ee=e=>{var{prefixCls:t,className:i,color:r="blue",dot:n,pending:h=!1,position:y,label:d,children:f}=e,b=Se(e,["prefixCls","className","color","dot","pending","position","label","children"]);const{getPrefixCls:m}=o.useContext(k),s=m("timeline",t),S=$(`${s}-item`,{[`${s}-item-pending`]:h},i),g=/blue|red|green|gray/.test(r||"")?void 0:r,c=$(`${s}-item-head`,{[`${s}-item-head-custom`]:!!n,[`${s}-item-head-${r}`]:!g});return o.createElement("li",Object.assign({},b,{className:S}),d&&o.createElement("div",{className:`${s}-item-label`},d),o.createElement("div",{className:`${s}-item-tail`}),o.createElement("div",{className:c,style:{borderColor:g,color:g}},n),o.createElement("div",{className:`${s}-item-content`},f))};var H=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(i[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,r=Object.getOwnPropertySymbols(e);n<r.length;n++)t.indexOf(r[n])<0&&Object.prototype.propertyIsEnumerable.call(e,r[n])&&(i[r[n]]=e[r[n]]);return i};const $e=e=>{var{prefixCls:t,className:i,pending:r=!1,children:n,items:h,rootClassName:y,reverse:d=!1,direction:f,hashId:b,pendingDot:m,mode:s=""}=e,S=H(e,["prefixCls","className","pending","children","items","rootClassName","reverse","direction","hashId","pendingDot","mode"]);const g=(a,p)=>s==="alternate"?a==="right"?`${t}-item-right`:a==="left"?`${t}-item-left`:p%2===0?`${t}-item-left`:`${t}-item-right`:s==="left"?`${t}-item-left`:s==="right"?`${t}-item-right`:a==="right"?`${t}-item-right`:"",c=ce(h||[]),w=typeof r=="boolean"?null:r;r&&c.push({pending:!!r,dot:m||o.createElement(pe,null),children:w}),d&&c.reverse();const z=c.length,B=`${t}-item-last`,re=c.filter(a=>!!a).map((a,p)=>{var N;const ne=p===z-2?B:"",ae=p===z-1?B:"",{className:se}=a,le=H(a,["className"]);return o.createElement(ee,Object.assign({},le,{className:$([se,!d&&r?ne:ae,g((N=a==null?void 0:a.position)!==null&&N!==void 0?N:"",p)]),key:(a==null?void 0:a.key)||p}))}),E=c.some(a=>!!(a!=null&&a.label)),ie=$(t,{[`${t}-pending`]:!!r,[`${t}-reverse`]:!!d,[`${t}-${s}`]:!!s&&!E,[`${t}-label`]:E,[`${t}-rtl`]:f==="rtl"},i,y,b);return o.createElement("ol",Object.assign({},S,{className:ie}),re)};function ve(e,t){return e&&Array.isArray(e)?e:ue(t).map(i=>{var r,n;return Object.assign({children:(n=(r=i==null?void 0:i.props)===null||r===void 0?void 0:r.children)!==null&&n!==void 0?n:""},i.props)})}var ye=function(e,t){var i={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(i[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,r=Object.getOwnPropertySymbols(e);n<r.length;n++)t.indexOf(r[n])<0&&Object.prototype.propertyIsEnumerable.call(e,r[n])&&(i[r[n]]=e[r[n]]);return i};const te=e=>{const{getPrefixCls:t,direction:i,timeline:r}=o.useContext(k),{prefixCls:n,children:h,items:y,className:d,style:f}=e,b=ye(e,["prefixCls","children","items","className","style"]),m=t("timeline",n),s=de(m),[S,g,c]=be(m,s),w=ve(y,h);return S(o.createElement($e,Object.assign({},b,{className:$(r==null?void 0:r.className,d,c,s),style:Object.assign(Object.assign({},r==null?void 0:r.style),f),prefixCls:m,direction:i,items:w,hashId:g})))};te.Item=ee;const T=e=>u.jsx(te,{...e});T.displayName="Timeline";T.__docgenInfo={description:"",methods:[],displayName:"Timeline",composes:["AntTimelineProps"]};const Te={title:"Display/Timeline",component:T,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de línea de tiempo para mostrar información cronológica.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/timeline)
- [🎨 API de Props](https://ant.design/components/timeline#api)
- [💡 Ejemplos](https://ant.design/components/timeline#examples)

## Cuándo usar

- Para mostrar eventos o actividades en orden cronológico.
- Soporta diferentes modos de visualización y estados de color.
        `}}},argTypes:{mode:{control:"select",options:["left","alternate","right"]}}},v=[{children:"Create a services site 2015-09-01"},{children:"Solve initial network problems 2015-09-01"},{children:"Technical testing 2015-09-01"},{children:"Network problems being solved 2015-09-01"}],C={args:{items:v}},O={args:{items:[{color:"green",children:"Create a services site 2015-09-01"},{color:"green",children:"Create a services site 2015-09-01"},{color:"red",children:u.jsxs(u.Fragment,{children:[u.jsx("p",{children:"Solve initial network problems 1"}),u.jsx("p",{children:"Solve initial network problems 2"}),u.jsx("p",{children:"Solve initial network problems 3 2015-09-01"})]})},{children:"Technical testing 2015-09-01"},{color:"gray",children:"Technical testing 2015-09-01"},{color:"gray",children:"Technical testing 2015-09-01"}]}},x={args:{mode:"alternate",items:v}},I={args:{mode:"right",items:v}},P={args:{pending:"Recording...",items:v}},j={args:{reverse:!0,items:v}};var W,_,A;C.parameters={...C.parameters,docs:{...(W=C.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    items
  }
}`,...(A=(_=C.parameters)==null?void 0:_.docs)==null?void 0:A.source}}};var q,R,D;O.parameters={...O.parameters,docs:{...(q=O.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    items: [{
      color: 'green',
      children: 'Create a services site 2015-09-01'
    }, {
      color: 'green',
      children: 'Create a services site 2015-09-01'
    }, {
      color: 'red',
      children: <>\r
            <p>Solve initial network problems 1</p>\r
            <p>Solve initial network problems 2</p>\r
            <p>Solve initial network problems 3 2015-09-01</p>\r
          </>
    }, {
      children: 'Technical testing 2015-09-01'
    }, {
      color: 'gray',
      children: 'Technical testing 2015-09-01'
    }, {
      color: 'gray',
      children: 'Technical testing 2015-09-01'
    }]
  }
}`,...(D=(R=O.parameters)==null?void 0:R.docs)==null?void 0:D.source}}};var X,L,M;x.parameters={...x.parameters,docs:{...(X=x.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    mode: 'alternate',
    items
  }
}`,...(M=(L=x.parameters)==null?void 0:L.docs)==null?void 0:M.source}}};var V,G,F;I.parameters={...I.parameters,docs:{...(V=I.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    mode: 'right',
    items
  }
}`,...(F=(G=I.parameters)==null?void 0:G.docs)==null?void 0:F.source}}};var J,K,Q;P.parameters={...P.parameters,docs:{...(J=P.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    pending: 'Recording...',
    items
  }
}`,...(Q=(K=P.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,Y,Z;j.parameters={...j.parameters,docs:{...(U=j.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    reverse: true,
    items
  }
}`,...(Z=(Y=j.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};const ze=["Basic","WithColors","Alternate","Right","Pending","Reverse"];export{x as Alternate,C as Basic,P as Pending,j as Reverse,I as Right,O as WithColors,ze as __namedExportsOrder,Te as default};
