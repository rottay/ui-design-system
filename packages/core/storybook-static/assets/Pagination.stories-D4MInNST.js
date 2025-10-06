import{j as N}from"./iframe-Dz2LC5nm.js";import{P as _}from"./Pagination-pVHlF751.js";import"./preload-helper-C1FmrZbK.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./LeftOutlined-B29Bdkke.js";import"./RightOutlined-BDL0sfNG.js";import"./useMergedState-DIkF75NH.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./useSize-oyF83k_j.js";import"./useBreakpoint-DFMomBk2.js";import"./useForceUpdate--fWHWdeQ.js";import"./index-giBHWRYY.js";import"./useShowArrow-CzgaiXTk.js";import"./isMobile-DjGTsQxe.js";import"./Overflow-DfKHW_HQ.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./isVisible-DhUEo0yb.js";import"./omit-DXgDXInf.js";import"./List-0KMFp5pO.js";import"./compact-item-BQH2bmb8.js";import"./genStyleUtils-BYYxHtb1.js";import"./move-DcXnB1RZ.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./slide-ewzjqjuQ.js";import"./useIcons-BAfFo5Jb.js";import"./CheckOutlined-BbyNuZCI.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./CloseOutlined-Uef9iQNA.js";import"./DownOutlined-DLjCd-2z.js";import"./LoadingOutlined-BrYRsAZK.js";import"./SearchOutlined-DEJcv9Lk.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./PurePanel-CuHF6Qyt.js";import"./useVariants-CQySXX5A.js";import"./defaultRenderEmpty-BuJhJCQz.js";import"./index-CZALivOT.js";import"./useLocale-i3AsUBCw.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-CJ7UoYAk.js";const m=p=>N.jsx(_,{...p});m.displayName="Pagination";m.__docgenInfo={description:"",methods:[],displayName:"Pagination",composes:["AntPaginationProps"]};const Ne={title:"Navigation/Pagination",component:m,tags:["autodocs"],parameters:{docs:{description:{component:`
Componente de paginación para navegar entre páginas de datos o contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/pagination)
- [🎨 API de Props](https://ant.design/components/pagination#api)
- [💡 Ejemplos](https://ant.design/components/pagination#examples)

## Cuándo usar

- Para dividir grandes conjuntos de datos en páginas manejables
- Cuando necesitas navegación entre múltiples páginas de resultados
- Para mejorar el rendimiento cargando datos de forma incremental
        `}}},argTypes:{total:{control:{type:"number"},description:"Total number of data items"},defaultCurrent:{control:{type:"number"},description:"Default initial page number",defaultValue:1},defaultPageSize:{control:{type:"number"},description:"Default number of data items per page",defaultValue:10},pageSize:{control:{type:"number"},description:"Number of data items per page"},current:{control:{type:"number"},description:"Current page number"},disabled:{control:{type:"boolean"},description:"Disable pagination"},hideOnSinglePage:{control:{type:"boolean"},description:"Hide pagination when there is only one page"},showSizeChanger:{control:{type:"boolean"},description:"Show page size changer"},showQuickJumper:{control:{type:"boolean"},description:"Show quick jumper"},simple:{control:{type:"boolean"},description:"Simple mode"},size:{control:{type:"select"},options:["default","small"],description:"Size of pagination",defaultValue:"default"},onChange:{action:"page-changed",description:"Callback when page changes"},onShowSizeChange:{action:"size-changed",description:"Callback when pageSize changes"}}},e={args:{defaultCurrent:1,total:50}},t={args:{defaultCurrent:6,total:500}},r={args:{defaultCurrent:1,total:500,showSizeChanger:!0,defaultPageSize:10}},a={args:{simple:!0,defaultCurrent:2,total:50}},o={args:{size:"small",defaultCurrent:1,total:50}},n={args:{total:85,showTotal:p=>`Total ${p} items`,defaultPageSize:20}},i={args:{total:500,showQuickJumper:!0,defaultCurrent:2}},s={args:{defaultCurrent:1,total:50,disabled:!0}};var c,l,u;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    defaultCurrent: 1,
    total: 50
  }
}`,...(u=(l=e.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var d,g,f;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    defaultCurrent: 6,
    total: 500
  }
}`,...(f=(g=t.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var h,S,C;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    defaultCurrent: 1,
    total: 500,
    showSizeChanger: true,
    defaultPageSize: 10
  }
}`,...(C=(S=r.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var b,P,z;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    simple: true,
    defaultCurrent: 2,
    total: 50
  }
}`,...(z=(P=a.parameters)==null?void 0:P.docs)==null?void 0:z.source}}};var w,y,j;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    size: 'small',
    defaultCurrent: 1,
    total: 50
  }
}`,...(j=(y=o.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var k,D,T;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    total: 85,
    showTotal: (total: number) => \`Total \${total} items\`,
    defaultPageSize: 20
  }
}`,...(T=(D=n.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var x,J,Q;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    total: 500,
    showQuickJumper: true,
    defaultCurrent: 2
  }
}`,...(Q=(J=i.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var v,A,M;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    defaultCurrent: 1,
    total: 50,
    disabled: true
  }
}`,...(M=(A=s.parameters)==null?void 0:A.docs)==null?void 0:M.source}}};const _e=["Basic","MorePages","WithPageSize","Simple","Mini","ShowTotal","QuickJumper","Disabled"];export{e as Basic,s as Disabled,o as Mini,t as MorePages,i as QuickJumper,n as ShowTotal,a as Simple,r as WithPageSize,_e as __namedExportsOrder,Ne as default};
