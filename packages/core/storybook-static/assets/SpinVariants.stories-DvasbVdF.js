import{j as e,r as i}from"./iframe-Dz2LC5nm.js";import{S as k}from"./index-DuulPivk.js";import{S as o}from"./index-_UlGzK8j.js";import{B as a}from"./button-D6Z5Xr5r.js";import{C as d}from"./index-z5wVk1x2.js";import{T as me}from"./index-CWlopGM_.js";import{A as ce}from"./index-BuhmEhxr.js";import{R as he}from"./LoadingOutlined-BrYRsAZK.js";import"./preload-helper-C1FmrZbK.js";import"./index-CUWDS_la.js";import"./reactNode-B7JGm4rf.js";import"./Keyframes-DYCYu-A0.js";import"./genStyleUtils-BYYxHtb1.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./omit-DXgDXInf.js";import"./index-BKBr2mfS.js";import"./isVisible-DhUEo0yb.js";import"./asyncToGenerator-BNpDlXbe.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./ColorPresets-C28DuSIB.js";import"./useMergedState-DIkF75NH.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./motion-Ct_bxEw8.js";import"./collapse-BbEVqHco.js";import"./useLocale-i3AsUBCw.js";import"./compact-item-BQH2bmb8.js";import"./Skeleton-_C6qiOOr.js";import"./index-BfB3k0in.js";import"./CloseOutlined-Uef9iQNA.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./PlusOutlined-ChoHNIra.js";import"./isMobile-DjGTsQxe.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./Dropdown-ncGrBRcY.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./useCSSVarCls-BbjthPCx.js";import"./slide-ewzjqjuQ.js";import"./motion-DteYqKxb.js";import"./useVariants-CQySXX5A.js";import"./context-DwFXXsmv.js";import"./styleChecker-LD4ekl8e.js";import"./index-DiRJBLqM.js";import"./ContextIsolator-MQGvi7R6.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./zoom-CWPxwh-U.js";import"./colors-rnPH_CWp.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./index-CJ7UoYAk.js";import"./toList-CER2sblB.js";import"./CheckOutlined-BbyNuZCI.js";import"./CheckCircleFilled-D7WBbQQv.js";import"./ExclamationCircleFilled-CePF5EWt.js";import"./InfoCircleFilled-CWRJK2Dg.js";const l=({loading:r=!0,children:t,minHeight:n=200,fullHeight:p=!1,...m})=>{const u={minHeight:p?"100vh":n,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"};return r?e.jsx("div",{style:u,children:e.jsx(k,{...m})}):e.jsx(e.Fragment,{children:t})};l.displayName="LoadingContainer";l.__docgenInfo={description:"",methods:[],displayName:"LoadingContainer",props:{loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},minHeight:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"",defaultValue:{value:"200",computed:!1}},fullHeight:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["AntSpinProps"]};const g=({tip:r="Loading...",backgroundColor:t="rgba(255, 255, 255, 0.9)",size:n="large",...p})=>e.jsx("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:t,zIndex:9999},children:e.jsx(k,{tip:r,size:n,...p})});g.displayName="PageLoader";g.__docgenInfo={description:"",methods:[],displayName:"PageLoader",props:{tip:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Loading...'",computed:!1}},backgroundColor:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'rgba(255, 255, 255, 0.9)'",computed:!1}},size:{defaultValue:{value:"'large'",computed:!1},required:!1}},composes:["AntSpinProps"]};const c=({loading:r=!1,children:t,delay:n=0,blur:p=!0,tip:m,...u})=>{const ge={position:"relative"},ue={filter:r&&p?"blur(2px)":"none",transition:"filter 0.3s ease",pointerEvents:r?"none":"auto"};return e.jsx("div",{style:ge,children:e.jsx(k,{spinning:r,delay:n,tip:m,...u,children:e.jsx("div",{style:ue,children:t})})})};c.displayName="SpinContainer";c.__docgenInfo={description:"",methods:[],displayName:"SpinContainer",props:{loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},delay:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},blur:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}}},composes:["Omit"]};const{Paragraph:s,Title:pe}=me,Hr={title:"Feedback/Spin/Variants",tags:["autodocs"],parameters:{docs:{description:{component:`
Variantes del indicador de carga Spin para diferentes contextos y estilos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/spin)
- [🎨 API de Props](https://ant.design/components/spin#api)
- [💡 Ejemplos](https://ant.design/components/spin#examples)

## Cuándo usar

- Para indicar procesos de carga en diferentes tamaños y contextos
- Cuando necesitas feedback visual durante operaciones asíncronas
- Para overlay de carga sobre contenido existente
        `}}}},h={render:()=>{const[r,t]=i.useState(!0);return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{onClick:()=>t(!r),children:r?"Show Content":"Show Loading"}),e.jsx(l,{loading:r,children:e.jsxs(d,{children:[e.jsx(pe,{level:4,children:"Content Loaded"}),e.jsx(s,{children:"This content is displayed when loading is complete."})]})})]})}},C={render:()=>{const[r,t]=i.useState(!0);return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{onClick:()=>t(!r),children:"Toggle Loading"}),e.jsx(l,{loading:r,tip:"Loading data...",minHeight:300,children:e.jsx(ce,{message:"Data Loaded",description:"Your data has been successfully loaded.",type:"success",showIcon:!0})})]})}},f={render:()=>{const[r,t]=i.useState(!0);return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{onClick:()=>t(!r),children:"Toggle Loading"}),e.jsx(l,{loading:r,fullHeight:!0,children:e.jsxs("div",{style:{padding:20},children:[e.jsx(pe,{level:2,children:"Full Page Content"}),e.jsx(s,{children:"This container takes full viewport height."})]})})]})}},L={render:()=>e.jsxs(o,{direction:"vertical",size:"large",style:{width:"100%"},children:[e.jsx(l,{loading:!0,size:"small",minHeight:150}),e.jsx(l,{loading:!0,size:"default",minHeight:150}),e.jsx(l,{loading:!0,size:"large",minHeight:150})]})},S={render:()=>{const[r,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(a,{type:"primary",onClick:()=>t(!0),children:"Show Page Loader"}),r&&e.jsx(g,{tip:"Loading page..."}),r&&setTimeout(()=>t(!1),3e3)]})}},y={render:()=>{const[r,t]=i.useState(null);return e.jsxs(e.Fragment,{children:[e.jsxs(o,{children:[e.jsx(a,{onClick:()=>t("default"),children:"Default"}),e.jsx(a,{onClick:()=>t("transparent"),children:"Transparent"}),e.jsx(a,{onClick:()=>t("dark"),children:"Dark"})]}),r==="default"&&e.jsx(g,{tip:"Loading..."}),r==="transparent"&&e.jsx(g,{tip:"Loading...",backgroundColor:"rgba(255, 255, 255, 0.5)"}),r==="dark"&&e.jsx(g,{tip:"Loading...",backgroundColor:"rgba(0, 0, 0, 0.7)",style:{color:"white"}}),r&&setTimeout(()=>t(null),2e3)]})}},x={render:()=>{const[r,t]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(a,{type:"primary",onClick:()=>t(!0),children:"Show Custom Loader"}),r&&e.jsx(g,{tip:"Processing...",indicator:e.jsx(he,{style:{fontSize:48},spin:!0})}),r&&setTimeout(()=>t(!1),3e3)]})}},j={render:()=>{const[r,t]=i.useState(!1),n=()=>{t(!0),setTimeout(()=>t(!1),2e3)};return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{onClick:n,children:"Load Data"}),e.jsx(c,{loading:r,children:e.jsxs(d,{title:"Content Card",style:{width:400},children:[e.jsx(s,{children:"This content will be overlaid with a spinner when loading."}),e.jsx(s,{children:"The blur effect helps indicate that the content is being updated."})]})})]})}},w={render:()=>{const[r,t]=i.useState(!1),n=()=>{t(!0),setTimeout(()=>t(!1),2e3)};return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(ce,{message:"Delay Demo",description:"The spinner will appear after 500ms delay",type:"info",showIcon:!0}),e.jsx(a,{onClick:n,children:"Load with Delay"}),e.jsx(c,{loading:r,delay:500,tip:"Loading...",children:e.jsx(d,{title:"Delayed Spinner",style:{width:400},children:e.jsx(s,{children:"The spinner appears after a 500ms delay to avoid flickering for quick operations."})})})]})}},T={render:()=>{const[r,t]=i.useState(!1),n=()=>{t(!0),setTimeout(()=>t(!1),2e3)};return e.jsxs(o,{direction:"vertical",style:{width:"100%"},children:[e.jsx(a,{onClick:n,children:"Load Data"}),e.jsx(c,{loading:r,blur:!1,children:e.jsx(d,{title:"No Blur Effect",style:{width:400},children:e.jsx(s,{children:"This container doesn't apply blur effect to the content when loading."})})})]})}},v={render:()=>{const[r,t]=i.useState(!1),[n,p]=i.useState(!1),[m,u]=i.useState(!1);return e.jsxs(o,{direction:"vertical",size:"large",style:{width:"100%"},children:[e.jsxs(o,{children:[e.jsx(a,{onClick:()=>{t(!0),setTimeout(()=>t(!1),2e3)},children:"Load Card 1"}),e.jsx(a,{onClick:()=>{p(!0),setTimeout(()=>p(!1),2e3)},children:"Load Card 2"}),e.jsx(a,{onClick:()=>{u(!0),setTimeout(()=>u(!1),2e3)},children:"Load Card 3"})]}),e.jsxs(o,{size:"large",children:[e.jsx(c,{loading:r,size:"small",children:e.jsx(d,{title:"Card 1",style:{width:250},children:e.jsx(s,{children:"Content for card 1"})})}),e.jsx(c,{loading:n,size:"default",tip:"Loading...",children:e.jsx(d,{title:"Card 2",style:{width:250},children:e.jsx(s,{children:"Content for card 2"})})}),e.jsx(c,{loading:m,size:"large",children:e.jsx(d,{title:"Card 3",style:{width:250},children:e.jsx(s,{children:"Content for card 3"})})})]})]})}},P={render:()=>{const[r,t]=i.useState(null);return e.jsxs(e.Fragment,{children:[e.jsxs(o,{size:"large",children:[e.jsx(a,{type:"primary",onClick:()=>t("container"),children:"Spin Container"}),e.jsx(a,{type:"primary",onClick:()=>t("page"),children:"Page Loader"}),e.jsx(a,{type:"primary",onClick:()=>t("loading"),children:"Loading Container"})]}),r==="container"&&e.jsx("div",{style:{marginTop:20},children:e.jsx(c,{loading:!0,tip:"Using SpinContainer...",children:e.jsx(d,{title:"Spin Container",style:{width:500},children:e.jsx(s,{children:"Best for inline loading states where content is updated."})})})}),r==="page"&&e.jsx(g,{tip:"Using PageLoader..."}),r==="loading"&&e.jsx("div",{style:{marginTop:20},children:e.jsx(l,{loading:!0,tip:"Using LoadingContainer...",minHeight:300,children:e.jsx(d,{title:"Loading Container",children:e.jsx(s,{children:"This won't show until loading is false"})})})}),r&&setTimeout(()=>t(null),3e3)]})}};var B,b,z;h.parameters={...h.parameters,docs:{...(B=h.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(true);
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Button onClick={() => setLoading(!loading)}>\r
          {loading ? 'Show Content' : 'Show Loading'}\r
        </Button>\r
        <LoadingContainer loading={loading}>\r
          <Card>\r
            <Title level={4}>Content Loaded</Title>\r
            <Paragraph>\r
              This content is displayed when loading is complete.\r
            </Paragraph>\r
          </Card>\r
        </LoadingContainer>\r
      </Space>;
  }
}`,...(z=(b=h.parameters)==null?void 0:b.docs)==null?void 0:z.source}}};var D,V,H;C.parameters={...C.parameters,docs:{...(D=C.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(true);
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Button onClick={() => setLoading(!loading)}>Toggle Loading</Button>\r
        <LoadingContainer loading={loading} tip="Loading data..." minHeight={300}>\r
          <Alert message="Data Loaded" description="Your data has been successfully loaded." type="success" showIcon />\r
        </LoadingContainer>\r
      </Space>;
  }
}`,...(H=(V=C.parameters)==null?void 0:V.docs)==null?void 0:H.source}}};var I,N,q;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(true);
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Button onClick={() => setLoading(!loading)}>Toggle Loading</Button>\r
        <LoadingContainer loading={loading} fullHeight>\r
          <div style={{
          padding: 20
        }}>\r
            <Title level={2}>Full Page Content</Title>\r
            <Paragraph>This container takes full viewport height.</Paragraph>\r
          </div>\r
        </LoadingContainer>\r
      </Space>;
  }
}`,...(q=(N=f.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var R,F,A;L.parameters={...L.parameters,docs:{...(R=L.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" size="large" style={{
    width: '100%'
  }}>\r
      <LoadingContainer loading={true} size="small" minHeight={150} />\r
      <LoadingContainer loading={true} size="default" minHeight={150} />\r
      <LoadingContainer loading={true} size="large" minHeight={150} />\r
    </Space>
}`,...(A=(F=L.parameters)==null?void 0:F.docs)==null?void 0:A.source}}};var _,E,U;S.parameters={...S.parameters,docs:{...(_=S.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setLoading(true)}>\r
          Show Page Loader\r
        </Button>\r
        {loading && <PageLoader tip="Loading page..." />}\r
        {loading && setTimeout(() => setLoading(false), 3000)}\r
      </>;
  }
}`,...(U=(E=S.parameters)==null?void 0:E.docs)==null?void 0:U.source}}};var W,O,M;y.parameters={...y.parameters,docs:{...(W=y.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const [variant, setVariant] = useState<string | null>(null);
    return <>\r
        <Space>\r
          <Button onClick={() => setVariant('default')}>Default</Button>\r
          <Button onClick={() => setVariant('transparent')}>Transparent</Button>\r
          <Button onClick={() => setVariant('dark')}>Dark</Button>\r
        </Space>\r
\r
        {variant === 'default' && <PageLoader tip="Loading..." />}\r
        {variant === 'transparent' && <PageLoader tip="Loading..." backgroundColor="rgba(255, 255, 255, 0.5)" />}\r
        {variant === 'dark' && <PageLoader tip="Loading..." backgroundColor="rgba(0, 0, 0, 0.7)" style={{
        color: 'white'
      }} />}\r
        {variant && setTimeout(() => setVariant(null), 2000)}\r
      </>;
  }
}`,...(M=(O=y.parameters)==null?void 0:O.docs)==null?void 0:M.source}}};var Y,G,J;x.parameters={...x.parameters,docs:{...(Y=x.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    return <>\r
        <Button type="primary" onClick={() => setLoading(true)}>\r
          Show Custom Loader\r
        </Button>\r
        {loading && <PageLoader tip="Processing..." indicator={<LoadingOutlined style={{
        fontSize: 48
      }} spin />} />}\r
        {loading && setTimeout(() => setLoading(false), 3000)}\r
      </>;
  }
}`,...(J=(G=x.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var K,Q,X;j.parameters={...j.parameters,docs:{...(K=j.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Button onClick={handleLoad}>Load Data</Button>\r
        <SpinContainer loading={loading}>\r
          <Card title="Content Card" style={{
          width: 400
        }}>\r
            <Paragraph>\r
              This content will be overlaid with a spinner when loading.\r
            </Paragraph>\r
            <Paragraph>\r
              The blur effect helps indicate that the content is being updated.\r
            </Paragraph>\r
          </Card>\r
        </SpinContainer>\r
      </Space>;
  }
}`,...(X=(Q=j.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};var Z,$,ee;w.parameters={...w.parameters,docs:{...(Z=w.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Alert message="Delay Demo" description="The spinner will appear after 500ms delay" type="info" showIcon />\r
        <Button onClick={handleLoad}>Load with Delay</Button>\r
        <SpinContainer loading={loading} delay={500} tip="Loading...">\r
          <Card title="Delayed Spinner" style={{
          width: 400
        }}>\r
            <Paragraph>\r
              The spinner appears after a 500ms delay to avoid flickering for\r
              quick operations.\r
            </Paragraph>\r
          </Card>\r
        </SpinContainer>\r
      </Space>;
  }
}`,...(ee=($=w.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var re,te,ae;T.parameters={...T.parameters,docs:{...(re=T.parameters)==null?void 0:re.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(false);
    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return <Space direction="vertical" style={{
      width: '100%'
    }}>\r
        <Button onClick={handleLoad}>Load Data</Button>\r
        <SpinContainer loading={loading} blur={false}>\r
          <Card title="No Blur Effect" style={{
          width: 400
        }}>\r
            <Paragraph>\r
              This container doesn't apply blur effect to the content when loading.\r
            </Paragraph>\r
          </Card>\r
        </SpinContainer>\r
      </Space>;
  }
}`,...(ae=(te=T.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var ne,ie,oe;v.parameters={...v.parameters,docs:{...(ne=v.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  render: () => {
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    return <Space direction="vertical" size="large" style={{
      width: '100%'
    }}>\r
        <Space>\r
          <Button onClick={() => {
          setLoading1(true);
          setTimeout(() => setLoading1(false), 2000);
        }}>\r
            Load Card 1\r
          </Button>\r
          <Button onClick={() => {
          setLoading2(true);
          setTimeout(() => setLoading2(false), 2000);
        }}>\r
            Load Card 2\r
          </Button>\r
          <Button onClick={() => {
          setLoading3(true);
          setTimeout(() => setLoading3(false), 2000);
        }}>\r
            Load Card 3\r
          </Button>\r
        </Space>\r
\r
        <Space size="large">\r
          <SpinContainer loading={loading1} size="small">\r
            <Card title="Card 1" style={{
            width: 250
          }}>\r
              <Paragraph>Content for card 1</Paragraph>\r
            </Card>\r
          </SpinContainer>\r
\r
          <SpinContainer loading={loading2} size="default" tip="Loading...">\r
            <Card title="Card 2" style={{
            width: 250
          }}>\r
              <Paragraph>Content for card 2</Paragraph>\r
            </Card>\r
          </SpinContainer>\r
\r
          <SpinContainer loading={loading3} size="large">\r
            <Card title="Card 3" style={{
            width: 250
          }}>\r
              <Paragraph>Content for card 3</Paragraph>\r
            </Card>\r
          </SpinContainer>\r
        </Space>\r
      </Space>;
  }
}`,...(oe=(ie=v.parameters)==null?void 0:ie.docs)==null?void 0:oe.source}}};var se,de,le;P.parameters={...P.parameters,docs:{...(se=P.parameters)==null?void 0:se.docs,source:{originalSource:`{
  render: () => {
    const [scenario, setScenario] = useState<'container' | 'page' | 'loading' | null>(null);
    return <>\r
        <Space size="large">\r
          <Button type="primary" onClick={() => setScenario('container')}>\r
            Spin Container\r
          </Button>\r
          <Button type="primary" onClick={() => setScenario('page')}>\r
            Page Loader\r
          </Button>\r
          <Button type="primary" onClick={() => setScenario('loading')}>\r
            Loading Container\r
          </Button>\r
        </Space>\r
\r
        {scenario === 'container' && <div style={{
        marginTop: 20
      }}>\r
            <SpinContainer loading={true} tip="Using SpinContainer...">\r
              <Card title="Spin Container" style={{
            width: 500
          }}>\r
                <Paragraph>\r
                  Best for inline loading states where content is updated.\r
                </Paragraph>\r
              </Card>\r
            </SpinContainer>\r
          </div>}\r
\r
        {scenario === 'page' && <PageLoader tip="Using PageLoader..." />}\r
\r
        {scenario === 'loading' && <div style={{
        marginTop: 20
      }}>\r
            <LoadingContainer loading={true} tip="Using LoadingContainer..." minHeight={300}>\r
              <Card title="Loading Container">\r
                <Paragraph>This won't show until loading is false</Paragraph>\r
              </Card>\r
            </LoadingContainer>\r
          </div>}\r
\r
        {scenario && setTimeout(() => setScenario(null), 3000)}\r
      </>;
  }
}`,...(le=(de=P.parameters)==null?void 0:de.docs)==null?void 0:le.source}}};const Ir=["BasicLoadingContainer","LoadingContainerWithTip","FullHeightLoadingContainer","LoadingContainerSizes","BasicPageLoader","PageLoaderVariants","CustomIconPageLoader","BasicSpinContainer","SpinContainerWithDelay","SpinContainerNoBlur","MultipleSpinContainers","ComparisonDemo"];export{h as BasicLoadingContainer,S as BasicPageLoader,j as BasicSpinContainer,P as ComparisonDemo,x as CustomIconPageLoader,f as FullHeightLoadingContainer,L as LoadingContainerSizes,C as LoadingContainerWithTip,v as MultipleSpinContainers,y as PageLoaderVariants,T as SpinContainerNoBlur,w as SpinContainerWithDelay,Ir as __namedExportsOrder,Hr as default};
