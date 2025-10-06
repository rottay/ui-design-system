import{r as t,j as e}from"./iframe-Dz2LC5nm.js";import{T as me}from"./index-0gBE07ZL.js";import{S as h}from"./index-_UlGzK8j.js";import{I as he}from"./index-BEffNXPx.js";import{R as ge}from"./SearchOutlined-DEJcv9Lk.js";import{B as l}from"./button-D6Z5Xr5r.js";import{R as xe}from"./BellOutlined-CG7KcCtJ.js";import{R as Te}from"./UserOutlined-BiyGGZF1.js";import{D as R}from"./index-CdNgG1lA.js";import{C as u}from"./index-z5wVk1x2.js";import{R as te}from"./SettingOutlined-DGBhaMyr.js";import{T as re}from"./index-CWlopGM_.js";import"./preload-helper-C1FmrZbK.js";import"./Portal-DKHmL-os.js";import"./index-Be-dJp65.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./shadow-smhd3i8u.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./isVisible-DhUEo0yb.js";import"./useMergedState-DIkF75NH.js";import"./pickAttrs-C7BJ3CXo.js";import"./useZIndex-Dv1QJmGl.js";import"./index-DiRJBLqM.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./omit-DXgDXInf.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./motion-Ct_bxEw8.js";import"./roundedArrow-Dc2oY277.js";import"./reactNode-B7JGm4rf.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./CloseOutlined-Uef9iQNA.js";import"./AntdIcon-Bjoc2A0G.js";import"./useLocale-i3AsUBCw.js";import"./useClosable-Db8tzcGm.js";import"./extendsObject-78o_rR5W.js";import"./PurePanel-CuHF6Qyt.js";import"./PurePanel-DhLbvPdD.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";import"./Input-CQB6Cwyl.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./useVariants-CQySXX5A.js";import"./useCSSVarCls-BbjthPCx.js";import"./EyeOutlined-DTzsB5jg.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./index-BKBr2mfS.js";import"./LoadingOutlined-BrYRsAZK.js";import"./ColorPresets-C28DuSIB.js";import"./Collapse-zK5P7h_T.js";import"./RightOutlined-BDL0sfNG.js";import"./KeyCode-HJ8jGXz0.js";import"./collapse-BbEVqHco.js";import"./Skeleton-_C6qiOOr.js";import"./index-BfB3k0in.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./PlusOutlined-ChoHNIra.js";import"./Dropdown-ncGrBRcY.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./slide-ewzjqjuQ.js";import"./styleChecker-LD4ekl8e.js";import"./toList-CER2sblB.js";import"./CheckOutlined-BbyNuZCI.js";const d=({steps:i,autoStart:a=!1,onComplete:o,onSkip:r,showProgress:s=!0,allowSkip:n=!0,skipText:c="Skip Tour",finishText:p="Finish",nextText:g="Next",prevText:f="Previous",open:E,onChange:v,...se})=>{const[oe,ne]=t.useState(a),[ye,L]=t.useState(0),D=E!==void 0,ie=D?E:oe,ae=t.useCallback(T=>{L(T),v==null||v(T)},[v]),le=t.useCallback(()=>{D||ne(!1),L(0),o==null||o()},[D,o]),ce=i.map((T,O)=>{const ue=O===i.length-1,pe=O===0,{target:y,...de}=T,fe=y instanceof HTMLElement||y===null||y===void 0?y:typeof y=="function"?()=>y()||null:null;return{...de,target:fe,title:s?e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:"12px",color:"#999",marginBottom:"4px"},children:["Step ",O+1," of ",i.length]}),T.title]}):T.title,nextButtonProps:ue?{children:p,onClick:le}:{children:g},prevButtonProps:pe?void 0:{children:f}}});return e.jsx(me,{open:ie,onChange:ae,steps:ce,...se})};d.displayName="GuidedTour";const x=()=>{const[i,a]=t.useState(!1),[o,r]=t.useState(0),s=t.useCallback(()=>{a(!0),r(0)},[]),n=t.useCallback(()=>{a(!1),r(0)},[]),c=t.useCallback(()=>{r(f=>f+1)},[]),p=t.useCallback(()=>{r(f=>Math.max(0,f-1))},[]),g=t.useCallback(f=>{r(f)},[]);return{open:i,current:o,start:s,close:n,next:c,prev:p,goTo:g,setOpen:a,setCurrent:r}};d.__docgenInfo={description:"",methods:[],displayName:"GuidedTour",props:{steps:{required:!0,tsType:{name:"Array",elements:[{name:"GuidedTourStep"}],raw:"GuidedTourStep[]"},description:""},autoStart:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onComplete:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onSkip:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},showProgress:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},allowSkip:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},skipText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Skip Tour'",computed:!1}},finishText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Finish'",computed:!1}},nextText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Next'",computed:!1}},prevText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Previous'",computed:!1}}},composes:["Omit"]};const{Title:j,Paragraph:m}=re,Nt={title:"Overlay/Tour/GuidedTour",component:d,tags:["autodocs"],parameters:{docs:{description:{component:`
Tour guiado interactivo que presenta las características de la aplicación paso a paso.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tour)
- [🎨 API de Props](https://ant.design/components/tour#api)
- [💡 Ejemplos](https://ant.design/components/tour#examples)

## Cuándo usar

- Para onboarding de nuevos usuarios
- Cuando necesitas explicar características complejas
- Para guiar usuarios a través de nuevas funcionalidades
        `}}}},C={render:()=>{const{open:i,start:a,setOpen:o}=x(),r=t.useRef(null),s=t.useRef(null),n=t.useRef(null),c=[{title:"Welcome to the Platform",description:"Let's take a quick tour to get you started!"},{title:"Search",description:"Use the search bar to find anything you need quickly.",target:()=>r.current},{title:"Notifications",description:"Stay updated with your latest notifications here.",target:()=>s.current},{title:"Profile",description:"Access your profile settings and preferences.",target:()=>n.current}];return e.jsxs(e.Fragment,{children:[e.jsxs(h,{style:{marginBottom:16},children:[e.jsx("div",{ref:r,children:e.jsx(he,{prefix:e.jsx(ge,{}),placeholder:"Search...",style:{width:300}})}),e.jsx(l,{ref:s,icon:e.jsx(xe,{}),children:"Notifications"}),e.jsx(l,{ref:n,icon:e.jsx(Te,{}),children:"Profile"})]}),e.jsx(R,{}),e.jsx(l,{type:"primary",onClick:a,children:"Start Tour"}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:c})]})}},S={render:()=>{const{open:i,setOpen:a}=x(),o=t.useRef(null),r=t.useRef(null),s=t.useRef(null),n=[{title:"Feature 1",description:"This is the first feature of our application.",target:()=>o.current},{title:"Feature 2",description:"Here you can find the second amazing feature.",target:()=>r.current},{title:"Feature 3",description:"And this is our third great feature!",target:()=>s.current}];return e.jsxs(e.Fragment,{children:[e.jsxs(h,{direction:"vertical",size:"large",children:[e.jsx(u,{ref:o,title:"Feature 1",children:"This is feature 1 content"}),e.jsx(u,{ref:r,title:"Feature 2",children:"This is feature 2 content"}),e.jsx(u,{ref:s,title:"Feature 3",children:"This is feature 3 content"})]}),e.jsx(d,{open:i,onClose:()=>a(!1),steps:n,autoStart:!0})]})}},P={render:()=>{const{open:i,start:a,setOpen:o}=x(),r=t.useRef(null),s=t.useRef(null),n=t.useRef(null),c=t.useRef(null),p=[{title:"Step 1: Create",description:"Click here to create a new item.",target:()=>r.current},{title:"Step 2: Edit",description:"Use this button to edit existing items.",target:()=>s.current},{title:"Step 3: Delete",description:"Delete items you no longer need.",target:()=>n.current},{title:"Step 4: Settings",description:"Configure your preferences here.",target:()=>c.current}];return e.jsxs(e.Fragment,{children:[e.jsxs(h,{children:[e.jsx(l,{ref:r,type:"primary",children:"Create"}),e.jsx(l,{ref:s,children:"Edit"}),e.jsx(l,{ref:n,danger:!0,children:"Delete"}),e.jsx(l,{ref:c,icon:e.jsx(te,{}),children:"Settings"})]}),e.jsx(R,{}),e.jsx(l,{onClick:a,children:"Start Guided Tour"}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:p,showProgress:!0})]})}},B={render:()=>{const{open:i,start:a,setOpen:o}=x(),r=t.useRef(null),s=t.useRef(null),n=[{title:"Dashboard Overview",description:"This is your main dashboard where you can see all your metrics.",target:()=>r.current},{title:"Quick Actions",description:"Access frequently used actions from this panel.",target:()=>s.current}];return e.jsxs(e.Fragment,{children:[e.jsxs(h,{direction:"vertical",size:"large",style:{width:"100%"},children:[e.jsx(u,{ref:r,title:"Dashboard",children:"Your dashboard content here"}),e.jsx(u,{ref:s,title:"Quick Actions",children:"Quick action buttons here"})]}),e.jsx(R,{}),e.jsx(l,{type:"primary",onClick:a,children:"Begin Tutorial"}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:n,nextText:"Continue",prevText:"Go Back",finishText:"Got it!",showProgress:!0})]})}},b={render:()=>{const{open:i,start:a,setOpen:o,current:r}=x(),s=t.useRef(null),n=t.useRef(null),c=t.useRef(null),p=()=>{console.log("Tour completed!"),alert("Welcome aboard! You're all set to start using the platform.")},g=()=>{console.log("Tour skipped"),alert("Tour skipped. You can restart it anytime from settings.")},f=[{title:"Welcome!",description:e.jsx("div",{children:e.jsx(m,{children:"We're excited to have you here! This quick tour will help you get started."})}),target:()=>s.current},{title:"Complete Your Setup",description:"Fill in your profile details to personalize your experience.",target:()=>n.current},{title:"Explore Features",description:e.jsxs("div",{children:[e.jsx(m,{children:"Discover all the amazing features we have to offer!"}),e.jsx(m,{type:"secondary",children:"You can always revisit this tour from the help menu."})]}),target:()=>c.current}];return e.jsxs(e.Fragment,{children:[e.jsx(j,{level:3,children:"Onboarding Experience"}),e.jsxs(h,{direction:"vertical",size:"large",style:{width:"100%"},children:[e.jsxs(u,{ref:s,children:[e.jsx(j,{level:4,children:"Welcome Section"}),e.jsx(m,{children:"Get started with your journey"})]}),e.jsxs(u,{ref:n,children:[e.jsx(j,{level:4,children:"Profile Setup"}),e.jsx(m,{children:"Complete your profile information"})]}),e.jsxs(u,{ref:c,children:[e.jsx(j,{level:4,children:"Feature Explorer"}),e.jsx(m,{children:"Discover what you can do"})]})]}),e.jsx(R,{}),e.jsxs(h,{children:[e.jsx(l,{type:"primary",size:"large",onClick:a,children:"Start Onboarding"}),e.jsxs(re.Text,{type:"secondary",children:["Current step: ",r+1]})]}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:f,onComplete:p,onSkip:g,showProgress:!0,finishText:"Let's Go!"})]})}},k={render:()=>{const{open:i,start:a,setOpen:o}=x(),r=t.useRef(null),s=t.useRef(null),n=t.useRef(null),c=t.useRef(null),p=t.useRef(null),g=[{title:"Top Placement",description:"This tooltip appears at the top",target:()=>r.current,placement:"top"},{title:"Right Placement",description:"This tooltip appears on the right",target:()=>s.current,placement:"right"},{title:"Bottom Placement",description:"This tooltip appears at the bottom",target:()=>n.current,placement:"bottom"},{title:"Left Placement",description:"This tooltip appears on the left",target:()=>c.current,placement:"left"},{title:"Center Placement",description:"This tooltip appears in the center",target:()=>p.current,placement:"center"}];return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:400,position:"relative"},children:[e.jsx(l,{ref:r,style:{position:"absolute",top:50,left:"50%",transform:"translateX(-50%)"},children:"Top"}),e.jsx(l,{ref:s,style:{position:"absolute",right:50,top:"50%",transform:"translateY(-50%)"},children:"Right"}),e.jsx(l,{ref:n,style:{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)"},children:"Bottom"}),e.jsx(l,{ref:c,style:{position:"absolute",left:50,top:"50%",transform:"translateY(-50%)"},children:"Left"}),e.jsx(l,{ref:p,children:"Center"})]}),e.jsx(R,{}),e.jsx(l,{type:"primary",onClick:a,children:"Show Placement Tour"}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:g})]})}},w={render:()=>{const{open:i,start:a,setOpen:o}=x(),r=t.useRef(null),s=t.useRef(null),n=[{title:e.jsxs(h,{children:[e.jsx(te,{}),e.jsx("span",{children:"Advanced Configuration"})]}),description:e.jsxs("div",{children:[e.jsx(m,{children:"Configure advanced settings for your application:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"API Integration"}),e.jsx("li",{children:"Security Settings"}),e.jsx("li",{children:"Performance Tuning"})]})]}),target:()=>r.current},{title:"Analytics Dashboard",description:e.jsxs(u,{size:"small",children:[e.jsx(m,{strong:!0,children:"Track your metrics:"}),e.jsxs(m,{children:["- User engagement",e.jsx("br",{}),"- Conversion rates",e.jsx("br",{}),"- Performance indicators"]})]}),target:()=>s.current}];return e.jsxs(e.Fragment,{children:[e.jsxs(h,{direction:"vertical",size:"large",style:{width:"100%"},children:[e.jsx(u,{ref:r,title:"Settings",children:"Configuration options"}),e.jsx(u,{ref:s,title:"Analytics",children:"Data and insights"})]}),e.jsx(R,{}),e.jsx(l,{type:"primary",onClick:a,children:"Start Complex Tour"}),e.jsx(d,{open:i,onClose:()=>o(!1),steps:n})]})}};var F,G,H;C.parameters={...C.parameters,docs:{...(F=C.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen
    } = useGuidedTour();
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLButtonElement>(null);
    const profileRef = useRef<HTMLButtonElement>(null);
    const steps = [{
      title: 'Welcome to the Platform',
      description: 'Let\\'s take a quick tour to get you started!'
    }, {
      title: 'Search',
      description: 'Use the search bar to find anything you need quickly.',
      target: () => searchRef.current
    }, {
      title: 'Notifications',
      description: 'Stay updated with your latest notifications here.',
      target: () => notificationRef.current
    }, {
      title: 'Profile',
      description: 'Access your profile settings and preferences.',
      target: () => profileRef.current
    }];
    return <>\r
        <Space style={{
        marginBottom: 16
      }}>\r
          <div ref={searchRef}>\r
            <Input prefix={<SearchOutlined />} placeholder="Search..." style={{
            width: 300
          }} />\r
          </div>\r
          <Button ref={notificationRef} icon={<BellOutlined />}>\r
            Notifications\r
          </Button>\r
          <Button ref={profileRef} icon={<UserOutlined />}>\r
            Profile\r
          </Button>\r
        </Space>\r
        <Divider />\r
        <Button type="primary" onClick={start}>\r
          Start Tour\r
        </Button>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />\r
      </>;
  }
}`,...(H=(G=C.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};var A,M,q;S.parameters={...S.parameters,docs:{...(A=S.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      setOpen
    } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);
    const steps = [{
      title: 'Feature 1',
      description: 'This is the first feature of our application.',
      target: () => ref1.current
    }, {
      title: 'Feature 2',
      description: 'Here you can find the second amazing feature.',
      target: () => ref2.current
    }, {
      title: 'Feature 3',
      description: 'And this is our third great feature!',
      target: () => ref3.current
    }];
    return <>\r
        <Space direction="vertical" size="large">\r
          <Card ref={ref1} title="Feature 1">\r
            This is feature 1 content\r
          </Card>\r
          <Card ref={ref2} title="Feature 2">\r
            This is feature 2 content\r
          </Card>\r
          <Card ref={ref3} title="Feature 3">\r
            This is feature 3 content\r
          </Card>\r
        </Space>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} autoStart={true} />\r
      </>;
  }
}`,...(q=(M=S.parameters)==null?void 0:M.docs)==null?void 0:q.source}}};var z,I,Y;P.parameters={...P.parameters,docs:{...(z=P.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen
    } = useGuidedTour();
    const ref1 = useRef<HTMLButtonElement>(null);
    const ref2 = useRef<HTMLButtonElement>(null);
    const ref3 = useRef<HTMLButtonElement>(null);
    const ref4 = useRef<HTMLButtonElement>(null);
    const steps = [{
      title: 'Step 1: Create',
      description: 'Click here to create a new item.',
      target: () => ref1.current
    }, {
      title: 'Step 2: Edit',
      description: 'Use this button to edit existing items.',
      target: () => ref2.current
    }, {
      title: 'Step 3: Delete',
      description: 'Delete items you no longer need.',
      target: () => ref3.current
    }, {
      title: 'Step 4: Settings',
      description: 'Configure your preferences here.',
      target: () => ref4.current
    }];
    return <>\r
        <Space>\r
          <Button ref={ref1} type="primary">\r
            Create\r
          </Button>\r
          <Button ref={ref2}>Edit</Button>\r
          <Button ref={ref3} danger>\r
            Delete\r
          </Button>\r
          <Button ref={ref4} icon={<SettingOutlined />}>\r
            Settings\r
          </Button>\r
        </Space>\r
        <Divider />\r
        <Button onClick={start}>Start Guided Tour</Button>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} showProgress={true} />\r
      </>;
  }
}`,...(Y=(I=P.parameters)==null?void 0:I.docs)==null?void 0:Y.source}}};var W,V,N;B.parameters={...B.parameters,docs:{...(W=B.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen
    } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const steps = [{
      title: 'Dashboard Overview',
      description: 'This is your main dashboard where you can see all your metrics.',
      target: () => ref1.current
    }, {
      title: 'Quick Actions',
      description: 'Access frequently used actions from this panel.',
      target: () => ref2.current
    }];
    return <>\r
        <Space direction="vertical" size="large" style={{
        width: '100%'
      }}>\r
          <Card ref={ref1} title="Dashboard">\r
            Your dashboard content here\r
          </Card>\r
          <Card ref={ref2} title="Quick Actions">\r
            Quick action buttons here\r
          </Card>\r
        </Space>\r
        <Divider />\r
        <Button type="primary" onClick={start}>\r
          Begin Tutorial\r
        </Button>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} nextText="Continue" prevText="Go Back" finishText="Got it!" showProgress={true} />\r
      </>;
  }
}`,...(N=(V=B.parameters)==null?void 0:V.docs)==null?void 0:N.source}}};var U,Q,_;b.parameters={...b.parameters,docs:{...(U=b.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen,
      current
    } = useGuidedTour();
    const welcomeRef = useRef<HTMLDivElement>(null);
    const setupRef = useRef<HTMLDivElement>(null);
    const exploreRef = useRef<HTMLDivElement>(null);
    const handleComplete = () => {
      console.log('Tour completed!');
      alert('Welcome aboard! You\\'re all set to start using the platform.');
    };
    const handleSkip = () => {
      console.log('Tour skipped');
      alert('Tour skipped. You can restart it anytime from settings.');
    };
    const steps = [{
      title: 'Welcome!',
      description: <div>\r
            <Paragraph>\r
              We're excited to have you here! This quick tour will help you get\r
              started.\r
            </Paragraph>\r
          </div>,
      target: () => welcomeRef.current
    }, {
      title: 'Complete Your Setup',
      description: 'Fill in your profile details to personalize your experience.',
      target: () => setupRef.current
    }, {
      title: 'Explore Features',
      description: <div>\r
            <Paragraph>\r
              Discover all the amazing features we have to offer!\r
            </Paragraph>\r
            <Paragraph type="secondary">\r
              You can always revisit this tour from the help menu.\r
            </Paragraph>\r
          </div>,
      target: () => exploreRef.current
    }];
    return <>\r
        <Title level={3}>Onboarding Experience</Title>\r
        <Space direction="vertical" size="large" style={{
        width: '100%'
      }}>\r
          <Card ref={welcomeRef}>\r
            <Title level={4}>Welcome Section</Title>\r
            <Paragraph>Get started with your journey</Paragraph>\r
          </Card>\r
          <Card ref={setupRef}>\r
            <Title level={4}>Profile Setup</Title>\r
            <Paragraph>Complete your profile information</Paragraph>\r
          </Card>\r
          <Card ref={exploreRef}>\r
            <Title level={4}>Feature Explorer</Title>\r
            <Paragraph>Discover what you can do</Paragraph>\r
          </Card>\r
        </Space>\r
        <Divider />\r
        <Space>\r
          <Button type="primary" size="large" onClick={start}>\r
            Start Onboarding\r
          </Button>\r
          <Typography.Text type="secondary">\r
            Current step: {current + 1}\r
          </Typography.Text>\r
        </Space>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} onComplete={handleComplete} onSkip={handleSkip} showProgress={true} finishText="Let's Go!" />\r
      </>;
  }
}`,...(_=(Q=b.parameters)==null?void 0:Q.docs)==null?void 0:_.source}}};var X,$,J;k.parameters={...k.parameters,docs:{...(X=k.parameters)==null?void 0:X.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen
    } = useGuidedTour();
    const topRef = useRef<HTMLButtonElement>(null);
    const rightRef = useRef<HTMLButtonElement>(null);
    const bottomRef = useRef<HTMLButtonElement>(null);
    const leftRef = useRef<HTMLButtonElement>(null);
    const centerRef = useRef<HTMLButtonElement>(null);
    const steps = [{
      title: 'Top Placement',
      description: 'This tooltip appears at the top',
      target: () => topRef.current,
      placement: 'top' as const
    }, {
      title: 'Right Placement',
      description: 'This tooltip appears on the right',
      target: () => rightRef.current,
      placement: 'right' as const
    }, {
      title: 'Bottom Placement',
      description: 'This tooltip appears at the bottom',
      target: () => bottomRef.current,
      placement: 'bottom' as const
    }, {
      title: 'Left Placement',
      description: 'This tooltip appears on the left',
      target: () => leftRef.current,
      placement: 'left' as const
    }, {
      title: 'Center Placement',
      description: 'This tooltip appears in the center',
      target: () => centerRef.current,
      placement: 'center' as const
    }];
    return <>\r
        <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        position: 'relative'
      }}>\r
          <Button ref={topRef} style={{
          position: 'absolute',
          top: 50,
          left: '50%',
          transform: 'translateX(-50%)'
        }}>\r
            Top\r
          </Button>\r
          <Button ref={rightRef} style={{
          position: 'absolute',
          right: 50,
          top: '50%',
          transform: 'translateY(-50%)'
        }}>\r
            Right\r
          </Button>\r
          <Button ref={bottomRef} style={{
          position: 'absolute',
          bottom: 50,
          left: '50%',
          transform: 'translateX(-50%)'
        }}>\r
            Bottom\r
          </Button>\r
          <Button ref={leftRef} style={{
          position: 'absolute',
          left: 50,
          top: '50%',
          transform: 'translateY(-50%)'
        }}>\r
            Left\r
          </Button>\r
          <Button ref={centerRef}>Center</Button>\r
        </div>\r
        <Divider />\r
        <Button type="primary" onClick={start}>\r
          Show Placement Tour\r
        </Button>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />\r
      </>;
  }
}`,...(J=($=k.parameters)==null?void 0:$.docs)==null?void 0:J.source}}};var K,Z,ee;w.parameters={...w.parameters,docs:{...(K=w.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => {
    const {
      open,
      start,
      setOpen
    } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const steps = [{
      title: <Space>\r
            <SettingOutlined />\r
            <span>Advanced Configuration</span>\r
          </Space>,
      description: <div>\r
            <Paragraph>\r
              Configure advanced settings for your application:\r
            </Paragraph>\r
            <ul>\r
              <li>API Integration</li>\r
              <li>Security Settings</li>\r
              <li>Performance Tuning</li>\r
            </ul>\r
          </div>,
      target: () => ref1.current
    }, {
      title: 'Analytics Dashboard',
      description: <Card size="small">\r
            <Paragraph strong>Track your metrics:</Paragraph>\r
            <Paragraph>\r
              - User engagement\r
              <br />\r
              - Conversion rates\r
              <br />- Performance indicators\r
            </Paragraph>\r
          </Card>,
      target: () => ref2.current
    }];
    return <>\r
        <Space direction="vertical" size="large" style={{
        width: '100%'
      }}>\r
          <Card ref={ref1} title="Settings">\r
            Configuration options\r
          </Card>\r
          <Card ref={ref2} title="Analytics">\r
            Data and insights\r
          </Card>\r
        </Space>\r
        <Divider />\r
        <Button type="primary" onClick={start}>\r
          Start Complex Tour\r
        </Button>\r
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />\r
      </>;
  }
}`,...(ee=(Z=w.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};const Ut=["Basic","AutoStart","WithProgress","CustomTexts","OnboardingFlow","PlacementVariants","ComplexContent"];export{S as AutoStart,C as Basic,w as ComplexContent,B as CustomTexts,b as OnboardingFlow,k as PlacementVariants,P as WithProgress,Ut as __namedExportsOrder,Nt as default};
