import{j as e}from"./iframe-Dz2LC5nm.js";import{F as r}from"./index-CrELXe5V.js";import{I as m}from"./index-BEffNXPx.js";import{C as S}from"./index-Cf_mJIPq.js";import{B as a}from"./button-D6Z5Xr5r.js";import{S as P}from"./index-_UlGzK8j.js";import{S as p}from"./index-giBHWRYY.js";import{R as t}from"./index-Bp9XUfoE.js";import"./preload-helper-C1FmrZbK.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./motion-Ct_bxEw8.js";import"./useCSSVarCls-BbjthPCx.js";import"./collapse-BbEVqHco.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./genStyleUtils-BYYxHtb1.js";import"./useSize-oyF83k_j.js";import"./useForm-CaVhMe50.js";import"./index-DKjRcP81.js";import"./reactNode-B7JGm4rf.js";import"./isVisible-DhUEo0yb.js";import"./row-CyxbnjAY.js";import"./index-BPutIMu_.js";import"./useBreakpoint-DFMomBk2.js";import"./useForceUpdate--fWHWdeQ.js";import"./QuestionCircleOutlined-zQ108Gd6.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./convertToTooltipProps-Dw8imluH.js";import"./index-DiRJBLqM.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./useMergedState-DIkF75NH.js";import"./ContextIsolator-MQGvi7R6.js";import"./Compact-ObzKHgFl.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./useLocale-i3AsUBCw.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./LoadingOutlined-BrYRsAZK.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";import"./Input-CQB6Cwyl.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./useVariants-CQySXX5A.js";import"./pickAttrs-C7BJ3CXo.js";import"./EyeOutlined-DTzsB5jg.js";import"./SearchOutlined-DEJcv9Lk.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./useBubbleLock-CZY2ua_G.js";import"./index-BKBr2mfS.js";import"./index-yP-ZuFQg.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./useShowArrow-CzgaiXTk.js";import"./Overflow-DfKHW_HQ.js";import"./List-0KMFp5pO.js";import"./move-DcXnB1RZ.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./PurePanel-CuHF6Qyt.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";const ar={title:"Inputs/Form",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de formulario para recopilar, validar y enviar datos del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/form)
- [🎨 API de Props](https://ant.design/components/form#api)
- [💡 Ejemplos](https://ant.design/components/form#examples)

## Cuándo usar

- Para crear formularios con validación automática de campos.
- Soporta diferentes layouts (horizontal, vertical, inline) y tipos de validación.
        `}}},argTypes:{layout:{control:"select",options:["horizontal","vertical","inline"]},disabled:{control:"boolean"}}},o={render:()=>e.jsxs(r,{name:"basic",labelCol:{span:8},wrapperCol:{span:16},style:{maxWidth:600},initialValues:{remember:!0},children:[e.jsx(r.Item,{label:"Username",name:"username",rules:[{required:!0,message:"Please input your username!"}],children:e.jsx(m,{})}),e.jsx(r.Item,{label:"Password",name:"password",rules:[{required:!0,message:"Please input your password!"}],children:e.jsx(m.Password,{})}),e.jsx(r.Item,{name:"remember",valuePropName:"checked",wrapperCol:{offset:8,span:16},children:e.jsx(S,{children:"Remember me"})}),e.jsx(r.Item,{wrapperCol:{offset:8,span:16},children:e.jsx(a,{type:"primary",htmlType:"submit",children:"Submit"})})]})},i={render:()=>e.jsxs(r,{name:"validation",labelCol:{span:6},wrapperCol:{span:18},style:{maxWidth:600},children:[e.jsx(r.Item,{label:"Email",name:"email",rules:[{required:!0,message:"Please input your email!"},{type:"email",message:"Please enter a valid email!"}],children:e.jsx(m,{placeholder:"user@example.com"})}),e.jsx(r.Item,{label:"Age",name:"age",rules:[{required:!0,message:"Please input your age!"},{type:"number",min:1,max:120,message:"Age must be between 1 and 120"}],children:e.jsx(m,{type:"number"})}),e.jsx(r.Item,{label:"Website",name:"website",rules:[{type:"url",message:"Please enter a valid URL!"}],children:e.jsx(m,{placeholder:"https://example.com"})}),e.jsx(r.Item,{wrapperCol:{offset:6,span:18},children:e.jsx(a,{type:"primary",htmlType:"submit",children:"Submit"})})]})},l={render:()=>e.jsxs(P,{direction:"vertical",style:{width:"100%"},size:"large",children:[e.jsxs("div",{children:[e.jsx("h4",{children:"Horizontal Layout"}),e.jsxs(r,{layout:"horizontal",style:{maxWidth:600},children:[e.jsx(r.Item,{label:"Name",name:"name",children:e.jsx(m,{})}),e.jsx(r.Item,{label:"Email",name:"email",children:e.jsx(m,{})})]})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Vertical Layout"}),e.jsxs(r,{layout:"vertical",style:{maxWidth:600},children:[e.jsx(r.Item,{label:"Name",name:"name",children:e.jsx(m,{})}),e.jsx(r.Item,{label:"Email",name:"email",children:e.jsx(m,{})})]})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Inline Layout"}),e.jsxs(r,{layout:"inline",children:[e.jsx(r.Item,{label:"Name",name:"name",children:e.jsx(m,{})}),e.jsx(r.Item,{label:"Email",name:"email",children:e.jsx(m,{})}),e.jsx(r.Item,{children:e.jsx(a,{type:"primary",children:"Submit"})})]})]})]})},s={render:()=>e.jsxs(r,{name:"fieldTypes",labelCol:{span:6},wrapperCol:{span:18},style:{maxWidth:600},children:[e.jsx(r.Item,{label:"Input",name:"input",children:e.jsx(m,{placeholder:"Basic input"})}),e.jsx(r.Item,{label:"Select",name:"select",children:e.jsxs(p,{children:[e.jsx(p.Option,{value:"1",children:"Option 1"}),e.jsx(p.Option,{value:"2",children:"Option 2"})]})}),e.jsx(r.Item,{label:"Radio",name:"radio",children:e.jsxs(t.Group,{children:[e.jsx(t,{value:"a",children:"A"}),e.jsx(t,{value:"b",children:"B"}),e.jsx(t,{value:"c",children:"C"})]})}),e.jsx(r.Item,{label:"Checkbox",name:"checkbox",valuePropName:"checked",children:e.jsx(S,{children:"Agree to terms"})}),e.jsx(r.Item,{label:"TextArea",name:"textarea",children:e.jsx(m.TextArea,{rows:4})}),e.jsx(r.Item,{wrapperCol:{offset:6,span:18},children:e.jsx(a,{type:"primary",htmlType:"submit",children:"Submit"})})]})},n={render:()=>e.jsxs(r,{name:"disabled",disabled:!0,labelCol:{span:6},wrapperCol:{span:18},style:{maxWidth:600},initialValues:{name:"John Doe",email:"john@example.com"},children:[e.jsx(r.Item,{label:"Name",name:"name",children:e.jsx(m,{})}),e.jsx(r.Item,{label:"Email",name:"email",children:e.jsx(m,{})}),e.jsx(r.Item,{wrapperCol:{offset:6,span:18},children:e.jsx(a,{type:"primary",htmlType:"submit",children:"Submit"})})]})};var d,u,c;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <Form name="basic" labelCol={{
    span: 8
  }} wrapperCol={{
    span: 16
  }} style={{
    maxWidth: 600
  }} initialValues={{
    remember: true
  }}>\r
      <Form.Item label="Username" name="username" rules={[{
      required: true,
      message: 'Please input your username!'
    }]}>\r
        <Input />\r
      </Form.Item>\r
\r
      <Form.Item label="Password" name="password" rules={[{
      required: true,
      message: 'Please input your password!'
    }]}>\r
        <Input.Password />\r
      </Form.Item>\r
\r
      <Form.Item name="remember" valuePropName="checked" wrapperCol={{
      offset: 8,
      span: 16
    }}>\r
        <Checkbox>Remember me</Checkbox>\r
      </Form.Item>\r
\r
      <Form.Item wrapperCol={{
      offset: 8,
      span: 16
    }}>\r
        <Button type="primary" htmlType="submit">\r
          Submit\r
        </Button>\r
      </Form.Item>\r
    </Form>
}`,...(c=(u=o.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var h,x,b;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Form name="validation" labelCol={{
    span: 6
  }} wrapperCol={{
    span: 18
  }} style={{
    maxWidth: 600
  }}>\r
      <Form.Item label="Email" name="email" rules={[{
      required: true,
      message: 'Please input your email!'
    }, {
      type: 'email',
      message: 'Please enter a valid email!'
    }]}>\r
        <Input placeholder="user@example.com" />\r
      </Form.Item>\r
\r
      <Form.Item label="Age" name="age" rules={[{
      required: true,
      message: 'Please input your age!'
    }, {
      type: 'number',
      min: 1,
      max: 120,
      message: 'Age must be between 1 and 120'
    }]}>\r
        <Input type="number" />\r
      </Form.Item>\r
\r
      <Form.Item label="Website" name="website" rules={[{
      type: 'url',
      message: 'Please enter a valid URL!'
    }]}>\r
        <Input placeholder="https://example.com" />\r
      </Form.Item>\r
\r
      <Form.Item wrapperCol={{
      offset: 6,
      span: 18
    }}>\r
        <Button type="primary" htmlType="submit">\r
          Submit\r
        </Button>\r
      </Form.Item>\r
    </Form>
}`,...(b=(x=i.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var I,y,j;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }} size="large">\r
      <div>\r
        <h4>Horizontal Layout</h4>\r
        <Form layout="horizontal" style={{
        maxWidth: 600
      }}>\r
          <Form.Item label="Name" name="name">\r
            <Input />\r
          </Form.Item>\r
          <Form.Item label="Email" name="email">\r
            <Input />\r
          </Form.Item>\r
        </Form>\r
      </div>\r
\r
      <div>\r
        <h4>Vertical Layout</h4>\r
        <Form layout="vertical" style={{
        maxWidth: 600
      }}>\r
          <Form.Item label="Name" name="name">\r
            <Input />\r
          </Form.Item>\r
          <Form.Item label="Email" name="email">\r
            <Input />\r
          </Form.Item>\r
        </Form>\r
      </div>\r
\r
      <div>\r
        <h4>Inline Layout</h4>\r
        <Form layout="inline">\r
          <Form.Item label="Name" name="name">\r
            <Input />\r
          </Form.Item>\r
          <Form.Item label="Email" name="email">\r
            <Input />\r
          </Form.Item>\r
          <Form.Item>\r
            <Button type="primary">Submit</Button>\r
          </Form.Item>\r
        </Form>\r
      </div>\r
    </Space>
}`,...(j=(y=l.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var F,v,f;s.parameters={...s.parameters,docs:{...(F=s.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <Form name="fieldTypes" labelCol={{
    span: 6
  }} wrapperCol={{
    span: 18
  }} style={{
    maxWidth: 600
  }}>\r
      <Form.Item label="Input" name="input">\r
        <Input placeholder="Basic input" />\r
      </Form.Item>\r
\r
      <Form.Item label="Select" name="select">\r
        <Select>\r
          <Select.Option value="1">Option 1</Select.Option>\r
          <Select.Option value="2">Option 2</Select.Option>\r
        </Select>\r
      </Form.Item>\r
\r
      <Form.Item label="Radio" name="radio">\r
        <Radio.Group>\r
          <Radio value="a">A</Radio>\r
          <Radio value="b">B</Radio>\r
          <Radio value="c">C</Radio>\r
        </Radio.Group>\r
      </Form.Item>\r
\r
      <Form.Item label="Checkbox" name="checkbox" valuePropName="checked">\r
        <Checkbox>Agree to terms</Checkbox>\r
      </Form.Item>\r
\r
      <Form.Item label="TextArea" name="textarea">\r
        <Input.TextArea rows={4} />\r
      </Form.Item>\r
\r
      <Form.Item wrapperCol={{
      offset: 6,
      span: 18
    }}>\r
        <Button type="primary" htmlType="submit">\r
          Submit\r
        </Button>\r
      </Form.Item>\r
    </Form>
}`,...(f=(v=s.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var g,C,w;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Form name="disabled" disabled labelCol={{
    span: 6
  }} wrapperCol={{
    span: 18
  }} style={{
    maxWidth: 600
  }} initialValues={{
    name: 'John Doe',
    email: 'john@example.com'
  }}>\r
      <Form.Item label="Name" name="name">\r
        <Input />\r
      </Form.Item>\r
\r
      <Form.Item label="Email" name="email">\r
        <Input />\r
      </Form.Item>\r
\r
      <Form.Item wrapperCol={{
      offset: 6,
      span: 18
    }}>\r
        <Button type="primary" htmlType="submit">\r
          Submit\r
        </Button>\r
      </Form.Item>\r
    </Form>
}`,...(w=(C=n.parameters)==null?void 0:C.docs)==null?void 0:w.source}}};const tr=["Basic","WithValidation","Layouts","FieldTypes","Disabled"];export{o as Basic,n as Disabled,s as FieldTypes,l as Layouts,i as WithValidation,tr as __namedExportsOrder,ar as default};
