import{r as d,j as e}from"./iframe-Dz2LC5nm.js";import{F as o}from"./index-CrELXe5V.js";import{M as _}from"./index-4MEfMcrw.js";import{B as l}from"./button-D6Z5Xr5r.js";import{I as i}from"./index-BEffNXPx.js";import{S as m}from"./index-giBHWRYY.js";import{T as H}from"./index-COuO7qNq.js";import{D as J}from"./index-Dv9s7dGv.js";import"./preload-helper-C1FmrZbK.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./motion-Ct_bxEw8.js";import"./useCSSVarCls-BbjthPCx.js";import"./collapse-BbEVqHco.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./genStyleUtils-BYYxHtb1.js";import"./useSize-oyF83k_j.js";import"./useForm-CaVhMe50.js";import"./index-DKjRcP81.js";import"./reactNode-B7JGm4rf.js";import"./isVisible-DhUEo0yb.js";import"./row-CyxbnjAY.js";import"./index-BPutIMu_.js";import"./useBreakpoint-DFMomBk2.js";import"./useForceUpdate--fWHWdeQ.js";import"./QuestionCircleOutlined-zQ108Gd6.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./convertToTooltipProps-Dw8imluH.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./useMergedState-DIkF75NH.js";import"./ContextIsolator-MQGvi7R6.js";import"./Compact-ObzKHgFl.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./useLocale-i3AsUBCw.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./LoadingOutlined-BrYRsAZK.js";import"./index-CQWNCN3d.js";import"./index-BKBr2mfS.js";import"./InfoCircleFilled-CWRJK2Dg.js";import"./ActionButton-twpzoIEc.js";import"./CloseOutlined-Uef9iQNA.js";import"./index-NqV6zHZq.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./fade-QfD4GzOS.js";import"./useClosable-Db8tzcGm.js";import"./extendsObject-78o_rR5W.js";import"./Skeleton-_C6qiOOr.js";import"./context-BodU5NN8.js";import"./PurePanel-CuHF6Qyt.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./compact-item-BQH2bmb8.js";import"./index-CJ7UoYAk.js";import"./Input-CQB6Cwyl.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./useVariants-CQySXX5A.js";import"./EyeOutlined-DTzsB5jg.js";import"./SearchOutlined-DEJcv9Lk.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./useShowArrow-CzgaiXTk.js";import"./Overflow-DfKHW_HQ.js";import"./List-0KMFp5pO.js";import"./move-DcXnB1RZ.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./DownOutlined-DLjCd-2z.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";import"./index-DAr4GXfC.js";const u=({form:n,onOk:r,onFinish:t,onFinishFailed:s,preserveFormOnClose:a=!1,children:c,afterClose:p,...V})=>{const[N]=o.useForm(),F=n||N,[R,P]=d.useState(!1),U=async()=>{try{const h=await F.validateFields();P(!0),r&&await r(h),t&&await t(h),P(!1),a||F.resetFields()}catch(h){P(!1),s&&s(h)}},G=()=>{a||F.resetFields(),p==null||p()};return e.jsx(_,{...V,onOk:U,confirmLoading:R,afterClose:G,children:e.jsx(o,{form:F,layout:"vertical",children:c})})};u.displayName="FormModal";u.__docgenInfo={description:"",methods:[],displayName:"FormModal",props:{form:{required:!1,tsType:{name:"FormInstance"},description:""},onOk:{required:!1,tsType:{name:"signature",type:"function",raw:"(values: any) => void | Promise<void>",signature:{arguments:[{type:{name:"any"},name:"values"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},onFinish:{required:!1,tsType:{name:"signature",type:"function",raw:"(values: any) => void | Promise<void>",signature:{arguments:[{type:{name:"any"},name:"values"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},onFinishFailed:{required:!1,tsType:{name:"signature",type:"function",raw:"(errorInfo: any) => void",signature:{arguments:[{type:{name:"any"},name:"errorInfo"}],return:{name:"void"}}},description:""},preserveFormOnClose:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};const Cr={title:"Feedback/Modal/FormModal",component:u,tags:["autodocs"],parameters:{docs:{description:{component:`
Modal especializado para formularios con gestión integrada de validación y envío.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para capturar datos del usuario en un contexto modal
- Cuando necesitas formularios con validación en ventanas emergentes
- Para crear o editar entidades sin cambiar de página
        `}}}},f={render:()=>{const[n,r]=d.useState(!1),t=s=>{console.log("Form values:",s),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{type:"primary",onClick:()=>r(!0),children:"Open Form Modal"}),e.jsxs(u,{title:"Basic Form",open:n,onCancel:()=>r(!1),onFinish:t,children:[e.jsx(o.Item,{name:"username",label:"Username",rules:[{required:!0,message:"Please input username!"}],children:e.jsx(i,{})}),e.jsx(o.Item,{name:"email",label:"Email",rules:[{required:!0,message:"Please input email!"},{type:"email",message:"Please enter a valid email!"}],children:e.jsx(i,{})})]})]})}},g={render:()=>{const[n,r]=d.useState(!1),[t]=o.useForm(),s=c=>{console.log("Form values:",c),r(!1)},a=()=>{t.setFieldsValue({username:"John Doe",email:"john@example.com",role:"admin"})};return e.jsxs(e.Fragment,{children:[e.jsxs(l.Group,{children:[e.jsx(l,{type:"primary",onClick:()=>r(!0),children:"Open Form Modal"}),e.jsx(l,{onClick:a,children:"Fill Form"}),e.jsx(l,{onClick:()=>t.resetFields(),children:"Reset Form"})]}),e.jsxs(u,{title:"Form with External Form Instance",open:n,form:t,onCancel:()=>r(!1),onFinish:s,children:[e.jsx(o.Item,{name:"username",label:"Username",rules:[{required:!0}],children:e.jsx(i,{})}),e.jsx(o.Item,{name:"email",label:"Email",rules:[{required:!0,type:"email"}],children:e.jsx(i,{})}),e.jsx(o.Item,{name:"role",label:"Role",rules:[{required:!0}],children:e.jsxs(m,{children:[e.jsx(m.Option,{value:"admin",children:"Admin"}),e.jsx(m.Option,{value:"user",children:"User"}),e.jsx(m.Option,{value:"guest",children:"Guest"})]})})]})]})}},y={render:()=>{const[n,r]=d.useState(!1),t=async s=>{await new Promise(a=>setTimeout(a,1e3)),console.log("Form values:",s),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{type:"primary",onClick:()=>r(!0),children:"Open Complex Form"}),e.jsxs(u,{title:"User Registration",open:n,onCancel:()=>r(!1),onFinish:t,width:600,children:[e.jsx(o.Item,{name:"fullname",label:"Full Name",rules:[{required:!0,message:"Please input your full name!"}],children:e.jsx(i,{placeholder:"Enter your full name"})}),e.jsx(o.Item,{name:"email",label:"Email",rules:[{required:!0,message:"Please input your email!"},{type:"email",message:"Please enter a valid email!"}],children:e.jsx(i,{placeholder:"Enter your email"})}),e.jsx(o.Item,{name:"age",label:"Age",rules:[{required:!0,message:"Please input your age!"}],children:e.jsx(H,{min:1,max:120,style:{width:"100%"}})}),e.jsx(o.Item,{name:"gender",label:"Gender",rules:[{required:!0,message:"Please select your gender!"}],children:e.jsxs(m,{placeholder:"Select gender",children:[e.jsx(m.Option,{value:"male",children:"Male"}),e.jsx(m.Option,{value:"female",children:"Female"}),e.jsx(m.Option,{value:"other",children:"Other"})]})}),e.jsx(o.Item,{name:"birthdate",label:"Birth Date",rules:[{required:!0,message:"Please select your birth date!"}],children:e.jsx(J,{style:{width:"100%"}})})]})]})}},v={render:()=>{const[n,r]=d.useState(!1),t=s=>{console.log("Form values:",s),r(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{type:"primary",onClick:()=>r(!0),children:"Open Form (Preserves Data)"}),e.jsx(u,{title:"Form with Preserved Data",open:n,onCancel:()=>r(!1),onFinish:t,preserveFormOnClose:!0,children:e.jsx(o.Item,{name:"notes",label:"Notes",rules:[{required:!0,message:"Please input some notes!"}],children:e.jsx(i.TextArea,{rows:4,placeholder:"Enter your notes here..."})})})]})}},x={render:()=>{const[n,r]=d.useState(!1),t=a=>{console.log("Success:",a),r(!1)},s=a=>{console.log("Failed:",a)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{type:"primary",onClick:()=>r(!0),children:"Open Form with Validation"}),e.jsxs(u,{title:"Form Validation",open:n,onCancel:()=>r(!1),onFinish:t,onFinishFailed:s,children:[e.jsx(o.Item,{name:"password",label:"Password",rules:[{required:!0,message:"Please input your password!"},{min:6,message:"Password must be at least 6 characters!"}],children:e.jsx(i.Password,{})}),e.jsx(o.Item,{name:"confirm",label:"Confirm Password",dependencies:["password"],rules:[{required:!0,message:"Please confirm your password!"},({getFieldValue:a})=>({validator(c,p){return!p||a("password")===p?Promise.resolve():Promise.reject(new Error("Passwords do not match!"))}})],children:e.jsx(i.Password,{})})]})]})}};var I,O,j;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Form Modal\r
        </Button>\r
        <FormModal title="Basic Form" open={open} onCancel={() => setOpen(false)} onFinish={handleFinish}>\r
          <Form.Item name="username" label="Username" rules={[{
          required: true,
          message: 'Please input username!'
        }]}>\r
            <Input />\r
          </Form.Item>\r
          <Form.Item name="email" label="Email" rules={[{
          required: true,
          message: 'Please input email!'
        }, {
          type: 'email',
          message: 'Please enter a valid email!'
        }]}>\r
            <Input />\r
          </Form.Item>\r
        </FormModal>\r
      </>;
  }
}`,...(j=(O=f.parameters)==null?void 0:O.docs)==null?void 0:j.source}}};var w,S,b;g.parameters={...g.parameters,docs:{...(w=g.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };
    const fillForm = () => {
      form.setFieldsValue({
        username: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      });
    };
    return <>\r
        <Button.Group>\r
          <Button type="primary" onClick={() => setOpen(true)}>\r
            Open Form Modal\r
          </Button>\r
          <Button onClick={fillForm}>Fill Form</Button>\r
          <Button onClick={() => form.resetFields()}>Reset Form</Button>\r
        </Button.Group>\r
        <FormModal title="Form with External Form Instance" open={open} form={form} onCancel={() => setOpen(false)} onFinish={handleFinish}>\r
          <Form.Item name="username" label="Username" rules={[{
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
          <Form.Item name="role" label="Role" rules={[{
          required: true
        }]}>\r
            <Select>\r
              <Select.Option value="admin">Admin</Select.Option>\r
              <Select.Option value="user">User</Select.Option>\r
              <Select.Option value="guest">Guest</Select.Option>\r
            </Select>\r
          </Form.Item>\r
        </FormModal>\r
      </>;
  }
}`,...(b=(S=g.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var C,q,B;y.parameters={...y.parameters,docs:{...(C=y.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    const handleFinish = async (values: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form values:', values);
      setOpen(false);
    };
    return <>\r
        <Button type="primary" onClick={() => setOpen(true)}>\r
          Open Complex Form\r
        </Button>\r
        <FormModal title="User Registration" open={open} onCancel={() => setOpen(false)} onFinish={handleFinish} width={600}>\r
          <Form.Item name="fullname" label="Full Name" rules={[{
          required: true,
          message: 'Please input your full name!'
        }]}>\r
            <Input placeholder="Enter your full name" />\r
          </Form.Item>\r
          <Form.Item name="email" label="Email" rules={[{
          required: true,
          message: 'Please input your email!'
        }, {
          type: 'email',
          message: 'Please enter a valid email!'
        }]}>\r
            <Input placeholder="Enter your email" />\r
          </Form.Item>\r
          <Form.Item name="age" label="Age" rules={[{
          required: true,
          message: 'Please input your age!'
        }]}>\r
            <InputNumber min={1} max={120} style={{
            width: '100%'
          }} />\r
          </Form.Item>\r
          <Form.Item name="gender" label="Gender" rules={[{
          required: true,
          message: 'Please select your gender!'
        }]}>\r
            <Select placeholder="Select gender">\r
              <Select.Option value="male">Male</Select.Option>\r
              <Select.Option value="female">Female</Select.Option>\r
              <Select.Option value="other">Other</Select.Option>\r
            </Select>\r
          </Form.Item>\r
          <Form.Item name="birthdate" label="Birth Date" rules={[{
          required: true,
          message: 'Please select your birth date!'
        }]}>\r
            <DatePicker style={{
            width: '100%'
          }} />\r
          </Form.Item>\r
        </FormModal>\r
      </>;
  }
}`,...(B=(q=y.parameters)==null?void 0:q.docs)==null?void 0:B.source}}};var M,E,k;v.parameters={...v.parameters,docs:{...(M=v.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
        <FormModal title="Form with Preserved Data" open={open} onCancel={() => setOpen(false)} onFinish={handleFinish} preserveFormOnClose={true}>\r
          <Form.Item name="notes" label="Notes" rules={[{
          required: true,
          message: 'Please input some notes!'
        }]}>\r
            <Input.TextArea rows={4} placeholder="Enter your notes here..." />\r
          </Form.Item>\r
        </FormModal>\r
      </>;
  }
}`,...(k=(E=v.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};var D,A,T;x.parameters={...x.parameters,docs:{...(D=x.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
          Open Form with Validation\r
        </Button>\r
        <FormModal title="Form Validation" open={open} onCancel={() => setOpen(false)} onFinish={handleFinish} onFinishFailed={handleFinishFailed}>\r
          <Form.Item name="password" label="Password" rules={[{
          required: true,
          message: 'Please input your password!'
        }, {
          min: 6,
          message: 'Password must be at least 6 characters!'
        }]}>\r
            <Input.Password />\r
          </Form.Item>\r
          <Form.Item name="confirm" label="Confirm Password" dependencies={['password']} rules={[{
          required: true,
          message: 'Please confirm your password!'
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
        </FormModal>\r
      </>;
  }
}`,...(T=(A=x.parameters)==null?void 0:A.docs)==null?void 0:T.source}}};const qr=["Basic","WithExternalForm","ComplexForm","PreserveFormData","ValidationHandling"];export{f as Basic,y as ComplexForm,v as PreserveFormData,x as ValidationHandling,g as WithExternalForm,qr as __namedExportsOrder,Cr as default};
