import{j as e,r as d}from"./iframe-Dz2LC5nm.js";import{C as t}from"./index-Cf_mJIPq.js";import{S as p}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./useBubbleLock-CZY2ua_G.js";import"./useMergedState-DIkF75NH.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./reactNode-B7JGm4rf.js";import"./genStyleUtils-BYYxHtb1.js";import"./asyncToGenerator-BNpDlXbe.js";import"./useCSSVarCls-BbjthPCx.js";import"./context-DwFXXsmv.js";import"./toArray-CcRQ9JCW.js";import"./omit-DXgDXInf.js";import"./index-yP-ZuFQg.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";const $={title:"Inputs/Checkbox",component:t,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de casilla de verificación para selecciones múltiples.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/checkbox)
- [🎨 API de Props](https://ant.design/components/checkbox#api)
- [💡 Ejemplos](https://ant.design/components/checkbox#examples)

## Cuándo usar

- Para permitir al usuario seleccionar múltiples opciones de un conjunto.
- Soporta estados indeterminados y grupos de checkboxes.
        `}}},argTypes:{disabled:{control:"boolean"},indeterminate:{control:"boolean"}}},a={args:{children:"Checkbox"}},c={render:()=>e.jsxs(p,{direction:"vertical",children:[e.jsx(t,{disabled:!0,children:"Disabled"}),e.jsx(t,{disabled:!0,checked:!0,children:"Disabled and checked"})]})},s={render:()=>{const n=[{label:"Apple",value:"Apple"},{label:"Pear",value:"Pear"},{label:"Orange",value:"Orange"}];return e.jsxs(p,{direction:"vertical",children:[e.jsx(t.Group,{options:n,defaultValue:["Apple"]}),e.jsx(t.Group,{options:n,defaultValue:["Apple","Orange"],disabled:!0})]})}},i={render:()=>{const n=()=>{const[E,h]=d.useState(["Apple"]),[L,u]=d.useState(!0),[y,m]=d.useState(!1),o=["Apple","Pear","Orange"],B=r=>{h(r),u(!!r.length&&r.length<o.length),m(r.length===o.length)},V=r=>{h(r.target.checked?o:[]),u(!1),m(r.target.checked)};return e.jsxs(p,{direction:"vertical",children:[e.jsx(t,{indeterminate:L,onChange:V,checked:y,children:"Check all"}),e.jsx(t.Group,{options:o,value:E,onChange:B})]})};return e.jsx(n,{})}},l={render:()=>e.jsxs(p,{direction:"vertical",children:[e.jsx(t,{children:"Option A"}),e.jsx(t,{children:"Option B"}),e.jsx(t,{children:"Option C"}),e.jsx(t,{checked:!0,children:"Checked by default"})]})};var k,x,C;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    children: 'Checkbox'
  }
}`,...(C=(x=a.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var b,g,A;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <Checkbox disabled>Disabled</Checkbox>\r
      <Checkbox disabled checked>\r
        Disabled and checked\r
      </Checkbox>\r
    </Space>
}`,...(A=(g=c.parameters)==null?void 0:g.docs)==null?void 0:A.source}}};var S,O,j;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const options = [{
      label: 'Apple',
      value: 'Apple'
    }, {
      label: 'Pear',
      value: 'Pear'
    }, {
      label: 'Orange',
      value: 'Orange'
    }];
    return <Space direction="vertical">\r
        <AntCheckbox.Group options={options} defaultValue={['Apple']} />\r
        <AntCheckbox.Group options={options} defaultValue={['Apple', 'Orange']} disabled />\r
      </Space>;
  }
}`,...(j=(O=s.parameters)==null?void 0:O.docs)==null?void 0:j.source}}};var v,f,G;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const CheckboxGroupExample = () => {
      const [checkedList, setCheckedList] = useState<string[]>(['Apple']);
      const [indeterminate, setIndeterminate] = useState(true);
      const [checkAll, setCheckAll] = useState(false);
      const plainOptions = ['Apple', 'Pear', 'Orange'];
      const onChange = (list: string[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < plainOptions.length);
        setCheckAll(list.length === plainOptions.length);
      };
      const onCheckAllChange = (e: any) => {
        setCheckedList(e.target.checked ? plainOptions : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
      };
      return <Space direction="vertical">\r
          <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>\r
            Check all\r
          </Checkbox>\r
          <AntCheckbox.Group options={plainOptions} value={checkedList} onChange={onChange as any} />\r
        </Space>;
    };
    return <CheckboxGroupExample />;
  }
}`,...(G=(f=i.parameters)==null?void 0:f.docs)==null?void 0:G.source}}};var D,P,I;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <Checkbox>Option A</Checkbox>\r
      <Checkbox>Option B</Checkbox>\r
      <Checkbox>Option C</Checkbox>\r
      <Checkbox checked>Checked by default</Checkbox>\r
    </Space>
}`,...(I=(P=l.parameters)==null?void 0:P.docs)==null?void 0:I.source}}};const ee=["Basic","Disabled","CheckboxGroup","Indeterminate","WithText"];export{a as Basic,s as CheckboxGroup,c as Disabled,i as Indeterminate,l as WithText,ee as __namedExportsOrder,$ as default};
