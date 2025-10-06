import{r as c,j as e}from"./iframe-Dz2LC5nm.js";import{F as t}from"./index-CrELXe5V.js";import{D as me}from"./index-0ASfQ35U.js";import{S as ue}from"./index-_UlGzK8j.js";import{B as m}from"./button-D6Z5Xr5r.js";import{I as l}from"./index-BEffNXPx.js";import{S as n}from"./index-giBHWRYY.js";import{S as ee}from"./index-ORKdBOW3.js";import{R as f}from"./index-Bp9XUfoE.js";import{T as D}from"./index-COuO7qNq.js";import{D as ce}from"./index-Dv9s7dGv.js";import"./preload-helper-C1FmrZbK.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./motion-Ct_bxEw8.js";import"./useCSSVarCls-BbjthPCx.js";import"./collapse-BbEVqHco.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./genStyleUtils-BYYxHtb1.js";import"./useSize-oyF83k_j.js";import"./useForm-CaVhMe50.js";import"./index-DKjRcP81.js";import"./reactNode-B7JGm4rf.js";import"./isVisible-DhUEo0yb.js";import"./row-CyxbnjAY.js";import"./index-BPutIMu_.js";import"./useBreakpoint-DFMomBk2.js";import"./useForceUpdate--fWHWdeQ.js";import"./QuestionCircleOutlined-zQ108Gd6.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./convertToTooltipProps-Dw8imluH.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./useMergedState-DIkF75NH.js";import"./ContextIsolator-MQGvi7R6.js";import"./Compact-ObzKHgFl.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./useLocale-i3AsUBCw.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./LoadingOutlined-BrYRsAZK.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./context-BodU5NN8.js";import"./useClosable-Db8tzcGm.js";import"./CloseOutlined-Uef9iQNA.js";import"./extendsObject-78o_rR5W.js";import"./Skeleton-_C6qiOOr.js";import"./index-BKBr2mfS.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./compact-item-BQH2bmb8.js";import"./index-CJ7UoYAk.js";import"./Input-CQB6Cwyl.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./useVariants-CQySXX5A.js";import"./EyeOutlined-DTzsB5jg.js";import"./SearchOutlined-DEJcv9Lk.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./useShowArrow-CzgaiXTk.js";import"./Overflow-DfKHW_HQ.js";import"./List-0KMFp5pO.js";import"./move-DcXnB1RZ.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./DownOutlined-DLjCd-2z.js";import"./PurePanel-CuHF6Qyt.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";import"./useBubbleLock-CZY2ua_G.js";import"./index-DAr4GXfC.js";const u=({form:a,onFinish:r,onFinishFailed:s,onClose:o,submitText:i="Submit",cancelText:F="Cancel",preserveFormOnClose:p=!1,showFooter:re=!0,children:te,footer:P,afterOpenChange:b,...oe})=>{const[se]=t.useForm(),h=a||se,[ae,S]=c.useState(!1),ne=async()=>{try{const d=await h.validateFields();S(!0),r&&await r(d),S(!1),p||h.resetFields(),o==null||o()}catch(d){S(!1),s&&s(d)}},C=()=>{p||h.resetFields(),o==null||o()},le=d=>{!d&&!p&&h.resetFields(),b==null||b(d)},ie=re?e.jsxs(ue,{children:[e.jsx(m,{onClick:C,children:F}),e.jsx(m,{type:"primary",onClick:ne,loading:ae,children:i})]}):null;return e.jsx(me,{...oe,onClose:C,afterOpenChange:le,footer:P!==void 0?P:ie,children:e.jsx(t,{form:h,layout:"vertical",children:te})})};u.displayName="FormDrawer";u.__docgenInfo={description:"",methods:[],displayName:"FormDrawer",props:{form:{required:!1,tsType:{name:"FormInstance"},description:""},onFinish:{required:!1,tsType:{name:"signature",type:"function",raw:"(values: any) => void | Promise<void>",signature:{arguments:[{type:{name:"any"},name:"values"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},onFinishFailed:{required:!1,tsType:{name:"signature",type:"function",raw:"(errorInfo: any) => void",signature:{arguments:[{type:{name:"any"},name:"errorInfo"}],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},submitText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Submit'",computed:!1}},cancelText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Cancel'",computed:!1}},preserveFormOnClose:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},showFooter:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}}},composes:["Omit"]};const Wr={title:"Overlay/Drawer/FormDrawer",component:u,tags:["autodocs"],parameters:{docs:{description:{component:`
Drawer especializado para formularios con gestión automática de estado y validación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/drawer)
- [🎨 API de Props](https://ant.design/components/drawer#api)
- [💡 Ejemplos](https://ant.design/components/drawer#examples)

## Cuándo usar

- Para formularios de creación o edición en panel lateral
- Cuando necesitas mantener el contexto mientras capturas datos
- Para flujos de trabajo que requieren entrada de usuario sin cambiar de página
        `}}}},g={render:()=>{const[a,r]=c.useState(!1),s=o=>{console.log("Form values:",o),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Form Drawer"}),e.jsxs(u,{title:"Create New User",open:a,onClose:()=>r(!1),onFinish:s,width:500,children:[e.jsx(t.Item,{name:"username",label:"Username",rules:[{required:!0,message:"Please input username!"}],children:e.jsx(l,{placeholder:"Enter username"})}),e.jsx(t.Item,{name:"email",label:"Email",rules:[{required:!0,message:"Please input email!"},{type:"email",message:"Please enter a valid email!"}],children:e.jsx(l,{placeholder:"Enter email"})}),e.jsx(t.Item,{name:"role",label:"Role",rules:[{required:!0,message:"Please select a role!"}],children:e.jsxs(n,{placeholder:"Select role",children:[e.jsx(n.Option,{value:"admin",children:"Admin"}),e.jsx(n.Option,{value:"user",children:"User"}),e.jsx(n.Option,{value:"guest",children:"Guest"})]})})]})]})}},x={render:()=>{const[a,r]=c.useState(!1),[s]=t.useForm(),o=F=>{console.log("Form values:",F),r(!1)},i=()=>{s.setFieldsValue({name:"John Doe",email:"john@example.com",phone:"+1234567890",country:"us"})};return e.jsxs(e.Fragment,{children:[e.jsxs(m.Group,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Form"}),e.jsx(m,{onClick:i,children:"Prefill Data"}),e.jsx(m,{onClick:()=>s.resetFields(),children:"Clear Form"})]}),e.jsxs(u,{title:"User Information",open:a,form:s,onClose:()=>r(!1),onFinish:o,width:500,children:[e.jsx(t.Item,{name:"name",label:"Full Name",rules:[{required:!0}],children:e.jsx(l,{})}),e.jsx(t.Item,{name:"email",label:"Email",rules:[{required:!0,type:"email"}],children:e.jsx(l,{})}),e.jsx(t.Item,{name:"phone",label:"Phone Number",children:e.jsx(l,{})}),e.jsx(t.Item,{name:"country",label:"Country",rules:[{required:!0}],children:e.jsxs(n,{children:[e.jsx(n.Option,{value:"us",children:"United States"}),e.jsx(n.Option,{value:"uk",children:"United Kingdom"}),e.jsx(n.Option,{value:"ca",children:"Canada"})]})})]})]})}},j={render:()=>{const[a,r]=c.useState(!1),s=o=>{console.log("Form values:",o),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Right Drawer"}),e.jsxs(u,{title:"Settings",placement:"right",open:a,onClose:()=>r(!1),onFinish:s,width:400,children:[e.jsx(t.Item,{name:"notifications",label:"Enable Notifications",valuePropName:"checked",children:e.jsx(ee,{})}),e.jsx(t.Item,{name:"theme",label:"Theme",children:e.jsxs(f.Group,{children:[e.jsx(f,{value:"light",children:"Light"}),e.jsx(f,{value:"dark",children:"Dark"}),e.jsx(f,{value:"auto",children:"Auto"})]})}),e.jsx(t.Item,{name:"language",label:"Language",children:e.jsxs(n,{children:[e.jsx(n.Option,{value:"en",children:"English"}),e.jsx(n.Option,{value:"es",children:"Spanish"}),e.jsx(n.Option,{value:"fr",children:"French"})]})})]})]})}},I={render:()=>{const[a,r]=c.useState(!1),s=async o=>{await new Promise(i=>setTimeout(i,1500)),console.log("Form values:",o),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Product Form"}),e.jsxs(u,{title:"Add New Product",open:a,onClose:()=>r(!1),onFinish:s,width:600,children:[e.jsx(t.Item,{name:"productName",label:"Product Name",rules:[{required:!0,message:"Please enter product name!"}],children:e.jsx(l,{placeholder:"Enter product name"})}),e.jsx(t.Item,{name:"category",label:"Category",rules:[{required:!0,message:"Please select a category!"}],children:e.jsxs(n,{placeholder:"Select category",children:[e.jsx(n.Option,{value:"electronics",children:"Electronics"}),e.jsx(n.Option,{value:"clothing",children:"Clothing"}),e.jsx(n.Option,{value:"books",children:"Books"}),e.jsx(n.Option,{value:"food",children:"Food & Beverages"})]})}),e.jsx(t.Item,{name:"price",label:"Price",rules:[{required:!0,message:"Please enter price!"}],children:e.jsx(D,{min:0,precision:2,prefix:"$",style:{width:"100%"},placeholder:"0.00"})}),e.jsx(t.Item,{name:"stock",label:"Stock Quantity",rules:[{required:!0,message:"Please enter stock quantity!"}],children:e.jsx(D,{min:0,style:{width:"100%"},placeholder:"0"})}),e.jsx(t.Item,{name:"description",label:"Description",rules:[{required:!0,message:"Please enter description!"}],children:e.jsx(l.TextArea,{rows:4,placeholder:"Enter product description"})}),e.jsx(t.Item,{name:"availableDate",label:"Available From",children:e.jsx(ce,{style:{width:"100%"}})}),e.jsx(t.Item,{name:"featured",label:"Featured Product",valuePropName:"checked",children:e.jsx(ee,{})})]})]})}},v={render:()=>{const[a,r]=c.useState(!1),s=o=>{console.log("Form values:",o),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Form (Preserves Data)"}),e.jsxs(u,{title:"Draft Message",open:a,onClose:()=>r(!1),onFinish:s,preserveFormOnClose:!0,width:500,children:[e.jsx(t.Item,{name:"to",label:"To",rules:[{required:!0}],children:e.jsx(l,{placeholder:"Recipient email"})}),e.jsx(t.Item,{name:"subject",label:"Subject",rules:[{required:!0}],children:e.jsx(l,{placeholder:"Email subject"})}),e.jsx(t.Item,{name:"message",label:"Message",rules:[{required:!0}],children:e.jsx(l.TextArea,{rows:8,placeholder:"Your message here..."})})]})]})}},w={render:()=>{const[a,r]=c.useState(!1),s=o=>{console.log("Form values:",o),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Custom Footer"}),e.jsxs(u,{title:"Custom Actions",open:a,onClose:()=>r(!1),onFinish:s,submitText:"Save & Continue",cancelText:"Discard",width:500,children:[e.jsx(t.Item,{name:"title",label:"Title",rules:[{required:!0}],children:e.jsx(l,{})}),e.jsx(t.Item,{name:"content",label:"Content",children:e.jsx(l.TextArea,{rows:4})})]})]})}},y={render:()=>{const[a,r]=c.useState(!1),[s]=t.useForm(),o=async()=>{try{const i=await s.validateFields();console.log("Form values:",i),r(!1)}catch(i){console.log("Validation failed:",i)}};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open No Footer"}),e.jsxs(u,{title:"Inline Actions",open:a,form:s,onClose:()=>r(!1),showFooter:!1,width:500,children:[e.jsx(t.Item,{name:"name",label:"Name",rules:[{required:!0}],children:e.jsx(l,{})}),e.jsx(t.Item,{name:"description",label:"Description",children:e.jsx(l.TextArea,{rows:3})}),e.jsx(t.Item,{children:e.jsx(m,{type:"primary",onClick:o,block:!0,children:"Submit Form"})})]})]})}},O={render:()=>{const[a,r]=c.useState(!1),s=i=>{console.log("Success:",i),r(!1)},o=i=>{console.log("Failed:",i)};return e.jsxs(e.Fragment,{children:[e.jsx(m,{type:"primary",onClick:()=>r(!0),children:"Open Validation Form"}),e.jsxs(u,{title:"Registration Form",open:a,onClose:()=>r(!1),onFinish:s,onFinishFailed:o,width:500,children:[e.jsx(t.Item,{name:"username",label:"Username",rules:[{required:!0,message:"Please input username!"},{min:3,message:"Username must be at least 3 characters!"}],children:e.jsx(l,{})}),e.jsx(t.Item,{name:"password",label:"Password",rules:[{required:!0,message:"Please input password!"},{min:6,message:"Password must be at least 6 characters!"}],children:e.jsx(l.Password,{})}),e.jsx(t.Item,{name:"confirm",label:"Confirm Password",dependencies:["password"],rules:[{required:!0,message:"Please confirm password!"},({getFieldValue:i})=>({validator(F,p){return!p||i("password")===p?Promise.resolve():Promise.reject(new Error("Passwords do not match!"))}})],children:e.jsx(l.Password,{})})]})]})}};var q,k,B;g.parameters={...g.parameters,docs:{...(q=g.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Form Drawer\r
        </Button>\r
        <FormDrawer title="Create New User" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} width={500}>\r
          <Form.Item name="username" label="Username" rules={[{
          required: true,
          message: 'Please input username!'
        }]}>\r
            <Input placeholder="Enter username" />\r
          </Form.Item>\r
          <Form.Item name="email" label="Email" rules={[{
          required: true,
          message: 'Please input email!'
        }, {
          type: 'email',
          message: 'Please enter a valid email!'
        }]}>\r
            <Input placeholder="Enter email" />\r
          </Form.Item>\r
          <Form.Item name="role" label="Role" rules={[{
          required: true,
          message: 'Please select a role!'
        }]}>\r
            <Select placeholder="Select role">\r
              <Select.Option value="admin">Admin</Select.Option>\r
              <Select.Option value="user">User</Select.Option>\r
              <Select.Option value="guest">Guest</Select.Option>\r
            </Select>\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(B=(k=g.parameters)==null?void 0:k.docs)==null?void 0:B.source}}};var T,N,E;x.parameters={...x.parameters,docs:{...(T=x.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    const prefillForm = () => {
      form.setFieldsValue({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'us'
      });
    };
    return <>\r
        <Button.Group>\r
          <Button type="primary" onClick={() => setOpen(true)}>\r
            Open Form\r
          </Button>\r
          <Button onClick={prefillForm}>Prefill Data</Button>\r
          <Button onClick={() => form.resetFields()}>Clear Form</Button>\r
        </Button.Group>\r
        <FormDrawer title="User Information" open={open} form={form} onClose={() => setOpen(false)} onFinish={handleFinish} width={500}>\r
          <Form.Item name="name" label="Full Name" rules={[{
          required: true
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="email" label="Email" rules={[{
          required: true,
          type: 'email'
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="phone" label="Phone Number">\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="country" label="Country" rules={[{
          required: true
        }]}>\r
            <Select>\r
              <Select.Option value="us">United States</Select.Option>\r
              <Select.Option value="uk">United Kingdom</Select.Option>\r
              <Select.Option value="ca">Canada</Select.Option>\r
            </Select>\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(E=(N=x.parameters)==null?void 0:N.docs)==null?void 0:E.source}}};var A,R,U;j.parameters={...j.parameters,docs:{...(A=j.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Right Drawer\r
        </Button>\r
        <FormDrawer title="Settings" placement="right" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} width={400}>\r
          <Form.Item name="notifications" label="Enable Notifications" valuePropName="checked">\r
            <Switch />\r
          </Form.Item>\r
          <Form.Item name="theme" label="Theme">\r
            <Radio.Group>\r
              <Radio value="light">Light</Radio>\r
              <Radio value="dark">Dark</Radio>\r
              <Radio value="auto">Auto</Radio>\r
            </Radio.Group>\r
          </Form.Item>\r
          <Form.Item name="language" label="Language">\r
            <Select>\r
              <Select.Option value="en">English</Select.Option>\r
              <Select.Option value="es">Spanish</Select.Option>\r
              <Select.Option value="fr">French</Select.Option>\r
            </Select>\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(U=(R=j.parameters)==null?void 0:R.docs)==null?void 0:U.source}}};var V,G,_;I.parameters={...I.parameters,docs:{...(V=I.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = async (values: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Product Form\r
        </Button>\r
        <FormDrawer title="Add New Product" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} width={600}>\r
          <Form.Item name="productName" label="Product Name" rules={[{
          required: true,
          message: 'Please enter product name!'
        }]}>\r
            <Input placeholder="Enter product name" />\r
          </Form.Item>\r
          <Form.Item name="category" label="Category" rules={[{
          required: true,
          message: 'Please select a category!'
        }]}>\r
            <Select placeholder="Select category">\r
              <Select.Option value="electronics">Electronics</Select.Option>\r
              <Select.Option value="clothing">Clothing</Select.Option>\r
              <Select.Option value="books">Books</Select.Option>\r
              <Select.Option value="food">Food & Beverages</Select.Option>\r
            </Select>\r
          </Form.Item>\r
          <Form.Item name="price" label="Price" rules={[{
          required: true,
          message: 'Please enter price!'
        }]}>\r
            <InputNumber min={0} precision={2} prefix="$" style={{
            width: '100%'
          }} placeholder="0.00" />\r
          </Form.Item>\r
          <Form.Item name="stock" label="Stock Quantity" rules={[{
          required: true,
          message: 'Please enter stock quantity!'
        }]}>\r
            <InputNumber min={0} style={{
            width: '100%'
          }} placeholder="0" />\r
          </Form.Item>\r
          <Form.Item name="description" label="Description" rules={[{
          required: true,
          message: 'Please enter description!'
        }]}>\r
            <Input.TextArea rows={4} placeholder="Enter product description" />\r
          </Form.Item>\r
          <Form.Item name="availableDate" label="Available From">\r
            <DatePicker style={{
            width: '100%'
          }} />\r
          </Form.Item>\r
          <Form.Item name="featured" label="Featured Product" valuePropName="checked">\r
            <Switch />\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(_=(G=I.parameters)==null?void 0:G.docs)==null?void 0:_.source}}};var L,M,H;v.parameters={...v.parameters,docs:{...(L=v.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Form (Preserves Data)\r
        </Button>\r
        <FormDrawer title="Draft Message" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} preserveFormOnClose={true} width={500}>\r
          <Form.Item name="to" label="To" rules={[{
          required: true
        }]}>\r
            <Input placeholder="Recipient email" />\r
          </Form.Item>\r
          <Form.Item name="subject" label="Subject" rules={[{
          required: true
        }]}>\r
            <Input placeholder="Email subject" />\r
          </Form.Item>\r
          <Form.Item name="message" label="Message" rules={[{
          required: true
        }]}>\r
            <Input.TextArea rows={8} placeholder="Your message here..." />\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(H=(M=v.parameters)==null?void 0:M.docs)==null?void 0:H.source}}};var J,K,Q;w.parameters={...w.parameters,docs:{...(J=w.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Custom Footer\r
        </Button>\r
        <FormDrawer title="Custom Actions" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} submitText="Save & Continue" cancelText="Discard" width={500}>\r
          <Form.Item name="title" label="Title" rules={[{
          required: true
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="content" label="Content">\r
            <Input.TextArea rows={4} />\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(Q=(K=w.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var W,Y,$;y.parameters={...y.parameters,docs:{...(W=y.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        console.log('Form values:', values);
        setOpen(false);
      } catch (error) {
        console.log('Validation failed:', error);
      }
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open No Footer\r
        </Button>\r
        <FormDrawer title="Inline Actions" open={open} form={form} onClose={() => setOpen(false)} showFooter={false} width={500}>\r
          <Form.Item name="name" label="Name" rules={[{
          required: true
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="description" label="Description">\r
            <Input.TextArea rows={3} />\r
          </Form.Item>\r
          <Form.Item>\r
            <Button type="primary" onClick={handleSubmit} block>\r
              Submit Form\r
            </Button>\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...($=(Y=y.parameters)==null?void 0:Y.docs)==null?void 0:$.source}}};var z,X,Z;O.parameters={...O.parameters,docs:{...(z=O.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Success:', values);
      setOpen(false);
    };
    const handleFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Validation Form\r
        </Button>\r
        <FormDrawer title="Registration Form" open={open} onClose={() => setOpen(false)} onFinish={handleFinish} onFinishFailed={handleFinishFailed} width={500}>\r
          <Form.Item name="username" label="Username" rules={[{
          required: true,
          message: 'Please input username!'
        }, {
          min: 3,
          message: 'Username must be at least 3 characters!'
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="password" label="Password" rules={[{
          required: true,
          message: 'Please input password!'
        }, {
          min: 6,
          message: 'Password must be at least 6 characters!'
        }]}>\r
            <Input.Password />\r
          </Form.Item>\r
          <Form.Item name="confirm" label="Confirm Password" dependencies={['password']} rules={[{
          required: true,
          message: 'Please confirm password!'
        }, ({
          getFieldValue
        }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Passwords do not match!'));
          }
        })]}>\r
            <Input.Password />\r
          </Form.Item>\r
        </FormDrawer>\r
      </>;
  }
}`,...(Z=(X=O.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};const Yr=["Basic","WithExternalForm","RightPlacement","ComplexForm","PreserveFormData","CustomFooter","NoFooter","ValidationHandling"];export{g as Basic,I as ComplexForm,w as CustomFooter,y as NoFooter,v as PreserveFormData,j as RightPlacement,O as ValidationHandling,x as WithExternalForm,Yr as __namedExportsOrder,Wr as default};
