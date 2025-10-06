import{j as v}from"./iframe-Dz2LC5nm.js";import{M as C}from"./index-pLRMjw40.js";import"./preload-helper-C1FmrZbK.js";import"./index-D0CjhTQq.js";import"./Overflow-DfKHW_HQ.js";import"./index-D7AkFHe9.js";import"./toArray-CcRQ9JCW.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./useMergedState-DIkF75NH.js";import"./isVisible-DhUEo0yb.js";import"./KeyCode-HJ8jGXz0.js";import"./omit-DXgDXInf.js";import"./index-Be-dJp65.js";import"./Portal-DKHmL-os.js";import"./shadow-smhd3i8u.js";import"./useId-Cbrt0Rk4.js";import"./isMobile-DjGTsQxe.js";import"./EllipsisOutlined-Dyh-g_i4.js";import"./AntdIcon-Bjoc2A0G.js";import"./motion-Ct_bxEw8.js";import"./reactNode-B7JGm4rf.js";import"./useCSSVarCls-BbjthPCx.js";import"./index-DiRJBLqM.js";import"./ContextIsolator-MQGvi7R6.js";import"./context-DwFXXsmv.js";import"./asyncToGenerator-BNpDlXbe.js";import"./Compact-ObzKHgFl.js";import"./useSize-oyF83k_j.js";import"./genStyleUtils-BYYxHtb1.js";import"./useZIndex-Dv1QJmGl.js";import"./roundedArrow-Dc2oY277.js";import"./zoom-CWPxwh-U.js";import"./Keyframes-DYCYu-A0.js";import"./motion-DteYqKxb.js";import"./colors-rnPH_CWp.js";import"./presetColors-DLnX3ho6.js";import"./util-DIS73dAr.js";import"./collapse-BbEVqHco.js";import"./slide-ewzjqjuQ.js";const a=K=>v.jsx(C,{...K});a.displayName="Menu";a.__docgenInfo={description:"",methods:[],displayName:"Menu",composes:["AntMenuProps"]};const pe={title:"Navigation/Menu",component:a,tags:["autodocs"],parameters:{docs:{description:{component:`
Menú de navegación versátil con soporte para jerarquías y diferentes modos de visualización.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/menu)
- [🎨 API de Props](https://ant.design/components/menu#api)
- [💡 Ejemplos](https://ant.design/components/menu#examples)

## Cuándo usar

- Para navegación principal de aplicaciones o sitios web
- Cuando necesitas menús jerárquicos con submenús
- Para barras laterales de navegación o menús desplegables
        `}}},argTypes:{mode:{control:{type:"select"},options:["horizontal","vertical","inline"],description:"Type of menu",defaultValue:"vertical"},theme:{control:{type:"select"},options:["light","dark"],description:"Color theme of menu",defaultValue:"light"},items:{control:{type:"object"},description:"Menu item content"},inlineCollapsed:{control:{type:"boolean"},description:"Specifies the collapsed status when menu is inline mode"},inlineIndent:{control:{type:"number"},description:"Indent of inline menu item on each level",defaultValue:24},selectable:{control:{type:"boolean"},description:"Allows selecting menu items",defaultValue:!0},multiple:{control:{type:"boolean"},description:"Allows selection of multiple items"},defaultOpenKeys:{control:{type:"object"},description:"Array with the keys of default opened sub menus"},defaultSelectedKeys:{control:{type:"object"},description:"Array with the keys of default selected menu items"},onClick:{action:"clicked",description:"Callback when menu item is clicked"},onSelect:{action:"selected",description:"Callback when menu item is selected"}}},e=[{key:"mail",label:"Navigation One"},{key:"app",label:"Navigation Two"},{key:"submenu",label:"Navigation Three - Submenu",children:[{key:"setting:1",label:"Option 1"},{key:"setting:2",label:"Option 2"},{key:"setting:3",label:"Option 3"}]},{key:"alipay",label:"Navigation Four"}],t={args:{mode:"horizontal",items:e,defaultSelectedKeys:["mail"]}},n={args:{mode:"vertical",items:e,defaultSelectedKeys:["mail"],style:{width:256}}},o={args:{mode:"inline",items:e,defaultSelectedKeys:["mail"],defaultOpenKeys:["submenu"],style:{width:256}}},i={args:{mode:"inline",items:e,defaultSelectedKeys:["mail"],inlineCollapsed:!0,style:{width:80}}},s={args:{mode:"inline",theme:"dark",items:e,defaultSelectedKeys:["mail"],defaultOpenKeys:["submenu"],style:{width:256}}};var r,l,m;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    mode: 'horizontal',
    items: items,
    defaultSelectedKeys: ['mail']
  }
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var p,c,d;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    mode: 'vertical',
    items: items,
    defaultSelectedKeys: ['mail'],
    style: {
      width: 256
    }
  }
}`,...(d=(c=n.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var u,y,g;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    mode: 'inline',
    items: items,
    defaultSelectedKeys: ['mail'],
    defaultOpenKeys: ['submenu'],
    style: {
      width: 256
    }
  }
}`,...(g=(y=o.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var f,h,b;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    mode: 'inline',
    items: items,
    defaultSelectedKeys: ['mail'],
    inlineCollapsed: true,
    style: {
      width: 80
    }
  }
}`,...(b=(h=i.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var k,S,w;s.parameters={...s.parameters,docs:{...(k=s.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    mode: 'inline',
    theme: 'dark',
    items: items,
    defaultSelectedKeys: ['mail'],
    defaultOpenKeys: ['submenu'],
    style: {
      width: 256
    }
  }
}`,...(w=(S=s.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};const ce=["Horizontal","Vertical","Inline","Collapsed","Dark"];export{i as Collapsed,s as Dark,t as Horizontal,o as Inline,n as Vertical,ce as __namedExportsOrder,pe as default};
