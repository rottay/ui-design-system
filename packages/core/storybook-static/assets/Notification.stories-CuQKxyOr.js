import{R as p,N as $,S as q,r as S,C as U,j as n}from"./iframe-Dz2LC5nm.js";import{A as Y}from"./context-BN0WhDpa.js";import{u as J}from"./index-BKBr2mfS.js";import{P as K,u as V,a as X}from"./useNotification-BYavbXQ2.js";import{S as u}from"./index-_UlGzK8j.js";import{B as e}from"./button-D6Z5Xr5r.js";import"./preload-helper-C1FmrZbK.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useCSSVarCls-BbjthPCx.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./Keyframes-DYCYu-A0.js";import"./useZIndex-Dv1QJmGl.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./omit-DXgDXInf.js";import"./presetColors-DLnX3ho6.js";import"./LoadingOutlined-BrYRsAZK.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";let r=null,y=t=>t(),x=[],d={};function w(){const{getContainer:t,rtl:o,maxCount:l,top:c,bottom:a,showProgress:s,pauseOnHover:h}=d,f=(t==null?void 0:t())||document.body;return{getContainer:()=>f,rtl:o,maxCount:l,top:c,bottom:a,showProgress:s,pauseOnHover:h}}const Z=p.forwardRef((t,o)=>{const{notificationConfig:l,sync:c}=t,{getPrefixCls:a}=S.useContext(U),s=d.prefixCls||a("notification"),h=S.useContext(Y),[f,k]=X(Object.assign(Object.assign(Object.assign({},l),{prefixCls:s}),h.notification));return p.useEffect(c,[]),p.useImperativeHandle(o,()=>{const m=Object.assign({},f);return Object.keys(m).forEach(B=>{m[B]=(...Q)=>(c(),f[B].apply(f,Q))}),{instance:m,sync:c}}),k}),tt=p.forwardRef((t,o)=>{const[l,c]=p.useState(w),a=()=>{c(w)};p.useEffect(a,[]);const s=q(),h=s.getRootPrefixCls(),f=s.getIconPrefixCls(),k=s.getTheme(),m=p.createElement(Z,{ref:o,sync:a,notificationConfig:l});return p.createElement($,{prefixCls:h,iconPrefixCls:f,theme:k},s.holderRender?s.holderRender(m):m)}),j=()=>{if(!r){const t=document.createDocumentFragment(),o={fragment:t};r=o,y(()=>{J()(p.createElement(tt,{ref:c=>{const{instance:a,sync:s}=c||{};Promise.resolve().then(()=>{!o.instance&&a&&(o.instance=a,o.sync=s,j())})}}),t)});return}r.instance&&(x.forEach(t=>{switch(t.type){case"open":{y(()=>{r.instance.open(Object.assign(Object.assign({},d),t.config))});break}case"destroy":y(()=>{var o;(o=r==null?void 0:r.instance)===null||o===void 0||o.destroy(t.key)});break}}),x=[])};function ot(t){d=Object.assign(Object.assign({},d),t),y(()=>{var o;(o=r==null?void 0:r.sync)===null||o===void 0||o.call(r)})}function z(t){x.push({type:"open",config:t}),j()}const nt=t=>{x.push({type:"destroy",key:t}),j()},it=["success","info","warning","error"],et={open:z,destroy:nt,config:ot,useNotification:V,_InternalPanelDoNotUseOrYouWillBeFired:K},i=et;it.forEach(t=>{i[t]=o=>z(Object.assign(Object.assign({},o),{type:t}))});const zt={title:"Feedback/Notification",component:i,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente para mostrar notificaciones globales.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/notification)
- [🎨 API de Props](https://ant.design/components/notification#api)
- [💡 Ejemplos](https://ant.design/components/notification#examples)

## Cuándo usar

- Para mostrar notificaciones con más información y contexto que un Message.
- Soporta diferentes posiciones, duraciones y botones de acción.
        `}}}},g={render:()=>n.jsx(u,{children:n.jsx(e,{type:"primary",onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification. This is the content of the notification. This is the content of the notification."})},children:"Open the notification box"})})},C={render:()=>n.jsxs(u,{children:[n.jsx(e,{onClick:()=>{i.success({message:"Success Notification",description:"This is the content of the success notification."})},children:"Success"}),n.jsx(e,{onClick:()=>{i.error({message:"Error Notification",description:"This is the content of the error notification."})},children:"Error"}),n.jsx(e,{onClick:()=>{i.warning({message:"Warning Notification",description:"This is the content of the warning notification."})},children:"Warning"}),n.jsx(e,{onClick:()=>{i.info({message:"Info Notification",description:"This is the content of the info notification."})},children:"Info"})]})},N={render:()=>n.jsxs(u,{wrap:!0,children:[n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"topLeft"})},children:"topLeft"}),n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"top"})},children:"top"}),n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"topRight"})},children:"topRight"}),n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"bottomLeft"})},children:"bottomLeft"}),n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"bottom"})},children:"bottom"}),n.jsx(e,{onClick:()=>{i.open({message:"Notification Title",description:"This is the content of the notification.",placement:"bottomRight"})},children:"bottomRight"})]})},T={render:()=>n.jsx(u,{children:n.jsx(e,{type:"primary",onClick:()=>{i.open({message:"Notification Title",description:"This notification will not auto-close.",duration:0})},children:"Open the notification (never auto-close)"})})},b={render:()=>{const t=`open${Date.now()}`;return n.jsx(u,{children:n.jsx(e,{type:"primary",onClick:()=>{i.open({message:"Notification Title",description:'A function will be called after the notification is closed (automatically after the "duration" time of manually).',btn:n.jsx(e,{type:"primary",size:"small",onClick:()=>i.destroy(t),children:"Confirm"}),key:t})},children:"Open the notification with action"})})}};var O,R,v;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button type="primary" onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.'
      });
    }}>\r
        Open the notification box\r
      </Button>\r
    </Space>
}`,...(v=(R=g.parameters)==null?void 0:R.docs)==null?void 0:v.source}}};var P,E,I;C.parameters={...C.parameters,docs:{...(P=C.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => {
      Notification.success({
        message: 'Success Notification',
        description: 'This is the content of the success notification.'
      });
    }}>\r
        Success\r
      </Button>\r
      <Button onClick={() => {
      Notification.error({
        message: 'Error Notification',
        description: 'This is the content of the error notification.'
      });
    }}>\r
        Error\r
      </Button>\r
      <Button onClick={() => {
      Notification.warning({
        message: 'Warning Notification',
        description: 'This is the content of the warning notification.'
      });
    }}>\r
        Warning\r
      </Button>\r
      <Button onClick={() => {
      Notification.info({
        message: 'Info Notification',
        description: 'This is the content of the info notification.'
      });
    }}>\r
        Info\r
      </Button>\r
    </Space>
}`,...(I=(E=C.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var A,D,L;N.parameters={...N.parameters,docs:{...(A=N.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <Space wrap>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'topLeft'
      });
    }}>\r
        topLeft\r
      </Button>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'top'
      });
    }}>\r
        top\r
      </Button>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'topRight'
      });
    }}>\r
        topRight\r
      </Button>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'bottomLeft'
      });
    }}>\r
        bottomLeft\r
      </Button>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'bottom'
      });
    }}>\r
        bottom\r
      </Button>\r
      <Button onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This is the content of the notification.',
        placement: 'bottomRight'
      });
    }}>\r
        bottomRight\r
      </Button>\r
    </Space>
}`,...(L=(D=N.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var W,_,G;T.parameters={...T.parameters,docs:{...(W=T.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button type="primary" onClick={() => {
      Notification.open({
        message: 'Notification Title',
        description: 'This notification will not auto-close.',
        duration: 0
      });
    }}>\r
        Open the notification (never auto-close)\r
      </Button>\r
    </Space>
}`,...(G=(_=T.parameters)==null?void 0:_.docs)==null?void 0:G.source}}};var F,H,M;b.parameters={...b.parameters,docs:{...(F=b.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => {
    const key = \`open\${Date.now()}\`;
    return <Space>\r
        <Button type="primary" onClick={() => {
        Notification.open({
          message: 'Notification Title',
          description: 'A function will be called after the notification is closed (automatically after the "duration" time of manually).',
          btn: <Button type="primary" size="small" onClick={() => Notification.destroy(key)}>\r
                  Confirm\r
                </Button>,
          key
        });
      }}>\r
          Open the notification with action\r
        </Button>\r
      </Space>;
  }
}`,...(M=(H=b.parameters)==null?void 0:H.docs)==null?void 0:M.source}}};const Qt=["Basic","Types","Placement","Duration","WithAction"];export{g as Basic,T as Duration,N as Placement,C as Types,b as WithAction,Qt as __namedExportsOrder,zt as default};
