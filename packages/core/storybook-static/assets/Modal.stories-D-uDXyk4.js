import{j as e,r}from"./iframe-Dz2LC5nm.js";import{M as s}from"./Modal-DNuLcwmU.js";import{B as o}from"./button-D6Z5Xr5r.js";import{S as q}from"./index-_UlGzK8j.js";import{M as a}from"./index-4MEfMcrw.js";import"./preload-helper-C1FmrZbK.js";import"./omit-DXgDXInf.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useSize-oyF83k_j.js";import"./Compact-ObzKHgFl.js";import"./toArray-CcRQ9JCW.js";import"./presetColors-DLnX3ho6.js";import"./LoadingOutlined-BrYRsAZK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";import"./index-CQWNCN3d.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./useZIndex-Dv1QJmGl.js";import"./ActionButton-twpzoIEc.js";import"./CloseOutlined-Uef9iQNA.js";import"./index-NqV6zHZq.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./index-BPutIMu_.js";import"./fade-QfD4GzOS.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./zoom-CWPxwh-U.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./useClosable-Db8tzcGm.js";import"./extendsObject-78o_rR5W.js";import"./useCSSVarCls-BbjthPCx.js";import"./Skeleton-_C6qiOOr.js";import"./context-BodU5NN8.js";import"./PurePanel-CuHF6Qyt.js";const Ie={title:"Feedback/Modal",component:s,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente modal para mostrar contenido en una capa flotante sobre la página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para mostrar información importante que requiere atención inmediata del usuario.
- Para confirmaciones, formularios o contenido que necesita el foco completo del usuario.
        `}}},argTypes:{centered:{control:"boolean"},closable:{control:"boolean"},maskClosable:{control:"boolean"},width:{control:"number"}}},i={render:()=>{const[t,n]=r.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"primary",onClick:()=>n(!0),children:"Open Modal"}),e.jsxs(s,{title:"Basic Modal",open:t,onOk:()=>n(!1),onCancel:()=>n(!1),children:[e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."})]})]})}},c={render:()=>{const[t,n]=r.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"primary",onClick:()=>n(!0),children:"Open Centered Modal"}),e.jsxs(s,{title:"Centered Modal",centered:!0,open:t,onOk:()=>n(!1),onCancel:()=>n(!1),children:[e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."})]})]})}},p={render:()=>{const[t,n]=r.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"primary",onClick:()=>n(!0),children:"Open Modal with custom footer"}),e.jsxs(s,{title:"Modal with custom footer",open:t,onCancel:()=>n(!1),footer:[e.jsx(o,{onClick:()=>n(!1),children:"Return"},"back"),e.jsx(o,{type:"primary",onClick:()=>n(!1),children:"Submit"},"submit")],children:[e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."})]})]})}},l={render:()=>{const[t,n]=r.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"primary",onClick:()=>n(!0),children:"Open Modal without footer"}),e.jsxs(s,{title:"Modal without footer",open:t,onCancel:()=>n(!1),footer:null,children:[e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."}),e.jsx("p",{children:"Some contents..."})]})]})}},m={render:()=>e.jsxs(q,{children:[e.jsx(o,{onClick:()=>{a.confirm({title:"Do you want to delete these items?",content:"Some descriptions",onOk(){console.log("OK")},onCancel(){console.log("Cancel")}})},children:"Confirm"}),e.jsx(o,{onClick:()=>{a.success({title:"This is a success message",content:"Some descriptions"})},children:"Success"}),e.jsx(o,{onClick:()=>{a.error({title:"This is an error message",content:"Some descriptions"})},children:"Error"}),e.jsx(o,{onClick:()=>{a.warning({title:"This is a warning message",content:"Some descriptions"})},children:"Warning"}),e.jsx(o,{onClick:()=>{a.info({title:"This is an info message",content:"Some descriptions"})},children:"Info"})]})},d={render:()=>{const[t,n]=r.useState(!1),[E,u]=r.useState(!1),D=()=>{n(!0)},P=()=>{u(!0),setTimeout(()=>{n(!1),u(!1)},2e3)},R=()=>{n(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"primary",onClick:D,children:"Open Modal with async logic"}),e.jsx(s,{title:"Title",open:t,onOk:P,confirmLoading:E,onCancel:R,children:e.jsx("p",{children:"Some contents..."})})]})}};var f,h,C;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Modal\r
        </Button>\r
        <Modal title="Basic Modal" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
        </Modal>\r
      </>;
  }
}`,...(C=(h=i.parameters)==null?void 0:h.docs)==null?void 0:C.source}}};var S,O,g;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Centered Modal\r
        </Button>\r
        <Modal title="Centered Modal" centered open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
        </Modal>\r
      </>;
  }
}`,...(g=(O=c.parameters)==null?void 0:O.docs)==null?void 0:g.source}}};var M,x,k;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Modal with custom footer\r
        </Button>\r
        <Modal title="Modal with custom footer" open={open} onCancel={() => setOpen(false)} footer={[<Button key="back" onClick={() => setOpen(false)}>\r
              Return\r
            </Button>, <Button key="submit" type="primary" onClick={() => setOpen(false)}>\r
              Submit\r
            </Button>]}>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
        </Modal>\r
      </>;
  }
}`,...(k=(x=p.parameters)==null?void 0:x.docs)==null?void 0:k.source}}};var j,y,B;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Modal without footer\r
        </Button>\r
        <Modal title="Modal without footer" open={open} onCancel={() => setOpen(false)} footer={null}>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
          <p>Some contents...</p>\r
        </Modal>\r
      </>;
  }
}`,...(B=(y=l.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var w,b,T;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Space>\r
      <Button onClick={() => {
      AntModal.confirm({
        title: 'Do you want to delete these items?',
        content: 'Some descriptions',
        onOk() {
          console.log('OK');
        },
        onCancel() {
          console.log('Cancel');
        }
      });
    }}>\r
        Confirm\r
      </Button>\r
      <Button onClick={() => {
      AntModal.success({
        title: 'This is a success message',
        content: 'Some descriptions'
      });
    }}>\r
        Success\r
      </Button>\r
      <Button onClick={() => {
      AntModal.error({
        title: 'This is an error message',
        content: 'Some descriptions'
      });
    }}>\r
        Error\r
      </Button>\r
      <Button onClick={() => {
      AntModal.warning({
        title: 'This is a warning message',
        content: 'Some descriptions'
      });
    }}>\r
        Warning\r
      </Button>\r
      <Button onClick={() => {
      AntModal.info({
        title: 'This is an info message',
        content: 'Some descriptions'
      });
    }}>\r
        Info\r
      </Button>\r
    </Space>
}`,...(T=(b=m.parameters)==null?void 0:b.docs)==null?void 0:T.source}}};var A,F,L;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showModal = () => {
      setOpen(true);
    };
    const handleOk = () => {
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    };
    const handleCancel = () => {
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={showModal}>\r
          Open Modal with async logic\r
        </Button>\r
        <Modal title="Title" open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>\r
          <p>Some contents...</p>\r
        </Modal>\r
      </>;
  }
}`,...(L=(F=d.parameters)==null?void 0:F.docs)==null?void 0:L.source}}};const Ke=["Basic","Centered","CustomFooter","NoFooter","ConfirmModal","AsyncClose"];export{d as AsyncClose,i as Basic,c as Centered,m as ConfirmModal,p as CustomFooter,l as NoFooter,Ke as __namedExportsOrder,Ie as default};
