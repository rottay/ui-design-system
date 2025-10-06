import{j as e}from"./iframe-Dz2LC5nm.js";import{S as r}from"./Skeleton-_C6qiOOr.js";import{S as t}from"./index-_UlGzK8j.js";import"./preload-helper-C1FmrZbK.js";import"./omit-DXgDXInf.js";import"./Keyframes-DYCYu-A0.js";import"./genStyleUtils-BYYxHtb1.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";const a=G=>e.jsx(r,{...G});a.displayName="Skeleton";a.__docgenInfo={description:"",methods:[],displayName:"Skeleton",composes:["AntSkeletonProps"]};const re={title:"Feedback/Skeleton",component:a,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de esqueleto para mostrar placeholder mientras se carga el contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/skeleton)
- [🎨 API de Props](https://ant.design/components/skeleton#api)
- [💡 Ejemplos](https://ant.design/components/skeleton#examples)

## Cuándo usar

- Mientras el contenido se está cargando, se muestra un esqueleto para mejorar la experiencia del usuario.
- Soporta diferentes formas y tamaños para avatares, botones, inputs e imágenes.
        `}}},argTypes:{active:{control:"boolean"},loading:{control:"boolean"},round:{control:"boolean"}}},n={args:{}},s={args:{active:!0}},o={args:{avatar:!0,paragraph:{rows:4}}},c={args:{avatar:!0,round:!0,paragraph:{rows:4}}},i={render:()=>e.jsxs(t,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{active:!0,paragraph:{rows:1}}),e.jsx(a,{active:!0,paragraph:{rows:2}}),e.jsx(a,{active:!0,paragraph:{rows:4}})]})},p={render:()=>e.jsxs(t,{children:[e.jsx(r.Button,{active:!0}),e.jsx(r.Button,{active:!0,size:"small"}),e.jsx(r.Button,{active:!0,size:"large"}),e.jsx(r.Button,{active:!0,shape:"round"}),e.jsx(r.Button,{active:!0,shape:"circle"})]})},l={render:()=>e.jsxs(t,{children:[e.jsx(r.Avatar,{active:!0}),e.jsx(r.Avatar,{active:!0,size:"small"}),e.jsx(r.Avatar,{active:!0,size:"large"}),e.jsx(r.Avatar,{active:!0,shape:"square"})]})},u={render:()=>e.jsxs(t,{direction:"vertical",children:[e.jsx(r.Input,{active:!0}),e.jsx(r.Input,{active:!0,size:"small"}),e.jsx(r.Input,{active:!0,size:"large"})]})},d={render:()=>e.jsxs(t,{children:[e.jsx(r.Image,{}),e.jsx(r.Image,{style:{width:200,height:200}})]})},m={args:{loading:!1,avatar:!0,paragraph:{rows:4},children:e.jsxs("div",{children:[e.jsx("h4",{children:"Ant Design Title"}),e.jsx("p",{children:"Ant Design, a design language for background applications, is refined by Ant UED Team."})]})}};var g,v,S;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {}
}`,...(S=(v=n.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var h,A,k;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    active: true
  }
}`,...(k=(A=s.parameters)==null?void 0:A.docs)==null?void 0:k.source}}};var x,j,w;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    avatar: true,
    paragraph: {
      rows: 4
    }
  }
}`,...(w=(j=o.parameters)==null?void 0:j.docs)==null?void 0:w.source}}};var I,f,B;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    avatar: true,
    round: true,
    paragraph: {
      rows: 4
    }
  }
}`,...(B=(f=c.parameters)==null?void 0:f.docs)==null?void 0:B.source}}};var z,y,b;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" style={{
    width: '100%'
  }}>\r
      <Skeleton active paragraph={{
      rows: 1
    }} />\r
      <Skeleton active paragraph={{
      rows: 2
    }} />\r
      <Skeleton active paragraph={{
      rows: 4
    }} />\r
    </Space>
}`,...(b=(y=i.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var D,C,R;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Space>\r
      <AntSkeleton.Button active />\r
      <AntSkeleton.Button active size="small" />\r
      <AntSkeleton.Button active size="large" />\r
      <AntSkeleton.Button active shape="round" />\r
      <AntSkeleton.Button active shape="circle" />\r
    </Space>
}`,...(R=(C=p.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var E,T,q;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <Space>\r
      <AntSkeleton.Avatar active />\r
      <AntSkeleton.Avatar active size="small" />\r
      <AntSkeleton.Avatar active size="large" />\r
      <AntSkeleton.Avatar active shape="square" />\r
    </Space>
}`,...(q=(T=l.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var W,_,P;u.parameters={...u.parameters,docs:{...(W=u.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <Space direction="vertical">\r
      <AntSkeleton.Input active />\r
      <AntSkeleton.Input active size="small" />\r
      <AntSkeleton.Input active size="large" />\r
    </Space>
}`,...(P=(_=u.parameters)==null?void 0:_.docs)==null?void 0:P.source}}};var N,U,F;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <Space>\r
      <AntSkeleton.Image />\r
      <AntSkeleton.Image style={{
      width: 200,
      height: 200
    }} />\r
    </Space>
}`,...(F=(U=d.parameters)==null?void 0:U.docs)==null?void 0:F.source}}};var M,O,$;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    loading: false,
    avatar: true,
    paragraph: {
      rows: 4
    },
    children: <div>\r
        <h4>Ant Design Title</h4>\r
        <p>\r
          Ant Design, a design language for background applications, is refined by Ant UED Team.\r
        </p>\r
      </div>
  }
}`,...($=(O=m.parameters)==null?void 0:O.docs)==null?void 0:$.source}}};const ae=["Basic","Active","WithAvatar","Round","CustomRows","SkeletonButton","SkeletonAvatar","SkeletonInput","SkeletonImage","WithContent"];export{s as Active,n as Basic,i as CustomRows,c as Round,l as SkeletonAvatar,p as SkeletonButton,d as SkeletonImage,u as SkeletonInput,o as WithAvatar,m as WithContent,ae as __namedExportsOrder,re as default};
