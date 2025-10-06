import{j as e}from"./iframe-Dz2LC5nm.js";import{s}from"./index-DLQBJbbx.js";import{S as r}from"./index-_UlGzK8j.js";import{B as n}from"./button-D6Z5Xr5r.js";import"./preload-helper-C1FmrZbK.js";import"./context-BN0WhDpa.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useMessage-CUGQcdTE.js";import"./CloseOutlined-Uef9iQNA.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./useCSSVarCls-BbjthPCx.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./LoadingOutlined-BrYRsAZK.js";import"./Keyframes-DYCYu-A0.js";import"./useZIndex-Dv1QJmGl.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./omit-DXgDXInf.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";const me={title:"Feedback/Message",component:s,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente para mostrar mensajes de retroalimentación globales.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/message)
- [🎨 API de Props](https://ant.design/components/message#api)
- [💡 Ejemplos](https://ant.design/components/message#examples)

## Cuándo usar

- Para mostrar retroalimentación ligera sobre operaciones del usuario.
- Mensajes flotantes que desaparecen automáticamente después de un tiempo.
        `}}}},o={render:()=>e.jsx(r,{children:e.jsx(n,{onClick:()=>s.info("This is a normal message"),children:"Display normal message"})})},i={render:()=>e.jsxs(r,{children:[e.jsx(n,{onClick:()=>s.success("This is a success message"),children:"Success"}),e.jsx(n,{onClick:()=>s.error("This is an error message"),children:"Error"}),e.jsx(n,{onClick:()=>s.warning("This is a warning message"),children:"Warning"}),e.jsx(n,{onClick:()=>s.info("This is an info message"),children:"Info"}),e.jsx(n,{onClick:()=>s.loading("Action in progress..",2.5),children:"Loading"})]})},a={render:()=>e.jsx(r,{children:e.jsx(n,{onClick:()=>s.success("This is a prompt message for success, and it will disappear in 10 seconds",10),children:"Customized display duration"})})},t={render:()=>e.jsx(r,{children:e.jsx(n,{onClick:()=>{s.loading("Action in progress..",2.5).then(()=>s.success("Loading finished",2.5)).then(()=>s.info("Loading finished is finished",2.5))},children:"Display sequential messages"})})},c={render:()=>{const p="updatable";return e.jsx(r,{children:e.jsx(n,{onClick:()=>{s.loading({content:"Loading...",key:p}),setTimeout(()=>{s.success({content:"Loaded!",key:p,duration:2})},1e3)},children:"Open the message box"})})}};var m,d,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => Message.info('This is a normal message')}>\r
        Display normal message\r
      </Button>\r
    </Space>
}`,...(u=(d=o.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var g,l,h;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => Message.success('This is a success message')}>\r
        Success\r
      </Button>\r
      <Button onClick={() => Message.error('This is an error message')}>\r
        Error\r
      </Button>\r
      <Button onClick={() => Message.warning('This is a warning message')}>\r
        Warning\r
      </Button>\r
      <Button onClick={() => Message.info('This is an info message')}>\r
        Info\r
      </Button>\r
      <Button onClick={() => Message.loading('Action in progress..', 2.5)}>\r
        Loading\r
      </Button>\r
    </Space>
}`,...(h=(l=i.parameters)==null?void 0:l.docs)==null?void 0:h.source}}};var f,k,B;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => Message.success('This is a prompt message for success, and it will disappear in 10 seconds', 10)}>\r
        Customized display duration\r
      </Button>\r
    </Space>
}`,...(B=(k=a.parameters)==null?void 0:k.docs)==null?void 0:B.source}}};var C,x,j;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => {
      Message.loading('Action in progress..', 2.5).then(() => Message.success('Loading finished', 2.5)).then(() => Message.info('Loading finished is finished', 2.5));
    }}>\r
        Display sequential messages\r
      </Button>\r
    </Space>
}`,...(j=(x=t.parameters)==null?void 0:x.docs)==null?void 0:j.source}}};var S,M,T;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const key = 'updatable';
    return <Space>\r
        <Button onClick={() => {
        Message.loading({
          content: 'Loading...',
          key
        });
        setTimeout(() => {
          Message.success({
            content: 'Loaded!',
            key,
            duration: 2
          });
        }, 1000);
      }}>\r
          Open the message box\r
        </Button>\r
      </Space>;
  }
}`,...(T=(M=c.parameters)==null?void 0:M.docs)==null?void 0:T.source}}};const de=["Basic","Types","Duration","WithPromise","UpdateMessage"];export{o as Basic,a as Duration,i as Types,c as UpdateMessage,t as WithPromise,de as __namedExportsOrder,me as default};
