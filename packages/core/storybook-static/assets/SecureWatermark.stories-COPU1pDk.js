import{r as ze,j as e}from"./iframe-Dz2LC5nm.js";import{W as Fe}from"./index-B5PYPtgH.js";import{I as Re}from"./index-DNOIhlR_.js";import{S as we}from"./index-_UlGzK8j.js";import{C as x}from"./index-z5wVk1x2.js";import{T as Le}from"./index-CWlopGM_.js";import"./preload-helper-C1FmrZbK.js";import"./toList-CER2sblB.js";import"./context-BodU5NN8.js";import"./EyeOutlined-DTzsB5jg.js";import"./AntdIcon-Bjoc2A0G.js";import"./shadow-smhd3i8u.js";import"./useMergedState-DIkF75NH.js";import"./index-NqV6zHZq.js";import"./Portal-DKHmL-os.js";import"./useId-Cbrt0Rk4.js";import"./KeyCode-HJ8jGXz0.js";import"./pickAttrs-C7BJ3CXo.js";import"./index-BPutIMu_.js";import"./genStyleUtils-BYYxHtb1.js";import"./fade-QfD4GzOS.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./zoom-CWPxwh-U.js";import"./addEventListener-DuM3salT.js";import"./useZIndex-Dv1QJmGl.js";import"./motion-Ct_bxEw8.js";import"./useCSSVarCls-BbjthPCx.js";import"./CloseOutlined-Uef9iQNA.js";import"./LeftOutlined-B29Bdkke.js";import"./RightOutlined-BDL0sfNG.js";import"./useLocale-i3AsUBCw.js";import"./toArray-CcRQ9JCW.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./omit-DXgDXInf.js";import"./Skeleton-_C6qiOOr.js";import"./index-BfB3k0in.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./PlusOutlined-ChoHNIra.js";import"./isMobile-DjGTsQxe.js";import"./index-D7AkFHe9.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./Dropdown-ncGrBRcY.js";import"./index-Be-dJp65.js";import"./isVisible-DhUEo0yb.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./slide-ewzjqjuQ.js";import"./useVariants-CQySXX5A.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./styleChecker-LD4ekl8e.js";import"./index-DiRJBLqM.js";import"./ContextIsolator-MQGvi7R6.js";import"./roundedArrow-Dc2oY277.js";import"./reactNode-B7JGm4rf.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./TextArea-CVoWWtfb.js";import"./TextArea-5PpxZjCW.js";import"./BaseInput-j0EJArUA.js";import"./getAllowClear-BU496aLv.js";import"./CloseCircleFilled-DLhYMZD0.js";import"./index-CJ7UoYAk.js";import"./compact-item-BQH2bmb8.js";import"./CheckOutlined-BbyNuZCI.js";import"./LoadingOutlined-BrYRsAZK.js";const r=({username:k,userId:P,timestamp:v=!0,ipAddress:C,sessionId:b,customFields:T,multiLine:z=!0,showMetadata:F=!0,content:D,...De})=>{const Ae=ze.useMemo(()=>{if(D)return D;const s=[];if(k&&s.push(`User: ${k}`),P&&s.push(`ID: ${P}`),v){const i=new Date,A=i.toLocaleDateString(),ve=i.toLocaleTimeString();s.push(`${A} ${ve}`)}return C&&s.push(`IP: ${C}`),b&&s.push(`Session: ${b.substring(0,8)}...`),T&&Object.entries(T).forEach(([i,A])=>{s.push(`${i}: ${A}`)}),z&&F?s:s.join(" | ")},[k,P,v,C,b,T,z,F,D]);return e.jsx(Fe,{content:Ae,gap:[100,100],font:{color:"rgba(0, 0, 0, 0.15)",fontSize:14},...De})};r.displayName="SecureWatermark";r.__docgenInfo={description:"",methods:[],displayName:"SecureWatermark",props:{username:{required:!1,tsType:{name:"string"},description:""},userId:{required:!1,tsType:{name:"string"},description:""},timestamp:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},ipAddress:{required:!1,tsType:{name:"string"},description:""},sessionId:{required:!1,tsType:{name:"string"},description:""},customFields:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>"},description:""},multiLine:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},showMetadata:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}}},composes:["WatermarkProps"]};const{Title:Te,Paragraph:a}=Le,Yr={title:"Overlay/Watermark/SecureWatermark",component:r,tags:["autodocs"],parameters:{docs:{description:{component:`
Marca de agua segura con información de usuario y sesión para rastreo de contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/watermark)
- [🎨 API de Props](https://ant.design/components/watermark#api)
- [💡 Ejemplos](https://ant.design/components/watermark#examples)

## Cuándo usar

- Para proteger documentos confidenciales con trazabilidad
- Cuando necesitas identificar quién accedió al contenido
- Para prevenir distribución no autorizada de información sensible
        `}}},argTypes:{timestamp:{control:"boolean"},multiLine:{control:"boolean"},showMetadata:{control:"boolean"}}},t=()=>e.jsxs(x,{children:[e.jsx(Te,{level:3,children:"Confidential Document"}),e.jsx(a,{children:"This is a confidential document that contains sensitive information. The watermark helps track and identify unauthorized distribution."}),e.jsx(a,{children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}),e.jsx(a,{children:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."})]}),n={render:()=>e.jsx(r,{username:"john.doe",userId:"12345",children:e.jsx(t,{})})},o={render:()=>e.jsx(r,{username:"jane.smith",userId:"67890",timestamp:!0,children:e.jsx(t,{})})},m={render:()=>e.jsx(r,{username:"admin",userId:"admin001",ipAddress:"192.168.1.100",timestamp:!0,children:e.jsx(t,{})})},c={render:()=>e.jsx(r,{username:"developer",userId:"dev123",sessionId:"sess-abc123def456ghi789",timestamp:!0,children:e.jsx(t,{})})},d={render:()=>e.jsx(r,{username:"john.doe",userId:"emp-12345",ipAddress:"192.168.1.100",sessionId:"sess-xyz789abc123",timestamp:!0,multiLine:!0,children:e.jsx(t,{})})},u={render:()=>e.jsx(r,{username:"manager",userId:"mgr-001",customFields:{Department:"Finance",Classification:"Confidential",Document:"FIN-2024-001"},timestamp:!0,children:e.jsx(t,{})})},p={render:()=>e.jsx(r,{username:"john.doe",userId:"12345",ipAddress:"192.168.1.100",timestamp:!0,multiLine:!1,children:e.jsx(t,{})})},l={render:()=>e.jsx(r,{username:"secure.user",userId:"SEC-999",timestamp:!0,font:{color:"rgba(255, 0, 0, 0.15)",fontSize:16,fontWeight:700},gap:[150,150],children:e.jsx(t,{})})},h={render:()=>e.jsx(r,{username:"protected.user",userId:"PROT-456",timestamp:!0,gap:[50,50],font:{color:"rgba(0, 0, 0, 0.1)",fontSize:12},children:e.jsx(t,{})})},g={render:()=>e.jsx(r,{username:"audit.user",userId:"AUD-789",timestamp:!0,rotate:-22,children:e.jsx(t,{})})},f={render:()=>e.jsx(r,{username:"viewer",userId:"VW-001",timestamp:!0,font:{color:"rgba(255, 255, 255, 0.5)",fontSize:14},children:e.jsx("div",{style:{padding:20},children:e.jsx(Re,{width:600,src:"https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",alt:"Sample"})})})},S={render:()=>e.jsx(we,{direction:"vertical",size:"large",style:{width:"100%"},children:e.jsx(r,{username:"legal.team",userId:"LEG-001",customFields:{"Doc Type":"Legal Contract",Confidentiality:"High"},timestamp:!0,font:{color:"rgba(139, 0, 0, 0.12)",fontSize:15},children:e.jsxs(x,{title:"Legal Document - Confidential",children:[e.jsx(a,{strong:!0,children:"Contract Agreement"}),e.jsx(a,{children:"This agreement is entered into on this day between Party A and Party B for the purpose of establishing terms and conditions..."}),e.jsx(a,{children:"All information contained in this document is confidential and proprietary. Any unauthorized use or distribution is strictly prohibited."})]})})})},j={render:()=>e.jsx(r,{username:"dr.smith",userId:"DOC-456",customFields:{"Patient ID":"PAT-789","Record Type":"Medical History","HIPAA Protected":"Yes"},timestamp:!0,multiLine:!0,font:{color:"rgba(0, 0, 139, 0.1)",fontSize:13},children:e.jsxs(x,{title:"Patient Medical Record",children:[e.jsx(a,{strong:!0,children:"Patient Information"}),e.jsx(a,{children:"This medical record contains protected health information (PHI) and is subject to HIPAA regulations."}),e.jsx(a,{children:"Unauthorized access or disclosure of this information may result in civil and criminal penalties."})]})})},I={render:()=>e.jsx(r,{username:"finance.analyst",userId:"FIN-123",customFields:{Report:"Q4-2024",Classification:"Internal Use Only",Department:"Finance"},timestamp:!0,font:{color:"rgba(0, 100, 0, 0.12)",fontSize:14},children:e.jsxs(x,{title:"Financial Report - Q4 2024",children:[e.jsx(Te,{level:4,children:"Revenue Summary"}),e.jsx(a,{children:"This report contains confidential financial information including revenue projections, cost analysis, and strategic planning data."}),e.jsx(a,{children:"Distribution of this report is restricted to authorized personnel only. Please handle with appropriate care and security measures."})]})})},y={render:()=>e.jsx(r,{username:"user",showMetadata:!1,children:e.jsx(t,{})})},W={render:()=>e.jsx(r,{content:"CONFIDENTIAL - DO NOT DISTRIBUTE",font:{color:"rgba(255, 0, 0, 0.2)",fontSize:18,fontWeight:700},rotate:-15,children:e.jsx(t,{})})};var R,w,L;n.parameters={...n.parameters,docs:{...(R=n.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="john.doe" userId="12345">\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(L=(w=n.parameters)==null?void 0:w.docs)==null?void 0:L.source}}};var E,O,q;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="jane.smith" userId="67890" timestamp={true}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(q=(O=o.parameters)==null?void 0:O.docs)==null?void 0:q.source}}};var U,M,N;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="admin" userId="admin001" ipAddress="192.168.1.100" timestamp={true}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(N=(M=m.parameters)==null?void 0:M.docs)==null?void 0:N.source}}};var H,V,$;c.parameters={...c.parameters,docs:{...(H=c.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="developer" userId="dev123" sessionId="sess-abc123def456ghi789" timestamp={true}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...($=(V=c.parameters)==null?void 0:V.docs)==null?void 0:$.source}}};var B,Q,Z;d.parameters={...d.parameters,docs:{...(B=d.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="john.doe" userId="emp-12345" ipAddress="192.168.1.100" sessionId="sess-xyz789abc123" timestamp={true} multiLine={true}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(Z=(Q=d.parameters)==null?void 0:Q.docs)==null?void 0:Z.source}}};var _,G,J;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="manager" userId="mgr-001" customFields={{
    Department: 'Finance',
    Classification: 'Confidential',
    Document: 'FIN-2024-001'
  }} timestamp={true}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(J=(G=u.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var Y,K,X;p.parameters={...p.parameters,docs:{...(Y=p.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="john.doe" userId="12345" ipAddress="192.168.1.100" timestamp={true} multiLine={false}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(X=(K=p.parameters)==null?void 0:K.docs)==null?void 0:X.source}}};var ee,re,te;l.parameters={...l.parameters,docs:{...(ee=l.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="secure.user" userId="SEC-999" timestamp={true} font={{
    color: 'rgba(255, 0, 0, 0.15)',
    fontSize: 16,
    fontWeight: 700
  }} gap={[150, 150]}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(te=(re=l.parameters)==null?void 0:re.docs)==null?void 0:te.source}}};var ae,se,ie;h.parameters={...h.parameters,docs:{...(ae=h.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="protected.user" userId="PROT-456" timestamp={true} gap={[50, 50]} font={{
    color: 'rgba(0, 0, 0, 0.1)',
    fontSize: 12
  }}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(ie=(se=h.parameters)==null?void 0:se.docs)==null?void 0:ie.source}}};var ne,oe,me;g.parameters={...g.parameters,docs:{...(ne=g.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="audit.user" userId="AUD-789" timestamp={true} rotate={-22}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(me=(oe=g.parameters)==null?void 0:oe.docs)==null?void 0:me.source}}};var ce,de,ue;f.parameters={...f.parameters,docs:{...(ce=f.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="viewer" userId="VW-001" timestamp={true} font={{
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14
  }}>\r
      <div style={{
      padding: 20
    }}>\r
        <Image width={600} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="Sample" />\r
      </div>\r
    </SecureWatermark>
}`,...(ue=(de=f.parameters)==null?void 0:de.docs)==null?void 0:ue.source}}};var pe,le,he;S.parameters={...S.parameters,docs:{...(pe=S.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: () => <Space direction="vertical" size="large" style={{
    width: '100%'
  }}>\r
      <SecureWatermark username="legal.team" userId="LEG-001" customFields={{
      'Doc Type': 'Legal Contract',
      'Confidentiality': 'High'
    }} timestamp={true} font={{
      color: 'rgba(139, 0, 0, 0.12)',
      fontSize: 15
    }}>\r
        <Card title="Legal Document - Confidential">\r
          <Paragraph strong>Contract Agreement</Paragraph>\r
          <Paragraph>\r
            This agreement is entered into on this day between Party A and Party B\r
            for the purpose of establishing terms and conditions...\r
          </Paragraph>\r
          <Paragraph>\r
            All information contained in this document is confidential and\r
            proprietary. Any unauthorized use or distribution is strictly\r
            prohibited.\r
          </Paragraph>\r
        </Card>\r
      </SecureWatermark>\r
    </Space>
}`,...(he=(le=S.parameters)==null?void 0:le.docs)==null?void 0:he.source}}};var ge,fe,Se;j.parameters={...j.parameters,docs:{...(ge=j.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="dr.smith" userId="DOC-456" customFields={{
    'Patient ID': 'PAT-789',
    'Record Type': 'Medical History',
    'HIPAA Protected': 'Yes'
  }} timestamp={true} multiLine={true} font={{
    color: 'rgba(0, 0, 139, 0.1)',
    fontSize: 13
  }}>\r
      <Card title="Patient Medical Record">\r
        <Paragraph strong>Patient Information</Paragraph>\r
        <Paragraph>\r
          This medical record contains protected health information (PHI) and is\r
          subject to HIPAA regulations.\r
        </Paragraph>\r
        <Paragraph>\r
          Unauthorized access or disclosure of this information may result in\r
          civil and criminal penalties.\r
        </Paragraph>\r
      </Card>\r
    </SecureWatermark>
}`,...(Se=(fe=j.parameters)==null?void 0:fe.docs)==null?void 0:Se.source}}};var je,Ie,ye;I.parameters={...I.parameters,docs:{...(je=I.parameters)==null?void 0:je.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="finance.analyst" userId="FIN-123" customFields={{
    'Report': 'Q4-2024',
    'Classification': 'Internal Use Only',
    'Department': 'Finance'
  }} timestamp={true} font={{
    color: 'rgba(0, 100, 0, 0.12)',
    fontSize: 14
  }}>\r
      <Card title="Financial Report - Q4 2024">\r
        <Title level={4}>Revenue Summary</Title>\r
        <Paragraph>\r
          This report contains confidential financial information including\r
          revenue projections, cost analysis, and strategic planning data.\r
        </Paragraph>\r
        <Paragraph>\r
          Distribution of this report is restricted to authorized personnel only.\r
          Please handle with appropriate care and security measures.\r
        </Paragraph>\r
      </Card>\r
    </SecureWatermark>
}`,...(ye=(Ie=I.parameters)==null?void 0:Ie.docs)==null?void 0:ye.source}}};var We,xe,ke;y.parameters={...y.parameters,docs:{...(We=y.parameters)==null?void 0:We.docs,source:{originalSource:`{
  render: () => <SecureWatermark username="user" showMetadata={false}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(ke=(xe=y.parameters)==null?void 0:xe.docs)==null?void 0:ke.source}}};var Pe,Ce,be;W.parameters={...W.parameters,docs:{...(Pe=W.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  render: () => <SecureWatermark content="CONFIDENTIAL - DO NOT DISTRIBUTE" font={{
    color: 'rgba(255, 0, 0, 0.2)',
    fontSize: 18,
    fontWeight: 700
  }} rotate={-15}>\r
      <SampleContent />\r
    </SecureWatermark>
}`,...(be=(Ce=W.parameters)==null?void 0:Ce.docs)==null?void 0:be.source}}};const Kr=["Basic","WithTimestamp","WithIPAddress","WithSessionTracking","FullSecurityInfo","CustomFields","SingleLineFormat","CustomStyling","DenseWatermark","RotatedWatermark","WithImage","DocumentProtection","MedicalRecords","FinancialData","MinimalWatermark","CustomContent"];export{n as Basic,W as CustomContent,u as CustomFields,l as CustomStyling,h as DenseWatermark,S as DocumentProtection,I as FinancialData,d as FullSecurityInfo,j as MedicalRecords,y as MinimalWatermark,g as RotatedWatermark,p as SingleLineFormat,m as WithIPAddress,f as WithImage,c as WithSessionTracking,o as WithTimestamp,Kr as __namedExportsOrder,Yr as default};
