'use strict';
function splitArms(sel){const out=[];let d=0,c='';for(const ch of sel){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){out.push(c.trim());c='';}else c+=ch;}if(c.trim())out.push(c.trim());return out;}
function armThemeCondition(arm){const nots=[];const stripped=arm.replace(/:not\(([^()]*)\)/g,(m,i)=>{nots.push(i);return '';});const nb=nots.join(' ');
 return {requiresDark:/\[data-theme\s*=\s*['"]?dark['"]?\]/.test(stripped)||/\.dark\b/.test(stripped),
  requiresLight:/\[data-theme\s*=\s*['"]?light['"]?\]/.test(stripped)||/\.light\b/.test(stripped),
  excludesDark:/\[data-theme\s*=\s*['"]?dark['"]?\]/.test(nb)||/\.dark\b/.test(nb),
  excludesLight:/\[data-theme\s*=\s*['"]?light['"]?\]/.test(nb)||/\.light\b/.test(nb)};}
function armMatchesState(arm,state){const c=armThemeCondition(arm);
 if(c.requiresDark&&state!=='dark')return false;if(c.requiresLight&&state!=='light')return false;
 if(c.excludesDark&&state==='dark')return false;if(c.excludesLight&&state==='light')return false;return true;}
function armIsDescendant(arm){let d=0;for(let i=0;i<arm.length;i++){const ch=arm[i];if(ch==='(')d++;else if(ch===')')d--;else if(d===0&&/[\s>+~]/.test(ch)){if(arm.slice(i).trim().length)return true;}}return false;}
function cmpSpec(x,y){for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]-y[i];}return 0;}
function armSpecificity(arm){let a=0,b=0,c=0;let s=arm;
 s=s.replace(/:where\(([^()]*(\([^()]*\))?[^()]*)\)/g,' ');
 const nested=[];s=s.replace(/:(?:is|not)\(([^()]*)\)/g,(m,i)=>{nested.push(i);return ' ';});
 for(const n of nested){let bi=[0,0,0];for(const a2 of splitArms(n)){const sp=armSpecificity(a2);if(cmpSpec(sp,bi)>0)bi=sp;}a+=bi[0];b+=bi[1];c+=bi[2];}
 a+=(s.match(/#[\w-]+/g)||[]).length;b+=(s.match(/\[[^\]]+\]/g)||[]).length;b+=(s.match(/\.[\w-]+/g)||[]).length;b+=(s.match(/:(?!:)[\w-]+/g)||[]).length;
 c+=(s.match(/(^|[\s>+~,])([a-zA-Z][\w-]*)/g)||[]).length;c+=(s.match(/::[\w-]+/g)||[]).length;return [a,b,c];}
function specificity(sel){let best=[0,0,0];for(const arm of splitArms(sel)){const s=armSpecificity(arm);if(cmpSpec(s,best)>0)best=s;}return best;}
module.exports={splitArms,armMatchesState,armIsDescendant,specificity,cmpSpec,armThemeCondition};
