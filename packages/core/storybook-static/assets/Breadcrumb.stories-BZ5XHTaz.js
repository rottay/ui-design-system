import{r as a,C as L,c as D,a as Oe,u as U,T as he,j as Ce}from"./iframe-Dz2LC5nm.js";import{t as V}from"./toArray-CcRQ9JCW.js";import{p as ie}from"./pickAttrs-C7BJ3CXo.js";import{c as ve}from"./reactNode-B7JGm4rf.js";import{R as je}from"./DownOutlined-DLjCd-2z.js";import{D as Se}from"./dropdown-BdjbWs10.js";import{g as xe,m as Pe}from"./genStyleUtils-BYYxHtb1.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./LeftOutlined-B29Bdkke.js";import"./RightOutlined-BDL0sfNG.js";import"./Dropdown-ncGrBRcY.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./KeyCode-HJ8jGXz0.js";import"./useMergedState-DIkF75NH.js";import"./omit-DXgDXInf.js";import"./useZIndex-Dv1QJmGl.js";import"./index-DiRJBLqM.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./PurePanel-CuHF6Qyt.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-pLRMjw40.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./collapse-BbEVqHco.js";import"./slide-ewzjqjuQ.js";import"./move-DcXnB1RZ.js";const $=({children:e})=>{const{getPrefixCls:n}=a.useContext(L),o=n("breadcrumb");return a.createElement("li",{className:`${o}-separator`,"aria-hidden":"true"},e===""?e:e||"/")};$.__ANT_BREADCRUMB_SEPARATOR=!0;var Ie=function(e,n){var o={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.indexOf(r)<0&&(o[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var t=0,r=Object.getOwnPropertySymbols(e);t<r.length;t++)n.indexOf(r[t])<0&&Object.prototype.propertyIsEnumerable.call(e,r[t])&&(o[r[t]]=e[r[t]]);return o};function Ee(e,n){if(e.title===void 0||e.title===null)return null;const o=Object.keys(n).join("|");return typeof e.title=="object"?e.title:String(e.title).replace(new RegExp(`:(${o})`,"g"),(r,t)=>n[t]||r)}function se(e,n,o,r){if(o==null)return null;const{className:t,onClick:i}=n,s=Ie(n,["className","onClick"]),l=Object.assign(Object.assign({},ie(s,{data:!0,aria:!0})),{onClick:i});return r!==void 0?a.createElement("a",Object.assign({},l,{className:D(`${e}-link`,t),href:r}),o):a.createElement("span",Object.assign({},l,{className:D(`${e}-link`,t)}),o)}function Ne(e,n){return(r,t,i,s,l)=>{if(n)return n(r,t,i,s);const d=Ee(r,t);return se(e,r,d,l)}}var X=function(e,n){var o={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.indexOf(r)<0&&(o[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var t=0,r=Object.getOwnPropertySymbols(e);t<r.length;t++)n.indexOf(r[t])<0&&Object.prototype.propertyIsEnumerable.call(e,r[t])&&(o[r[t]]=e[r[t]]);return o};const le=e=>{const{prefixCls:n,separator:o="/",children:r,menu:t,overlay:i,dropdownProps:s,href:l}=e,b=(y=>{if(t||i){const O=Object.assign({},s);if(t){const x=t||{},{items:h}=x,c=X(x,["items"]);O.menu=Object.assign(Object.assign({},c),{items:h==null?void 0:h.map((f,m)=>{var{key:C,title:B,label:v,path:p}=f,R=X(f,["key","title","label","path"]);let j=v??B;return p&&(j=a.createElement("a",{href:`${l}${p}`},j)),Object.assign(Object.assign({},R),{key:C??m,label:j})})})}else i&&(O.overlay=i);return a.createElement(Se,Object.assign({placement:"bottom"},O),a.createElement("span",{className:`${n}-overlay-link`},y,a.createElement(je,null)))}return y})(r);return b!=null?a.createElement(a.Fragment,null,a.createElement("li",null,b),o&&a.createElement($,null,o)):null},ce=e=>{const{prefixCls:n,children:o,href:r}=e,t=X(e,["prefixCls","children","href"]),{getPrefixCls:i}=a.useContext(L),s=i("breadcrumb",n);return a.createElement(le,Object.assign({},t,{prefixCls:s}),se(s,t,o,r))};ce.__ANT_BREADCRUMB_ITEM=!0;const Ae=e=>{const{componentCls:n,iconCls:o,calc:r}=e;return{[n]:Object.assign(Object.assign({},Oe(e)),{color:e.itemColor,fontSize:e.fontSize,[o]:{fontSize:e.iconFontSize},ol:{display:"flex",flexWrap:"wrap",margin:0,padding:0,listStyle:"none"},a:Object.assign({color:e.linkColor,transition:`color ${e.motionDurationMid}`,padding:`0 ${U(e.paddingXXS)}`,borderRadius:e.borderRadiusSM,height:e.fontHeight,display:"inline-block",marginInline:r(e.marginXXS).mul(-1).equal(),"&:hover":{color:e.linkHoverColor,backgroundColor:e.colorBgTextHover}},he(e)),"li:last-child":{color:e.lastItemColor},[`${n}-separator`]:{marginInline:e.separatorMargin,color:e.separatorColor},[`${n}-link`]:{[`
          > ${o} + span,
          > ${o} + a
        `]:{marginInlineStart:e.marginXXS}},[`${n}-overlay-link`]:{borderRadius:e.borderRadiusSM,height:e.fontHeight,display:"inline-block",padding:`0 ${U(e.paddingXXS)}`,marginInline:r(e.marginXXS).mul(-1).equal(),[`> ${o}`]:{marginInlineStart:e.marginXXS,fontSize:e.fontSizeIcon},"&:hover":{color:e.linkHoverColor,backgroundColor:e.colorBgTextHover,a:{color:e.linkHoverColor}},a:{"&:hover":{backgroundColor:"transparent"}}},[`&${e.componentCls}-rtl`]:{direction:"rtl"}})}},$e=e=>({itemColor:e.colorTextDescription,lastItemColor:e.colorText,iconFontSize:e.fontSize,linkColor:e.colorTextDescription,linkHoverColor:e.colorText,separatorColor:e.colorTextDescription,separatorMargin:e.marginXS}),Be=xe("Breadcrumb",e=>{const n=Pe(e,{});return Ae(n)},$e);var k=function(e,n){var o={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.indexOf(r)<0&&(o[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var t=0,r=Object.getOwnPropertySymbols(e);t<r.length;t++)n.indexOf(r[t])<0&&Object.prototype.propertyIsEnumerable.call(e,r[t])&&(o[r[t]]=e[r[t]]);return o};function Re(e){const{breadcrumbName:n,children:o}=e,r=k(e,["breadcrumbName","children"]),t=Object.assign({title:n},r);return o&&(t.menu={items:o.map(i=>{var{breadcrumbName:s}=i,l=k(i,["breadcrumbName"]);return Object.assign(Object.assign({},l),{title:s})})}),t}function _e(e,n){return a.useMemo(()=>e||(n?n.map(Re):null),[e,n])}var we=function(e,n){var o={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.indexOf(r)<0&&(o[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var t=0,r=Object.getOwnPropertySymbols(e);t<r.length;t++)n.indexOf(r[t])<0&&Object.prototype.propertyIsEnumerable.call(e,r[t])&&(o[r[t]]=e[r[t]]);return o};const He=(e,n)=>{if(n===void 0)return n;let o=(n||"").replace(/^\//,"");return Object.keys(e).forEach(r=>{o=o.replace(`:${r}`,e[r])}),o},z=e=>{const{prefixCls:n,separator:o="/",style:r,className:t,rootClassName:i,routes:s,items:l,children:d,itemRender:b,params:y={}}=e,O=we(e,["prefixCls","separator","style","className","rootClassName","routes","items","children","itemRender","params"]),{getPrefixCls:x,direction:h,breadcrumb:c}=a.useContext(L);let f;const m=x("breadcrumb",n),[C,B,v]=Be(m),p=_e(l,s),R=Ne(m,b);if(p&&p.length>0){const g=[],S=l||s;f=p.map((u,P)=>{const{path:pe,key:_,type:ue,menu:W,overlay:q,onClick:de,className:fe,separator:ge,dropdownProps:be}=u,w=He(y,pe);w!==void 0&&g.push(w);const F=_??P;if(ue==="separator")return a.createElement($,{key:F},ge);const H={},ye=P===p.length-1;W?H.menu=W:q&&(H.overlay=q);let{href:T}=u;return g.length&&w!==void 0&&(T=`#/${g.join("/")}`),a.createElement(le,Object.assign({key:F},H,ie(u,{data:!0,aria:!0}),{className:fe,dropdownProps:be,href:T,separator:ye?"":o,onClick:de,prefixCls:m}),R(u,y,S,g,T))})}else if(d){const g=V(d).length;f=V(d).map((S,u)=>{if(!S)return S;const P=u===g-1;return ve(S,{separator:P?"":o,key:u})})}const j=D(m,c==null?void 0:c.className,{[`${m}-rtl`]:h==="rtl"},t,i,B,v),me=Object.assign(Object.assign({},c==null?void 0:c.style),r);return C(a.createElement("nav",Object.assign({className:j,style:me},O),a.createElement("ol",null,f)))};z.Item=ce;z.Separator=$;const M=e=>Ce.jsx(z,{...e});M.displayName="Breadcrumb";M.__docgenInfo={description:"",methods:[],displayName:"Breadcrumb",composes:["AntBreadcrumbProps"]};const Ar={title:"Navigation/Breadcrumb",component:M,tags:["autodocs"],parameters:{docs:{description:{component:`
Muestra la ubicación actual dentro de una jerarquía de navegación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/breadcrumb)
- [🎨 API de Props](https://ant.design/components/breadcrumb#api)
- [💡 Ejemplos](https://ant.design/components/breadcrumb#examples)

## Cuándo usar

- Para mostrar la ruta de navegación actual en aplicaciones jerárquicas
- Cuando necesitas indicar la ubicación del usuario en la estructura
- Para proporcionar navegación rápida a niveles superiores
        `}}},argTypes:{separator:{control:{type:"text"},description:"Custom separator",defaultValue:"/"},items:{control:{type:"object"},description:"The routing stack information of breadcrumb"}}},I={args:{items:[{title:"Home"},{title:"Application"},{title:"List"}]}},E={args:{items:[{title:"Home",href:"/"},{title:"Application Center",href:"/application"},{title:"Application List",href:"/application/list"},{title:"An Application"}]}},N={args:{items:[{title:"Home",href:"/"},{title:"User",href:"/user"},{title:"Profile"}]}},A={args:{separator:">",items:[{title:"Home"},{title:"Application"},{title:"List"}]}};var K,G,J;I.parameters={...I.parameters,docs:{...(K=I.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    items: [{
      title: 'Home'
    }, {
      title: 'Application'
    }, {
      title: 'List'
    }]
  }
}`,...(J=(G=I.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var Q,Y,Z;E.parameters={...E.parameters,docs:{...(Q=E.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    items: [{
      title: 'Home',
      href: '/'
    }, {
      title: 'Application Center',
      href: '/application'
    }, {
      title: 'Application List',
      href: '/application/list'
    }, {
      title: 'An Application'
    }]
  }
}`,...(Z=(Y=E.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var ee,re,te;N.parameters={...N.parameters,docs:{...(ee=N.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  args: {
    items: [{
      title: 'Home',
      href: '/'
    }, {
      title: 'User',
      href: '/user'
    }, {
      title: 'Profile'
    }]
  }
}`,...(te=(re=N.parameters)==null?void 0:re.docs)==null?void 0:te.source}}};var ne,oe,ae;A.parameters={...A.parameters,docs:{...(ne=A.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  args: {
    separator: '>',
    items: [{
      title: 'Home'
    }, {
      title: 'Application'
    }, {
      title: 'List'
    }]
  }
}`,...(ae=(oe=A.parameters)==null?void 0:oe.docs)==null?void 0:ae.source}}};const $r=["Basic","WithLinks","WithIcons","CustomSeparator"];export{I as Basic,A as CustomSeparator,N as WithIcons,E as WithLinks,$r as __namedExportsOrder,Ar as default};
