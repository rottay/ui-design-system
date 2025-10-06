import{j as o}from"./iframe-Dz2LC5nm.js";import{M as n}from"./index-4MEfMcrw.js";import{S as b}from"./index-_UlGzK8j.js";import{B as t}from"./button-D6Z5Xr5r.js";import{R as D}from"./ExclamationCircleOutlined-DA0mZDgg.js";import"./preload-helper-C1FmrZbK.js";import"./index-CQWNCN3d.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./ActionButton-twpzoIEc.js";import"./CloseOutlined-Uef9iQNA.js";import"./index-NqV6zHZq.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-BPutIMu_.js";import"./fade-QfD4GzOS.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./zoom-CWPxwh-U.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./useClosable-Db8tzcGm.js";import"./extendsObject-78o_rR5W.js";import"./useLocale-i3AsUBCw.js";import"./useCSSVarCls-BbjthPCx.js";import"./Skeleton-_C6qiOOr.js";import"./context-BodU5NN8.js";import"./PurePanel-CuHF6Qyt.js";import"./useMergedState-DIkF75NH.js";import"./presetColors-DLnX3ho6.js";import"./LoadingOutlined-BrYRsAZK.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./collapse-BbEVqHco.js";import"./compact-item-BQH2bmb8.js";const s={show:e=>{const{type:r="confirm",...i}=e;switch(r){case"info":return n.info(i);case"success":return n.success(i);case"error":return n.error(i);case"warning":return n.warning(i);case"confirm":default:return n.confirm(i)}},confirm:e=>n.confirm(e),info:e=>n.info(e),success:e=>n.success(e),error:e=>n.error(e),warning:e=>n.warning(e),destroyAll:n.destroyAll},Ae={title:"Feedback/Modal/ConfirmModal",tags:["autodocs"],parameters:{docs:{description:{component:`
Modal especializado para confirmaciones importantes que requieren atención del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para acciones críticas que requieren confirmación explícita
- Cuando necesitas alertar al usuario de consecuencias importantes
- Para decisiones que no se pueden deshacer fácilmente
        `}}}},c={render:()=>o.jsxs(b,{children:[o.jsx(t,{onClick:()=>{s.confirm({title:"Do you want to delete these items?",content:"When clicked the OK button, this dialog will be closed after 1 second",onOk(){return new Promise((e,r)=>{setTimeout(Math.random()>.5?e:r,1e3)}).catch(()=>console.log("Oops errors!"))},onCancel(){}})},children:"Confirm"}),o.jsx(t,{onClick:()=>{s.info({title:"This is a notification message",content:o.jsxs("div",{children:[o.jsx("p",{children:"Some messages...some messages..."}),o.jsx("p",{children:"Some messages...some messages..."})]}),onOk(){}})},children:"Info"}),o.jsx(t,{onClick:()=>{s.success({title:"This is a success message",content:"Some messages...some messages..."})},children:"Success"}),o.jsx(t,{onClick:()=>{s.error({title:"This is an error message",content:"Some messages...some messages..."})},children:"Error"}),o.jsx(t,{onClick:()=>{s.warning({title:"This is a warning message",content:"Some messages...some messages..."})},children:"Warning"})]})},a={render:()=>o.jsx(t,{onClick:()=>{s.confirm({title:"Do you want to delete these items?",icon:o.jsx(D,{}),content:"Some descriptions",okText:"Yes",okType:"danger",cancelText:"No",onOk(){console.log("OK")},onCancel(){console.log("Cancel")}})},children:"Confirm with custom icon"})},m={render:()=>o.jsx(t,{onClick:()=>{s.confirm({title:"Do you want to delete these items?",content:"When clicked the OK button, this dialog will be closed after 1 second",async onOk(){await new Promise(e=>setTimeout(e,1e3)),console.log("OK")},onCancel(){console.log("Cancel")}})},children:"Async Confirmation"})},l={render:()=>{const e=()=>{let r=5;const i=s.success({title:"This is a notification message",content:`This modal will be destroyed after ${r} second.`}),M=setInterval(()=>{r-=1,i.update({content:`This modal will be destroyed after ${r} second.`})},1e3);setTimeout(()=>{clearInterval(M),i.destroy()},r*1e3)};return o.jsxs(b,{children:[o.jsx(t,{onClick:e,children:"Open modal to close in 5s"}),o.jsx(t,{onClick:s.destroyAll,children:"Destroy all"})]})}},d={render:()=>o.jsx(t,{onClick:()=>{s.confirm({title:"Confirm",content:"Content with custom footer buttons",okText:"Confirm",cancelText:"Cancel",okButtonProps:{disabled:!1},cancelButtonProps:{disabled:!1}})},children:"Custom Footer Buttons"})};var p,u,f;c.parameters={...c.parameters,docs:{...(p=c.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => {
      ConfirmModal.confirm({
        title: 'Do you want to delete these items?',
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          }).catch(() => console.log('Oops errors!'));
        },
        onCancel() {}
      });
    }}>\r
        Confirm\r
      </Button>\r
      <Button onClick={() => {
      ConfirmModal.info({
        title: 'This is a notification message',
        content: <div>\r
                <p>Some messages...some messages...</p>\r
                <p>Some messages...some messages...</p>\r
              </div>,
        onOk() {}
      });
    }}>\r
        Info\r
      </Button>\r
      <Button onClick={() => {
      ConfirmModal.success({
        title: 'This is a success message',
        content: 'Some messages...some messages...'
      });
    }}>\r
        Success\r
      </Button>\r
      <Button onClick={() => {
      ConfirmModal.error({
        title: 'This is an error message',
        content: 'Some messages...some messages...'
      });
    }}>\r
        Error\r
      </Button>\r
      <Button onClick={() => {
      ConfirmModal.warning({
        title: 'This is a warning message',
        content: 'Some messages...some messages...'
      });
    }}>\r
        Warning\r
      </Button>\r
    </Space>
}`,...(f=(u=c.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};var g,C,h;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Button onClick={() => {
    ConfirmModal.confirm({
      title: 'Do you want to delete these items?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  }}>\r
      Confirm with custom icon\r
    </Button>
}`,...(h=(C=a.parameters)==null?void 0:C.docs)==null?void 0:h.source}}};var k,w,T;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <Button onClick={() => {
    ConfirmModal.confirm({
      title: 'Do you want to delete these items?',
      content: 'When clicked the OK button, this dialog will be closed after 1 second',
      async onOk() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  }}>\r
      Async Confirmation\r
    </Button>
}`,...(T=(w=m.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var x,B,y;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const countDown = () => {
      let secondsToGo = 5;
      const modal = ConfirmModal.success({
        title: 'This is a notification message',
        content: \`This modal will be destroyed after \${secondsToGo} second.\`
      });
      const timer = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
          content: \`This modal will be destroyed after \${secondsToGo} second.\`
        });
      }, 1000);
      setTimeout(() => {
        clearInterval(timer);
        modal.destroy();
      }, secondsToGo * 1000);
    };
    return <Space>\r
        <Button onClick={countDown}>Open modal to close in 5s</Button>\r
        <Button onClick={ConfirmModal.destroyAll}>Destroy all</Button>\r
      </Space>;
  }
}`,...(y=(B=l.parameters)==null?void 0:B.docs)==null?void 0:y.source}}};var S,O,j;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <Button onClick={() => {
    ConfirmModal.confirm({
      title: 'Confirm',
      content: 'Content with custom footer buttons',
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: {
        disabled: false
      },
      cancelButtonProps: {
        disabled: false
      }
    });
  }}>\r
      Custom Footer Buttons\r
    </Button>
}`,...(j=(O=d.parameters)==null?void 0:O.docs)==null?void 0:j.source}}};const Pe=["Basic","WithCustomIcon","AsyncConfirmation","DestroyAll","CustomFooter"];export{m as AsyncConfirmation,c as Basic,d as CustomFooter,l as DestroyAll,a as WithCustomIcon,Pe as __namedExportsOrder,Ae as default};
