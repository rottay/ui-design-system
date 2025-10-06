import{r as s,a as se,b as oe,c as ie,v as ce,w as R,j as m}from"./iframe-Dz2LC5nm.js";import{c as le}from"./reactNode-B7JGm4rf.js";import{p as de}from"./pickAttrs-C7BJ3CXo.js";import{S as pe}from"./Skeleton-_C6qiOOr.js";import{g as ue,m as me}from"./genStyleUtils-BYYxHtb1.js";import{S as O}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./omit-DXgDXInf.js";import"./Keyframes-DYCYu-A0.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";const fe=e=>{const{value:n,formatter:a,precision:t,decimalSeparator:r,groupSeparator:u="",prefixCls:l}=e;let i;if(typeof a=="function")i=a(n);else{const o=String(n),d=o.match(/^(-?)(\d*)(\.(\d+))?$/);if(!d||o==="-")i=o;else{const g=d[1];let f=d[2]||"0",p=d[4]||"";f=f.replace(/\B(?=(\d{3})+(?!\d))/g,u),typeof t=="number"&&(p=p.padEnd(t,"0").slice(0,t>0?t:0)),p&&(p=`${r}${p}`),i=[s.createElement("span",{key:"int",className:`${l}-content-value-int`},g,f),p&&s.createElement("span",{key:"decimal",className:`${l}-content-value-decimal`},p)]}}return s.createElement("span",{className:`${l}-content-value`},i)},ge=e=>{const{componentCls:n,marginXXS:a,padding:t,colorTextDescription:r,titleFontSize:u,colorTextHeading:l,contentFontSize:i,fontFamily:o}=e;return{[n]:Object.assign(Object.assign({},se(e)),{[`${n}-title`]:{marginBottom:a,color:r,fontSize:u},[`${n}-skeleton`]:{paddingTop:t},[`${n}-content`]:{color:l,fontSize:i,fontFamily:o,[`${n}-content-value`]:{display:"inline-block",direction:"ltr"},[`${n}-content-prefix, ${n}-content-suffix`]:{display:"inline-block"},[`${n}-content-prefix`]:{marginInlineEnd:a},[`${n}-content-suffix`]:{marginInlineStart:a}}})}},ve=e=>{const{fontSizeHeading3:n,fontSize:a}=e;return{titleFontSize:a,contentFontSize:n}},Se=ue("Statistic",e=>{const n=me(e,{});return ge(n)},ve);var xe=function(e,n){var a={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.indexOf(t)<0&&(a[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,t=Object.getOwnPropertySymbols(e);r<t.length;r++)n.indexOf(t[r])<0&&Object.prototype.propertyIsEnumerable.call(e,t[r])&&(a[t[r]]=e[t[r]]);return a};const E=s.forwardRef((e,n)=>{const{prefixCls:a,className:t,rootClassName:r,style:u,valueStyle:l,value:i=0,title:o,valueRender:d,prefix:g,suffix:f,loading:p=!1,formatter:c,precision:v,decimalSeparator:y=".",groupSeparator:W=",",onMouseEnter:X,onMouseLeave:Y}=e,q=xe(e,["prefixCls","className","rootClassName","style","valueStyle","value","title","valueRender","prefix","suffix","loading","formatter","precision","decimalSeparator","groupSeparator","onMouseEnter","onMouseLeave"]),{getPrefixCls:J,direction:K,className:Q,style:Z}=oe("statistic"),S=J("statistic",a),[ee,te,ne]=Se(S),$=s.createElement(fe,{decimalSeparator:y,groupSeparator:W,prefixCls:S,formatter:c,precision:v,value:i}),re=ie(S,{[`${S}-rtl`]:K==="rtl"},Q,t,r,te,ne),N=s.useRef(null);s.useImperativeHandle(n,()=>({nativeElement:N.current}));const ae=de(q,{aria:!0,data:!0});return ee(s.createElement("div",Object.assign({},ae,{ref:N,className:re,style:Object.assign(Object.assign({},Z),u),onMouseEnter:X,onMouseLeave:Y}),o&&s.createElement("div",{className:`${S}-title`},o),s.createElement(pe,{paragraph:!1,loading:p,className:`${S}-skeleton`},s.createElement("div",{style:l,className:`${S}-content`},g&&s.createElement("span",{className:`${S}-content-prefix`},g),d?d($):$,f&&s.createElement("span",{className:`${S}-content-suffix`},f)))))}),ye=[["Y",1e3*60*60*24*365],["M",1e3*60*60*24*30],["D",1e3*60*60*24],["H",1e3*60*60],["m",1e3*60],["s",1e3],["S",1]];function be(e,n){let a=e;const t=/\[[^\]]*]/g,r=(n.match(t)||[]).map(o=>o.slice(1,-1)),u=n.replace(t,"[]"),l=ye.reduce((o,[d,g])=>{if(o.includes(d)){const f=Math.floor(a/g);return a-=f*g,o.replace(new RegExp(`${d}+`,"g"),p=>{const c=p.length;return f.toString().padStart(c,"0")})}return o},u);let i=0;return l.replace(t,()=>{const o=r[i];return i+=1,o})}function we(e,n,a){const{format:t=""}=n,r=new Date(e).getTime(),u=Date.now(),l=Math.max(a?r-u:u-r,0);return be(l,t)}var he=function(e,n){var a={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.indexOf(t)<0&&(a[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,t=Object.getOwnPropertySymbols(e);r<t.length;r++)n.indexOf(t[r])<0&&Object.prototype.propertyIsEnumerable.call(e,t[r])&&(a[t[r]]=e[t[r]]);return a};function je(e){return new Date(e).getTime()}const V=e=>{const{value:n,format:a="HH:mm:ss",onChange:t,onFinish:r,type:u}=e,l=he(e,["value","format","onChange","onFinish","type"]),i=u==="countdown",[o,d]=s.useState(null),g=ce(()=>{const c=Date.now(),v=je(n);d({});const y=i?v-c:c-v;return t==null||t(y),i&&v<c?(r==null||r(),!1):!0});s.useEffect(()=>{let c;const v=()=>R.cancel(c),y=()=>{c=R(()=>{g()&&y()})};return y(),v},[n,i]),s.useEffect(()=>{d({})},[]);const f=(c,v)=>o?we(c,Object.assign(Object.assign({},v),{format:a}),i):"-",p=c=>le(c,{title:void 0});return s.createElement(E,Object.assign({},l,{value:n,valueRender:p,formatter:f}))},Ce=e=>s.createElement(V,Object.assign({},e,{type:"countdown"})),Ee=s.memo(Ce);E.Timer=V;E.Countdown=Ee;const x=e=>m.jsx(E,{...e});x.displayName="Statistic";x.__docgenInfo={description:"",methods:[],displayName:"Statistic",composes:["AntStatisticProps"]};const Me={title:"Display/Statistic",component:x,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente para mostrar datos estadísticos de manera destacada.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/statistic)
- [🎨 API de Props](https://ant.design/components/statistic#api)
- [💡 Ejemplos](https://ant.design/components/statistic#examples)

## Cuándo usar

- Para mostrar métricas clave, números importantes o estadísticas.
- Incluye soporte para contadores regresivos y personalización de formato.
        `}}}},b={args:{title:"Active Users",value:112893}},w={render:()=>m.jsxs(O,{children:[m.jsx(x,{title:"Account Balance (USD)",value:112893,precision:2,prefix:"$"}),m.jsx(x,{title:"Growth Rate",value:11.28,precision:2,suffix:"%"})]})},h={render:()=>m.jsx("div",{style:{background:"#f5f5f5",padding:30},children:m.jsxs(O,{size:"large",children:[m.jsx("div",{style:{background:"#fff",padding:24,borderRadius:8},children:m.jsx(x,{title:"Active",value:11.28,precision:2,valueStyle:{color:"#3f8600"},suffix:"%"})}),m.jsx("div",{style:{background:"#fff",padding:24,borderRadius:8},children:m.jsx(x,{title:"Idle",value:9.3,precision:2,valueStyle:{color:"#cf1322"},suffix:"%"})})]})})},j={args:{title:"Active Users",value:112893,loading:!0}},C={render:()=>{const e=Date.now()+1728e5+3e4;return m.jsx(O,{children:m.jsx(x.Countdown,{title:"Countdown",value:e})})}};var k,D,P;b.parameters={...b.parameters,docs:{...(k=b.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    title: 'Active Users',
    value: 112893
  }
}`,...(P=(D=b.parameters)==null?void 0:D.docs)==null?void 0:P.source}}};var T,I,A;w.parameters={...w.parameters,docs:{...(T=w.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Statistic title="Account Balance (USD)" value={112893} precision={2} prefix="$" />\r
      <Statistic title="Growth Rate" value={11.28} precision={2} suffix="%" />\r
    </Space>
}`,...(A=(I=w.parameters)==null?void 0:I.docs)==null?void 0:A.source}}};var z,_,M;h.parameters={...h.parameters,docs:{...(z=h.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div style={{
    background: '#f5f5f5',
    padding: 30
  }}>\r
      <Space size="large">\r
        <div style={{
        background: '#fff',
        padding: 24,
        borderRadius: 8
      }}>\r
          <Statistic title="Active" value={11.28} precision={2} valueStyle={{
          color: '#3f8600'
        }} suffix="%" />\r
        </div>\r
        <div style={{
        background: '#fff',
        padding: 24,
        borderRadius: 8
      }}>\r
          <Statistic title="Idle" value={9.3} precision={2} valueStyle={{
          color: '#cf1322'
        }} suffix="%" />\r
        </div>\r
      </Space>\r
    </div>
}`,...(M=(_=h.parameters)==null?void 0:_.docs)==null?void 0:M.source}}};var U,F,H;j.parameters={...j.parameters,docs:{...(U=j.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    title: 'Active Users',
    value: 112893,
    loading: true
  }
}`,...(H=(F=j.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var B,L,G;C.parameters={...C.parameters,docs:{...(B=C.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => {
    const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Dayjs is needed
    return <Space>\r
        {/* @ts-ignore - Countdown is from antd */}\r
        <Statistic.Countdown title="Countdown" value={deadline} />\r
      </Space>;
  }
}`,...(G=(L=C.parameters)==null?void 0:L.docs)==null?void 0:G.source}}};const Ue=["Basic","WithPrefix","InCard","Loading","Countdown"];export{b as Basic,C as Countdown,h as InCard,j as Loading,w as WithPrefix,Ue as __namedExportsOrder,Me as default};
