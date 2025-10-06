import{r as a,C as yt,M as Rt,c as U,b as zt,j as e}from"./iframe-Dz2LC5nm.js";import{R as Ct}from"./ExclamationCircleFilled-CePF5EWt.js";import{u as Wt}from"./useMergedState-DIkF75NH.js";import{o as Lt}from"./omit-DXgDXInf.js";import{P as $t}from"./index-CvhfbWpJ.js";import{A as Yt}from"./ActionButton-twpzoIEc.js";import{g as X,P as Et}from"./PurePanel-DhLbvPdD.js";import{B as i,c as qt}from"./button-D6Z5Xr5r.js";import{g as _t}from"./genStyleUtils-BYYxHtb1.js";import{u as Ht}from"./useLocale-i3AsUBCw.js";import{S as l}from"./index-_UlGzK8j.js";import{R as Kt}from"./QuestionCircleOutlined-zQ108Gd6.js";import{R as Vt}from"./ExclamationCircleOutlined-DA0mZDgg.js";import{R as Ut}from"./CloseCircleOutlined-Dv2F_UF1.js";import{R as Tt}from"./DeleteOutlined-DUgNAhX4.js";import{T as Mt}from"./index-CWlopGM_.js";import{S as Qt}from"./index-ORKdBOW3.js";import{D as F}from"./index-CdNgG1lA.js";import{s as d}from"./index-DLQBJbbx.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./KeyCode-HJ8jGXz0.js";import"./motion-Ct_bxEw8.js";import"./reactNode-B7JGm4rf.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./index-BKBr2mfS.js";import"./LoadingOutlined-BrYRsAZK.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./pickAttrs-C7BJ3CXo.js";import"./collapse-BbEVqHco.js";import"./compact-item-BQH2bmb8.js";import"./styleChecker-LD4ekl8e.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./useVariants-CQySXX5A.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-CJ7UoYAk.js";import"./toList-CER2sblB.js";import"./CheckOutlined-BbyNuZCI.js";import"./context-BN0WhDpa.js";import"./useMessage-CUGQcdTE.js";import"./CloseOutlined-Uef9iQNA.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./InfoCircleFilled-CWRJK2Dg.js";const Xt=t=>{const{componentCls:o,iconCls:r,antCls:n,zIndexPopup:c,colorText:x,colorWarning:f,marginXXS:h,marginXS:g,fontSize:v,fontWeightStrong:j,colorTextHeading:b}=t;return{[o]:{zIndex:c,[`&${n}-popover`]:{fontSize:v},[`${o}-message`]:{marginBottom:g,display:"flex",flexWrap:"nowrap",alignItems:"start",[`> ${o}-message-icon ${r}`]:{color:f,fontSize:v,lineHeight:1,marginInlineEnd:g},[`${o}-title`]:{fontWeight:j,color:b,"&:only-child":{fontWeight:"normal"}},[`${o}-description`]:{marginTop:h,color:x}},[`${o}-buttons`]:{textAlign:"end",whiteSpace:"nowrap",button:{marginInlineStart:g}}}}},Ft=t=>{const{zIndexPopupBase:o}=t;return{zIndexPopup:o+60}},vt=_t("Popconfirm",t=>Xt(t),Ft,{resetStyle:!1});var Gt=function(t,o){var r={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&o.indexOf(n)<0&&(r[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var c=0,n=Object.getOwnPropertySymbols(t);c<n.length;c++)o.indexOf(n[c])<0&&Object.prototype.propertyIsEnumerable.call(t,n[c])&&(r[n[c]]=t[n[c]]);return r};const bt=t=>{const{prefixCls:o,okButtonProps:r,cancelButtonProps:n,title:c,description:x,cancelText:f,okText:h,okType:g="primary",icon:v=a.createElement(Ct,null),showCancel:j=!0,close:b,onConfirm:P,onCancel:H,onPopupClick:y}=t,{getPrefixCls:C}=a.useContext(yt),[T]=Ht("Popconfirm",Rt.Popconfirm),E=X(c),q=X(x);return a.createElement("div",{className:`${o}-inner-content`,onClick:y},a.createElement("div",{className:`${o}-message`},v&&a.createElement("span",{className:`${o}-message-icon`},v),a.createElement("div",{className:`${o}-message-text`},E&&a.createElement("div",{className:`${o}-title`},E),q&&a.createElement("div",{className:`${o}-description`},q))),a.createElement("div",{className:`${o}-buttons`},j&&a.createElement(i,Object.assign({onClick:H,size:"small"},n),f||(T==null?void 0:T.cancelText)),a.createElement(Yt,{buttonProps:Object.assign(Object.assign({size:"small"},qt(g)),r),actionFn:P,close:b,prefixCls:C("btn"),quitOnNullishReturnValue:!0,emitEvent:!0},h||(T==null?void 0:T.okText))))},Jt=t=>{const{prefixCls:o,placement:r,className:n,style:c}=t,x=Gt(t,["prefixCls","placement","className","style"]),{getPrefixCls:f}=a.useContext(yt),h=f("popconfirm",o),[g]=vt(h);return g(a.createElement(Et,{placement:r,className:U(h,n),style:c,content:a.createElement(bt,Object.assign({prefixCls:h},x))}))};var Zt=function(t,o){var r={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&o.indexOf(n)<0&&(r[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var c=0,n=Object.getOwnPropertySymbols(t);c<n.length;c++)o.indexOf(n[c])<0&&Object.prototype.propertyIsEnumerable.call(t,n[c])&&(r[n[c]]=t[n[c]]);return r};const eo=a.forwardRef((t,o)=>{var r,n;const{prefixCls:c,placement:x="top",trigger:f="click",okType:h="primary",icon:g=a.createElement(Ct,null),children:v,overlayClassName:j,onOpenChange:b,onVisibleChange:P,overlayStyle:H,styles:y,classNames:C}=t,T=Zt(t,["prefixCls","placement","trigger","okType","icon","children","overlayClassName","onOpenChange","onVisibleChange","overlayStyle","styles","classNames"]),{getPrefixCls:E,className:q,style:jt,classNames:M,styles:Q}=zt("popconfirm"),[Pt,St]=Wt(!1,{value:(r=t.open)!==null&&r!==void 0?r:t.visible,defaultValue:(n=t.defaultOpen)!==null&&n!==void 0?n:t.defaultVisible}),K=(p,u)=>{St(p,!0),P==null||P(p),b==null||b(p,u)},Bt=p=>{K(!1,p)},kt=p=>{var u;return(u=t.onConfirm)===null||u===void 0?void 0:u.call(void 0,p)},wt=p=>{var u;K(!1,p),(u=t.onCancel)===null||u===void 0||u.call(void 0,p)},At=(p,u)=>{const{disabled:It=!1}=t;It||K(p,u)},V=E("popconfirm",c),Dt=U(V,q,j,M.root,C==null?void 0:C.root),Ot=U(M.body,C==null?void 0:C.body),[Nt]=vt(V);return Nt(a.createElement($t,Object.assign({},Lt(T,["title"]),{trigger:f,placement:x,onOpenChange:At,open:Pt,ref:o,classNames:{root:Dt,body:Ot},styles:{root:Object.assign(Object.assign(Object.assign(Object.assign({},Q.root),jt),H),y==null?void 0:y.root),body:Object.assign(Object.assign({},Q.body),y==null?void 0:y.body)},content:a.createElement(bt,Object.assign({okType:h,icon:g},t,{prefixCls:V,close:Bt,onConfirm:kt,onCancel:wt})),"data-popover-inject":!0}),v))}),s=eo;s._InternalPanelDoNotUseOrYouWillBeFired=Jt;const{Text:m,Paragraph:_}=Mt,Tn={title:"Overlay/Popconfirm",component:s,tags:["autodocs"],parameters:{docs:{description:{component:`
Confirmación emergente simple que solicita confirmación del usuario antes de ejecutar una acción.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/popconfirm)
- [🎨 API de Props](https://ant.design/components/popconfirm#api)
- [💡 Ejemplos](https://ant.design/components/popconfirm#examples)

## Cuándo usar

- Para confirmaciones rápidas de acciones destructivas
- Cuando necesitas confirmación sin interrumpir el flujo con un modal
- Para eliminar, desactivar, o ejecutar acciones que requieren confirmación
        `}}},argTypes:{placement:{control:"select",options:["top","left","right","bottom","topLeft","topRight","bottomLeft","bottomRight","leftTop","leftBottom","rightTop","rightBottom"]},okType:{control:"select",options:["primary","default","dashed","text","link"]}}},S={render:()=>{const t=()=>{d.success("Action confirmed")},o=()=>{d.error("Action cancelled")};return e.jsx(s,{title:"Delete the task",description:"Are you sure to delete this task?",onConfirm:t,onCancel:o,okText:"Yes",cancelText:"No",children:e.jsx(i,{danger:!0,children:"Delete"})})}},B={render:()=>{const t=()=>{d.success("Confirmed")};return e.jsxs("div",{style:{padding:"50px"},children:[e.jsx("div",{style:{marginBottom:16,textAlign:"center"},children:e.jsxs(l,{size:"small",children:[e.jsx(s,{title:"Are you sure?",placement:"topLeft",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"TL"})}),e.jsx(s,{title:"Are you sure?",placement:"top",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"Top"})}),e.jsx(s,{title:"Are you sure?",placement:"topRight",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"TR"})})]})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:16},children:[e.jsxs(l,{direction:"vertical",size:"small",children:[e.jsx(s,{title:"Are you sure?",placement:"leftTop",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"LT"})}),e.jsx(s,{title:"Are you sure?",placement:"left",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"Left"})}),e.jsx(s,{title:"Are you sure?",placement:"leftBottom",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"LB"})})]}),e.jsxs(l,{direction:"vertical",size:"small",children:[e.jsx(s,{title:"Are you sure?",placement:"rightTop",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"RT"})}),e.jsx(s,{title:"Are you sure?",placement:"right",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"Right"})}),e.jsx(s,{title:"Are you sure?",placement:"rightBottom",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"RB"})})]})]}),e.jsx("div",{style:{textAlign:"center"},children:e.jsxs(l,{size:"small",children:[e.jsx(s,{title:"Are you sure?",placement:"bottomLeft",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"BL"})}),e.jsx(s,{title:"Are you sure?",placement:"bottom",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"Bottom"})}),e.jsx(s,{title:"Are you sure?",placement:"bottomRight",onConfirm:t,okText:"Yes",cancelText:"No",children:e.jsx(i,{style:{width:100},children:"BR"})})]})})]})}},k={render:()=>{const t=()=>{d.success("Deleted successfully")};return e.jsxs(l,{wrap:!0,size:"large",children:[e.jsx(s,{title:"Delete this item?",description:"This action cannot be undone.",onConfirm:t,okText:"Delete",cancelText:"Cancel",okType:"danger",children:e.jsx(i,{danger:!0,children:"Danger OK Button"})}),e.jsx(s,{title:"Save changes?",description:"Do you want to save your changes?",onConfirm:t,okText:"Save",cancelText:"Discard",okType:"primary",children:e.jsx(i,{type:"primary",children:"Primary OK Button"})}),e.jsx(s,{title:"Continue?",description:"Are you sure you want to continue?",onConfirm:t,okText:"Proceed",cancelText:"Go Back",okType:"default",children:e.jsx(i,{children:"Default OK Button"})})]})}},w={render:()=>{const t=()=>{d.success("Action completed")};return e.jsxs(l,{wrap:!0,size:"large",children:[e.jsx(s,{title:"Are you sure?",description:"This is a question.",icon:e.jsx(Kt,{style:{color:"#1890ff"}}),onConfirm:t,children:e.jsx(i,{children:"Question Icon"})}),e.jsx(s,{title:"Warning!",description:"This action requires attention.",icon:e.jsx(Vt,{style:{color:"#faad14"}}),onConfirm:t,children:e.jsx(i,{children:"Warning Icon"})}),e.jsx(s,{title:"Delete item?",description:"This action cannot be undone.",icon:e.jsx(Ut,{style:{color:"#ff4d4f"}}),onConfirm:t,okType:"danger",children:e.jsx(i,{danger:!0,children:"Error Icon"})})]})}},A={render:()=>{const t=()=>{d.success("Confirmed")};return e.jsx(s,{title:"Continue with this action?",description:"This confirmation has no icon.",icon:null,onConfirm:t,okText:"Continue",cancelText:"Cancel",children:e.jsx(i,{type:"primary",children:"No Icon"})})}},D={render:()=>{const[t,o]=a.useState(!1),r=()=>{o(!0),setTimeout(()=>{o(!1),d.success("Action completed successfully")},2e3)};return e.jsx(s,{title:"Delete this record?",description:"This will permanently delete the record from the database.",onConfirm:r,okText:"Delete",cancelText:"Cancel",okType:"danger",okButtonProps:{loading:t},children:e.jsx(i,{danger:!0,icon:e.jsx(Tt,{}),children:"Delete Record"})})}},O={render:()=>{const[t,o]=a.useState(!0),r=()=>{t||d.info("Action executed without confirmation")},n=()=>{d.success("Action confirmed and executed")};return e.jsxs(l,{direction:"vertical",size:"large",children:[e.jsxs(l,{children:[e.jsx(m,{children:"Require confirmation:"}),e.jsx(Qt,{checked:t,onChange:o})]}),e.jsx(s,{title:"Execute this action?",description:"Are you sure you want to proceed?",onConfirm:n,disabled:!t,children:e.jsx(i,{type:"primary",onClick:r,children:"Execute Action"})}),e.jsx(m,{type:"secondary",children:t?"Confirmation required before action":"Action executes immediately"})]})}},N={render:()=>{const[t,o]=a.useState(["Item 1","Item 2","Item 3","Item 4"]),r=n=>{const c=t.filter((x,f)=>f!==n);o(c),d.success("Item deleted successfully")};return e.jsxs(l,{direction:"vertical",size:"middle",style:{width:"100%"},children:[e.jsxs(m,{strong:!0,children:["Items (",t.length,")"]}),t.map((n,c)=>e.jsxs("div",{style:{padding:"12px 16px",border:"1px solid #d9d9d9",borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx(m,{children:n}),e.jsx(s,{title:"Delete this item?",description:"This action cannot be undone.",onConfirm:()=>r(c),okText:"Delete",cancelText:"Cancel",okType:"danger",children:e.jsx(i,{danger:!0,size:"small",icon:e.jsx(Tt,{}),children:"Delete"})})]},c))]})}},I={render:()=>{const[t,o]=a.useState(3),r=()=>{d.success(`${t} items deleted successfully`),o(0)};return e.jsxs(l,{direction:"vertical",size:"large",children:[e.jsx("div",{style:{padding:16,background:"#f5f5f5",borderRadius:4},children:e.jsxs(m,{children:[t," items selected"]})}),e.jsx(s,{title:`Delete ${t} items?`,description:`Are you sure you want to delete ${t} selected items? This action cannot be undone.`,onConfirm:r,okText:"Delete All",cancelText:"Cancel",okType:"danger",disabled:t===0,children:e.jsxs(i,{danger:!0,disabled:t===0,children:["Delete Selected (",t,")"]})})]})}},R={render:()=>{const[t,o]=a.useState("active"),r=()=>{const n=t==="active"?"inactive":"active";o(n),d.success(`Status changed to ${n}`)};return e.jsxs(l,{direction:"vertical",size:"large",children:[e.jsx("div",{style:{padding:16,border:"1px solid #d9d9d9",borderRadius:4},children:e.jsxs(l,{children:[e.jsx(m,{strong:!0,children:"Current Status:"}),e.jsx(m,{style:{color:t==="active"?"#52c41a":"#ff4d4f",textTransform:"uppercase"},children:t})]})}),e.jsx(s,{title:`Change status to ${t==="active"?"inactive":"active"}?`,description:"This will affect the service availability.",onConfirm:r,okText:"Change Status",cancelText:"Keep Current",children:e.jsx(i,{children:t==="active"?"Deactivate":"Activate"})})]})}},z={render:()=>{const t=()=>{d.info("Logging out..."),setTimeout(()=>{d.success("You have been logged out")},1e3)};return e.jsx(s,{title:"Logout from account?",description:"You will need to login again to access your account.",onConfirm:t,okText:"Logout",cancelText:"Stay",okType:"primary",children:e.jsx(i,{children:"Logout"})})}},W={render:()=>{const[t,o]=a.useState(!0),r=()=>{o(!1),d.warning("Changes discarded")},n=c=>{o(c.target.value.length>0)};return e.jsxs(l,{direction:"vertical",size:"large",style:{width:400},children:[e.jsxs("div",{children:[e.jsx(m,{strong:!0,children:"Edit Content"}),e.jsx("textarea",{style:{width:"100%",minHeight:100,marginTop:8,padding:8,borderRadius:4,border:"1px solid #d9d9d9"},placeholder:"Type something...",onChange:n})]}),e.jsxs(l,{children:[e.jsx(i,{type:"primary",children:"Save"}),e.jsx(s,{title:"Discard unsaved changes?",description:"Your changes will be lost if you don't save them.",onConfirm:r,okText:"Discard",cancelText:"Keep Editing",okType:"danger",disabled:!t,children:e.jsx(i,{disabled:!t,children:"Discard"})})]}),t&&e.jsx(m,{type:"warning",children:"You have unsaved changes"})]})}},L={render:()=>{const[t,o]=a.useState(!1),r=()=>{o(!0),setTimeout(()=>{o(!1),d.success("Payment processed successfully")},2e3)};return e.jsxs(l,{direction:"vertical",size:"large",children:[e.jsx("div",{style:{padding:20,border:"2px solid #1890ff",borderRadius:8,background:"#f0f5ff"},children:e.jsxs(l,{direction:"vertical",children:[e.jsx(m,{strong:!0,style:{fontSize:16},children:"Order Summary"}),e.jsx(F,{style:{margin:"8px 0"}}),e.jsxs(l,{style:{width:"100%",justifyContent:"space-between"},children:[e.jsx(m,{children:"Subtotal:"}),e.jsx(m,{strong:!0,children:"$99.99"})]}),e.jsxs(l,{style:{width:"100%",justifyContent:"space-between"},children:[e.jsx(m,{children:"Tax:"}),e.jsx(m,{strong:!0,children:"$8.00"})]}),e.jsx(F,{style:{margin:"8px 0"}}),e.jsxs(l,{style:{width:"100%",justifyContent:"space-between"},children:[e.jsx(m,{strong:!0,children:"Total:"}),e.jsx(m,{strong:!0,style:{fontSize:18,color:"#1890ff"},children:"$107.99"})]})]})}),e.jsx(s,{title:"Confirm payment?",description:e.jsxs("div",{children:[e.jsxs(_,{style:{marginBottom:4},children:["You will be charged ",e.jsx("strong",{children:"$107.99"})]}),e.jsx(_,{style:{marginBottom:0},children:"This action cannot be undone."})]}),onConfirm:r,okText:"Pay Now",cancelText:"Cancel",okType:"primary",okButtonProps:{loading:t},children:e.jsx(i,{type:"primary",size:"large",block:!0,children:"Complete Purchase"})})]})}},$={render:()=>{const[t,o]=a.useState(!1),r=()=>{d.success("Confirmed"),o(!1)},n=()=>{d.error("Cancelled"),o(!1)};return e.jsxs(l,{direction:"vertical",size:"large",children:[e.jsxs(l,{children:[e.jsx(i,{onClick:()=>o(!t),children:"Toggle from outside"}),e.jsxs(m,{type:"secondary",children:["Popconfirm is ",t?"open":"closed"]})]}),e.jsx(s,{title:"Controlled confirmation",description:"This popconfirm can be controlled externally.",open:t,onConfirm:r,onCancel:n,onOpenChange:o,children:e.jsx(i,{type:"primary",children:"Controlled Popconfirm"})})]})}},Y={render:()=>{const t=()=>{d.success("Account deleted")};return e.jsx(s,{title:"Delete your account?",description:e.jsxs("div",{style:{maxWidth:250},children:[e.jsx(_,{style:{marginBottom:8},children:"This will permanently delete your account and all associated data."}),e.jsx(_,{style:{marginBottom:0},type:"secondary",children:"This action cannot be undone and you will lose access to all your content."})]}),onConfirm:t,okText:"Delete Account",cancelText:"Cancel",okType:"danger",children:e.jsx(i,{danger:!0,children:"Delete Account"})})}};var G,J,Z,ee,te;S.parameters={...S.parameters,docs:{...(G=S.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Action confirmed');
    };
    const cancel = () => {
      message.error('Action cancelled');
    };
    return <Popconfirm title="Delete the task" description="Are you sure to delete this task?" onConfirm={confirm} onCancel={cancel} okText="Yes" cancelText="No">\r
        <Button danger>Delete</Button>\r
      </Popconfirm>;
  }
}`,...(Z=(J=S.parameters)==null?void 0:J.docs)==null?void 0:Z.source},description:{story:`Basic confirmation popover.\r
Use for simple yes/no confirmations before destructive actions.`,...(te=(ee=S.parameters)==null?void 0:ee.docs)==null?void 0:te.description}}};var oe,ne,re,ie,se;B.parameters={...B.parameters,docs:{...(oe=B.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Confirmed');
    };
    const buttonWidth = 100;
    return <div style={{
      padding: '50px'
    }}>\r
        <div style={{
        marginBottom: 16,
        textAlign: 'center'
      }}>\r
          <Space size="small">\r
            <Popconfirm title="Are you sure?" placement="topLeft" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>TL</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="top" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>Top</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="topRight" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>TR</Button>\r
            </Popconfirm>\r
          </Space>\r
        </div>\r
\r
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>\r
          <Space direction="vertical" size="small">\r
            <Popconfirm title="Are you sure?" placement="leftTop" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>LT</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="left" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>Left</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="leftBottom" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>LB</Button>\r
            </Popconfirm>\r
          </Space>\r
\r
          <Space direction="vertical" size="small">\r
            <Popconfirm title="Are you sure?" placement="rightTop" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>RT</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="right" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>Right</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="rightBottom" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>RB</Button>\r
            </Popconfirm>\r
          </Space>\r
        </div>\r
\r
        <div style={{
        textAlign: 'center'
      }}>\r
          <Space size="small">\r
            <Popconfirm title="Are you sure?" placement="bottomLeft" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>BL</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="bottom" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>Bottom</Button>\r
            </Popconfirm>\r
            <Popconfirm title="Are you sure?" placement="bottomRight" onConfirm={confirm} okText="Yes" cancelText="No">\r
              <Button style={{
              width: buttonWidth
            }}>BR</Button>\r
            </Popconfirm>\r
          </Space>\r
        </div>\r
      </div>;
  }
}`,...(re=(ne=B.parameters)==null?void 0:ne.docs)==null?void 0:re.source},description:{story:`Different placements for the confirmation popup.\r
Choose placement based on available space and UI layout.`,...(se=(ie=B.parameters)==null?void 0:ie.docs)==null?void 0:se.description}}};var ce,ae,le,de,me;k.parameters={...k.parameters,docs:{...(ce=k.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Deleted successfully');
    };
    return <Space wrap size="large">\r
        <Popconfirm title="Delete this item?" description="This action cannot be undone." onConfirm={confirm} okText="Delete" cancelText="Cancel" okType="danger">\r
          <Button danger>Danger OK Button</Button>\r
        </Popconfirm>\r
\r
        <Popconfirm title="Save changes?" description="Do you want to save your changes?" onConfirm={confirm} okText="Save" cancelText="Discard" okType="primary">\r
          <Button type="primary">Primary OK Button</Button>\r
        </Popconfirm>\r
\r
        <Popconfirm title="Continue?" description="Are you sure you want to continue?" onConfirm={confirm} okText="Proceed" cancelText="Go Back" okType="default">\r
          <Button>Default OK Button</Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(le=(ae=k.parameters)==null?void 0:ae.docs)==null?void 0:le.source},description:{story:`Custom button text and types.\r
Customize the OK and Cancel button appearance.`,...(me=(de=k.parameters)==null?void 0:de.docs)==null?void 0:me.description}}};var pe,ue,fe,he,ge;w.parameters={...w.parameters,docs:{...(pe=w.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Action completed');
    };
    return <Space wrap size="large">\r
        <Popconfirm title="Are you sure?" description="This is a question." icon={<QuestionCircleOutlined style={{
        color: '#1890ff'
      }} />} onConfirm={confirm}>\r
          <Button>Question Icon</Button>\r
        </Popconfirm>\r
\r
        <Popconfirm title="Warning!" description="This action requires attention." icon={<ExclamationCircleOutlined style={{
        color: '#faad14'
      }} />} onConfirm={confirm}>\r
          <Button>Warning Icon</Button>\r
        </Popconfirm>\r
\r
        <Popconfirm title="Delete item?" description="This action cannot be undone." icon={<CloseCircleOutlined style={{
        color: '#ff4d4f'
      }} />} onConfirm={confirm} okType="danger">\r
          <Button danger>Error Icon</Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(fe=(ue=w.parameters)==null?void 0:ue.docs)==null?void 0:fe.source},description:{story:`Custom icons for different confirmation types.\r
Use appropriate icons to communicate the action severity.`,...(ge=(he=w.parameters)==null?void 0:he.docs)==null?void 0:ge.description}}};var xe,ye,Ce,Te,ve;A.parameters={...A.parameters,docs:{...(xe=A.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Confirmed');
    };
    return <Popconfirm title="Continue with this action?" description="This confirmation has no icon." icon={null} onConfirm={confirm} okText="Continue" cancelText="Cancel">\r
        <Button type="primary">No Icon</Button>\r
      </Popconfirm>;
  }
}`,...(Ce=(ye=A.parameters)==null?void 0:ye.docs)==null?void 0:Ce.source},description:{story:`Popconfirm without icon.\r
Clean, minimal confirmation style.`,...(ve=(Te=A.parameters)==null?void 0:Te.docs)==null?void 0:ve.description}}};var be,je,Pe,Se,Be;D.parameters={...D.parameters,docs:{...(be=D.parameters)==null?void 0:be.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    const confirm = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        message.success('Action completed successfully');
      }, 2000);
    };
    return <Popconfirm title="Delete this record?" description="This will permanently delete the record from the database." onConfirm={confirm} okText="Delete" cancelText="Cancel" okType="danger" okButtonProps={{
      loading
    }}>\r
        <Button danger icon={<DeleteOutlined />}>\r
          Delete Record\r
        </Button>\r
      </Popconfirm>;
  }
}`,...(Pe=(je=D.parameters)==null?void 0:je.docs)==null?void 0:Pe.source},description:{story:`Async confirmation with loading state.\r
Use when confirmation triggers an API call or async operation.`,...(Be=(Se=D.parameters)==null?void 0:Se.docs)==null?void 0:Be.description}}};var ke,we,Ae,De,Oe;O.parameters={...O.parameters,docs:{...(ke=O.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  render: () => {
    const [requiresConfirmation, setRequiresConfirmation] = useState(true);
    const handleClick = () => {
      if (!requiresConfirmation) {
        message.info('Action executed without confirmation');
      }
    };
    const confirm = () => {
      message.success('Action confirmed and executed');
    };
    return <Space direction="vertical" size="large">\r
        <Space>\r
          <Text>Require confirmation:</Text>\r
          <Switch checked={requiresConfirmation} onChange={setRequiresConfirmation} />\r
        </Space>\r
\r
        <Popconfirm title="Execute this action?" description="Are you sure you want to proceed?" onConfirm={confirm} disabled={!requiresConfirmation}>\r
          <Button type="primary" onClick={handleClick}>\r
            Execute Action\r
          </Button>\r
        </Popconfirm>\r
\r
        <Text type="secondary">\r
          {requiresConfirmation ? 'Confirmation required before action' : 'Action executes immediately'}\r
        </Text>\r
      </Space>;
  }
}`,...(Ae=(we=O.parameters)==null?void 0:we.docs)==null?void 0:Ae.source},description:{story:`Conditional trigger for Popconfirm.\r
Show confirmation only under certain conditions.`,...(Oe=(De=O.parameters)==null?void 0:De.docs)==null?void 0:Oe.description}}};var Ne,Ie,Re,ze,We;N.parameters={...N.parameters,docs:{...(Ne=N.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
    const deleteItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      message.success('Item deleted successfully');
    };
    return <Space direction="vertical" size="middle" style={{
      width: '100%'
    }}>\r
        <Text strong>Items ({items.length})</Text>\r
        {items.map((item, index) => <div key={index} style={{
        padding: '12px 16px',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>\r
            <Text>{item}</Text>\r
            <Popconfirm title="Delete this item?" description="This action cannot be undone." onConfirm={() => deleteItem(index)} okText="Delete" cancelText="Cancel" okType="danger">\r
              <Button danger size="small" icon={<DeleteOutlined />}>\r
                Delete\r
              </Button>\r
            </Popconfirm>\r
          </div>)}\r
      </Space>;
  }
}`,...(Re=(Ie=N.parameters)==null?void 0:Ie.docs)==null?void 0:Re.source},description:{story:`Delete confirmation pattern.\r
Common pattern for delete operations.`,...(We=(ze=N.parameters)==null?void 0:ze.docs)==null?void 0:We.description}}};var Le,$e,Ye,Ee,qe;I.parameters={...I.parameters,docs:{...(Le=I.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  render: () => {
    const [selectedCount, setSelectedCount] = useState(3);
    const confirmBatchDelete = () => {
      message.success(\`\${selectedCount} items deleted successfully\`);
      setSelectedCount(0);
    };
    return <Space direction="vertical" size="large">\r
        <div style={{
        padding: 16,
        background: '#f5f5f5',
        borderRadius: 4
      }}>\r
          <Text>{selectedCount} items selected</Text>\r
        </div>\r
\r
        <Popconfirm title={\`Delete \${selectedCount} items?\`} description={\`Are you sure you want to delete \${selectedCount} selected items? This action cannot be undone.\`} onConfirm={confirmBatchDelete} okText="Delete All" cancelText="Cancel" okType="danger" disabled={selectedCount === 0}>\r
          <Button danger disabled={selectedCount === 0}>\r
            Delete Selected ({selectedCount})\r
          </Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(Ye=($e=I.parameters)==null?void 0:$e.docs)==null?void 0:Ye.source},description:{story:`Batch action confirmation.\r
Confirm bulk operations on multiple items.`,...(qe=(Ee=I.parameters)==null?void 0:Ee.docs)==null?void 0:qe.description}}};var _e,He,Ke,Ve,Ue;R.parameters={...R.parameters,docs:{...(_e=R.parameters)==null?void 0:_e.docs,source:{originalSource:`{
  render: () => {
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const confirmStatusChange = () => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      setStatus(newStatus);
      message.success(\`Status changed to \${newStatus}\`);
    };
    return <Space direction="vertical" size="large">\r
        <div style={{
        padding: 16,
        border: '1px solid #d9d9d9',
        borderRadius: 4
      }}>\r
          <Space>\r
            <Text strong>Current Status:</Text>\r
            <Text style={{
            color: status === 'active' ? '#52c41a' : '#ff4d4f',
            textTransform: 'uppercase'
          }}>\r
              {status}\r
            </Text>\r
          </Space>\r
        </div>\r
\r
        <Popconfirm title={\`Change status to \${status === 'active' ? 'inactive' : 'active'}?\`} description="This will affect the service availability." onConfirm={confirmStatusChange} okText="Change Status" cancelText="Keep Current">\r
          <Button>{status === 'active' ? 'Deactivate' : 'Activate'}</Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(Ke=(He=R.parameters)==null?void 0:He.docs)==null?void 0:Ke.source},description:{story:`Status change confirmation.\r
Confirm before changing important status values.`,...(Ue=(Ve=R.parameters)==null?void 0:Ve.docs)==null?void 0:Ue.description}}};var Me,Qe,Xe,Fe,Ge;z.parameters={...z.parameters,docs:{...(Me=z.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  render: () => {
    const confirmLogout = () => {
      message.info('Logging out...');
      setTimeout(() => {
        message.success('You have been logged out');
      }, 1000);
    };
    return <Popconfirm title="Logout from account?" description="You will need to login again to access your account." onConfirm={confirmLogout} okText="Logout" cancelText="Stay" okType="primary">\r
        <Button>Logout</Button>\r
      </Popconfirm>;
  }
}`,...(Xe=(Qe=z.parameters)==null?void 0:Qe.docs)==null?void 0:Xe.source},description:{story:`Logout confirmation pattern.\r
Confirm before logging out or ending session.`,...(Ge=(Fe=z.parameters)==null?void 0:Fe.docs)==null?void 0:Ge.description}}};var Je,Ze,et,tt,ot;W.parameters={...W.parameters,docs:{...(Je=W.parameters)==null?void 0:Je.docs,source:{originalSource:`{
  render: () => {
    const [hasChanges, setHasChanges] = useState(true);
    const confirmDiscard = () => {
      setHasChanges(false);
      message.warning('Changes discarded');
    };
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasChanges(e.target.value.length > 0);
    };
    return <Space direction="vertical" size="large" style={{
      width: 400
    }}>\r
        <div>\r
          <Text strong>Edit Content</Text>\r
          <textarea style={{
          width: '100%',
          minHeight: 100,
          marginTop: 8,
          padding: 8,
          borderRadius: 4,
          border: '1px solid #d9d9d9'
        }} placeholder="Type something..." onChange={handleTextChange} />\r
        </div>\r
\r
        <Space>\r
          <Button type="primary">Save</Button>\r
          <Popconfirm title="Discard unsaved changes?" description="Your changes will be lost if you don't save them." onConfirm={confirmDiscard} okText="Discard" cancelText="Keep Editing" okType="danger" disabled={!hasChanges}>\r
            <Button disabled={!hasChanges}>Discard</Button>\r
          </Popconfirm>\r
        </Space>\r
\r
        {hasChanges && <Text type="warning">You have unsaved changes</Text>}\r
      </Space>;
  }
}`,...(et=(Ze=W.parameters)==null?void 0:Ze.docs)==null?void 0:et.source},description:{story:`Unsaved changes confirmation.\r
Warn before discarding unsaved changes.`,...(ot=(tt=W.parameters)==null?void 0:tt.docs)==null?void 0:ot.description}}};var nt,rt,it,st,ct;L.parameters={...L.parameters,docs:{...(nt=L.parameters)==null?void 0:nt.docs,source:{originalSource:`{
  render: () => {
    const [processing, setProcessing] = useState(false);
    const confirmPayment = () => {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        message.success('Payment processed successfully');
      }, 2000);
    };
    return <Space direction="vertical" size="large">\r
        <div style={{
        padding: 20,
        border: '2px solid #1890ff',
        borderRadius: 8,
        background: '#f0f5ff'
      }}>\r
          <Space direction="vertical">\r
            <Text strong style={{
            fontSize: 16
          }}>\r
              Order Summary\r
            </Text>\r
            <Divider style={{
            margin: '8px 0'
          }} />\r
            <Space style={{
            width: '100%',
            justifyContent: 'space-between'
          }}>\r
              <Text>Subtotal:</Text>\r
              <Text strong>$99.99</Text>\r
            </Space>\r
            <Space style={{
            width: '100%',
            justifyContent: 'space-between'
          }}>\r
              <Text>Tax:</Text>\r
              <Text strong>$8.00</Text>\r
            </Space>\r
            <Divider style={{
            margin: '8px 0'
          }} />\r
            <Space style={{
            width: '100%',
            justifyContent: 'space-between'
          }}>\r
              <Text strong>Total:</Text>\r
              <Text strong style={{
              fontSize: 18,
              color: '#1890ff'
            }}>\r
                $107.99\r
              </Text>\r
            </Space>\r
          </Space>\r
        </div>\r
\r
        <Popconfirm title="Confirm payment?" description={<div>\r
              <Paragraph style={{
          marginBottom: 4
        }}>\r
                You will be charged <strong>$107.99</strong>\r
              </Paragraph>\r
              <Paragraph style={{
          marginBottom: 0
        }}>\r
                This action cannot be undone.\r
              </Paragraph>\r
            </div>} onConfirm={confirmPayment} okText="Pay Now" cancelText="Cancel" okType="primary" okButtonProps={{
        loading: processing
      }}>\r
          <Button type="primary" size="large" block>\r
            Complete Purchase\r
          </Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(it=(rt=L.parameters)==null?void 0:rt.docs)==null?void 0:it.source},description:{story:`Payment/Purchase confirmation.\r
High-stakes confirmation for financial actions.`,...(ct=(st=L.parameters)==null?void 0:st.docs)==null?void 0:ct.description}}};var at,lt,dt,mt,pt;$.parameters={...$.parameters,docs:{...(at=$.parameters)==null?void 0:at.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const confirm = () => {
      message.success('Confirmed');
      setOpen(false);
    };
    const cancel = () => {
      message.error('Cancelled');
      setOpen(false);
    };
    return <Space direction="vertical" size="large">\r
        <Space>\r
          <Button onClick={() => setOpen(!open)}>Toggle from outside</Button>\r
          <Text type="secondary">Popconfirm is {open ? 'open' : 'closed'}</Text>\r
        </Space>\r
        <Popconfirm title="Controlled confirmation" description="This popconfirm can be controlled externally." open={open} onConfirm={confirm} onCancel={cancel} onOpenChange={setOpen}>\r
          <Button type="primary">Controlled Popconfirm</Button>\r
        </Popconfirm>\r
      </Space>;
  }
}`,...(dt=(lt=$.parameters)==null?void 0:lt.docs)==null?void 0:dt.source},description:{story:`Controlled Popconfirm.\r
Programmatic control over popup visibility.`,...(pt=(mt=$.parameters)==null?void 0:mt.docs)==null?void 0:pt.description}}};var ut,ft,ht,gt,xt;Y.parameters={...Y.parameters,docs:{...(ut=Y.parameters)==null?void 0:ut.docs,source:{originalSource:`{
  render: () => {
    const confirm = () => {
      message.success('Account deleted');
    };
    return <Popconfirm title="Delete your account?" description={<div style={{
      maxWidth: 250
    }}>\r
            <Paragraph style={{
        marginBottom: 8
      }}>\r
              This will permanently delete your account and all associated data.\r
            </Paragraph>\r
            <Paragraph style={{
        marginBottom: 0
      }} type="secondary">\r
              This action cannot be undone and you will lose access to all your content.\r
            </Paragraph>\r
          </div>} onConfirm={confirm} okText="Delete Account" cancelText="Cancel" okType="danger">\r
        <Button danger>Delete Account</Button>\r
      </Popconfirm>;
  }
}`,...(ht=(ft=Y.parameters)==null?void 0:ft.docs)==null?void 0:ht.source},description:{story:`With description for more context.\r
Add detailed description to help users make informed decisions.`,...(xt=(gt=Y.parameters)==null?void 0:gt.docs)==null?void 0:xt.description}}};const vn=["Basic","Placements","CustomButtons","CustomIcons","WithoutIcon","AsyncConfirmation","ConditionalTrigger","DeletePattern","BatchActionPattern","StatusChangePattern","LogoutPattern","UnsavedChangesPattern","PaymentConfirmation","Controlled","WithDescription"];export{D as AsyncConfirmation,S as Basic,I as BatchActionPattern,O as ConditionalTrigger,$ as Controlled,k as CustomButtons,w as CustomIcons,N as DeletePattern,z as LogoutPattern,L as PaymentConfirmation,B as Placements,R as StatusChangePattern,W as UnsavedChangesPattern,Y as WithDescription,A as WithoutIcon,vn as __namedExportsOrder,Tn as default};
