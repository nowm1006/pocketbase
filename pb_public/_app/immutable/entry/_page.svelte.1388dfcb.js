import{S as he,i as me,s as ve,k as T,a as O,e as ee,l as w,m as S,h as k,c as j,n as d,b as F,J as B,H as te,p as le,G as m,K as M,L as q,M as J,N as be,O as Q,P as ge,q as W,r as X,u as ce}from"../chunks/index.3b35eacd.js";import{p as ke}from"../chunks/parse.d12b0d5b.js";import{j as A}from"../chunks/singletons.51987667.js";A.disable_scroll_handling;A.goto;A.invalidate;const ye=A.invalidateAll;A.preload_data;A.preload_code;A.before_navigate;A.after_navigate;const Ee=A.apply_action;function Te(_){const e=JSON.parse(_);return e.data&&(e.data=ke(e.data)),e}function we(_,e=()=>{}){const t=async({action:o,result:s,reset:i})=>{s.type==="success"&&(i!==!1&&HTMLFormElement.prototype.reset.call(_),await ye()),(location.origin+location.pathname===o.origin+o.pathname||s.type==="redirect"||s.type==="error")&&Ee(s)};async function l(o){var E,b,H;o.preventDefault();const s=new URL((E=o.submitter)!=null&&E.hasAttribute("formaction")?o.submitter.formAction:HTMLFormElement.prototype.cloneNode.call(_).action),i=new FormData(_),u=(b=o.submitter)==null?void 0:b.getAttribute("name");u&&i.append(u,((H=o.submitter)==null?void 0:H.getAttribute("value"))??"");const f=new AbortController;let h=!1;const c=await e({action:s,cancel:()=>h=!0,controller:f,data:i,form:_,submitter:o.submitter})??t;if(h)return;let p;try{const y=await fetch(s,{method:"POST",headers:{accept:"application/json","x-sveltekit-action":"true"},cache:"no-store",body:i,signal:f.signal});p=Te(await y.text()),p.type==="error"&&(p.status=y.status)}catch(y){if((y==null?void 0:y.name)==="AbortError")return;p={type:"error",error:y}}c({action:s,data:i,form:_,update:y=>t({action:s,result:p,reset:y==null?void 0:y.reset}),result:p})}return HTMLFormElement.prototype.addEventListener.call(_,"submit",l),{destroy(){HTMLFormElement.prototype.removeEventListener.call(_,"submit",l)}}}function ae(_,e,t){const l=_.slice();return l[6]=e[t],l[7]=e,l[8]=t,l}function ne(_,e,t){const l=_.slice();return l[9]=e[t],l}function ie(_,e,t){const l=_.slice();return l[12]=e[t],l}function se(_,e){let t,l=e[12].name+"",o,s;return{key:_,first:null,c(){t=T("option"),o=W(l),this.h()},l(i){t=w(i,"OPTION",{});var u=S(t);o=X(u,l),u.forEach(k),this.h()},h(){t.__value=s=e[12].id,t.value=t.__value,this.first=t},m(i,u){F(i,t,u),m(t,o)},p(i,u){e=i,u&1&&l!==(l=e[12].name+"")&&ce(o,l),u&1&&s!==(s=e[12].id)&&(t.__value=s,t.value=t.__value)},d(i){i&&k(t)}}}function oe(_,e){let t,l=e[9].name+"",o,s;return{key:_,first:null,c(){t=T("option"),o=W(l),this.h()},l(i){t=w(i,"OPTION",{});var u=S(t);o=X(u,l),u.forEach(k),this.h()},h(){t.__value=s=e[9].id,t.value=t.__value,this.first=t},m(i,u){F(i,t,u),m(t,o)},p(i,u){e=i,u&1&&l!==(l=e[9].name+"")&&ce(o,l),u&1&&s!==(s=e[9].id)&&(t.__value=s,t.value=t.__value)},d(i){i&&k(t)}}}function ue(_,e){let t,l,o,s,i,u=[],f=new Map,h,a,c,p,E,b=[],H=new Map,y,R,P,V,N,z,U,G,K,Y;function _e(){e[2].call(l,e[7],e[8])}let C=e[0].projects;const Z=r=>r[12].id;for(let r=0;r<C.length;r+=1){let n=ie(e,C,r),v=Z(n);f.set(v,u[r]=se(v,n))}function pe(){e[3].call(c,e[7],e[8])}let D=e[0].modes;const $=r=>r[9].id;for(let r=0;r<D.length;r+=1){let n=ne(e,D,r),v=$(n);H.set(v,b[r]=oe(v,n))}function fe(){e[4].call(P,e[7],e[8])}function de(){e[5].call(N,e[7],e[8])}return{key:_,first:null,c(){t=T("form"),l=T("input"),o=O(),s=T("div"),i=T("select");for(let r=0;r<u.length;r+=1)u[r].c();a=O(),c=T("input"),p=O(),E=T("select");for(let r=0;r<b.length;r+=1)b[r].c();R=O(),P=T("input"),V=O(),N=T("input"),z=O(),U=T("input"),G=O(),this.h()},l(r){t=w(r,"FORM",{method:!0,class:!0,draggable:!0});var n=S(t);l=w(n,"INPUT",{type:!0,name:!0,class:!0}),o=j(n),s=w(n,"DIV",{class:!0});var v=S(s);i=w(v,"SELECT",{name:!0,onchange:!0});var I=S(i);for(let L=0;L<u.length;L+=1)u[L].l(I);I.forEach(k),a=j(v),c=w(v,"INPUT",{name:!0,class:!0,type:!0}),v.forEach(k),p=j(n),E=w(n,"SELECT",{name:!0,onchange:!0});var g=S(E);for(let L=0;L<b.length;L+=1)b[L].l(g);g.forEach(k),R=j(n),P=w(n,"INPUT",{name:!0,class:!0,type:!0}),V=j(n),N=w(n,"INPUT",{name:!0,class:!0,type:!0}),z=j(n),U=w(n,"INPUT",{type:!0,class:!0}),G=j(n),n.forEach(k),this.h()},h(){var r;d(l,"type","text"),d(l,"name","id"),d(l,"class","hidden"),d(i,"name","project"),d(i,"onchange","submit(this.form)"),d(c,"name","task"),d(c,"class","w-full p-1"),d(c,"type","text"),d(s,"class","flex flex-1 basis-48 flex-col gap-2"),d(E,"name","mode"),d(E,"onchange","submit(this.form)"),d(P,"name","estimate"),d(P,"class","p-1"),d(P,"type","text"),d(N,"name","actual"),d(N,"class","p-1"),d(N,"type","text"),d(U,"type","submit"),U.value="",d(U,"class","hidden"),d(t,"method","POST"),d(t,"class","my-2 flex gap-4 rounded-xl bg-slate-200 p-4"),d(t,"draggable",!0),le(t,"color",(r=e[6].expand)==null?void 0:r.mode.color),this.first=t},m(r,n){var v,I;F(r,t,n),m(t,l),M(l,e[6].id),m(t,o),m(t,s),m(s,i);for(let g=0;g<u.length;g+=1)u[g]&&u[g].m(i,null);q(i,(v=e[6].expand)==null?void 0:v.project.id),m(s,a),m(s,c),M(c,e[6].name),m(t,p),m(t,E);for(let g=0;g<b.length;g+=1)b[g]&&b[g].m(E,null);q(E,(I=e[6].expand)==null?void 0:I.mode.id),m(t,R),m(t,P),M(P,e[6].estimate),m(t,V),m(t,N),M(N,e[6].actual),m(t,z),m(t,U),m(t,G),K||(Y=[J(l,"input",_e),J(c,"input",pe),J(P,"input",fe),J(N,"input",de),be(we.call(null,t))],K=!0)},p(r,n){var v,I,g,L,x;e=r,n&1&&l.value!==e[6].id&&M(l,e[6].id),n&1&&(C=e[0].projects,u=B(u,n,Z,1,e,C,f,i,Q,se,null,ie)),n&1&&h!==(h=(v=e[6].expand)==null?void 0:v.project.id)&&q(i,(I=e[6].expand)==null?void 0:I.project.id),n&1&&c.value!==e[6].name&&M(c,e[6].name),n&1&&(D=e[0].modes,b=B(b,n,$,1,e,D,H,E,Q,oe,null,ne)),n&1&&y!==(y=(g=e[6].expand)==null?void 0:g.mode.id)&&q(E,(L=e[6].expand)==null?void 0:L.mode.id),n&1&&P.value!==e[6].estimate&&M(P,e[6].estimate),n&1&&N.value!==e[6].actual&&M(N,e[6].actual),n&1&&le(t,"color",(x=e[6].expand)==null?void 0:x.mode.color)},d(r){r&&k(t);for(let n=0;n<u.length;n+=1)u[n].d();for(let n=0;n<b.length;n+=1)b[n].d();K=!1,ge(Y)}}}function re(_){let e,t;return{c(){e=T("p"),t=W("success")},l(l){e=w(l,"P",{});var o=S(e);t=X(o,"success"),o.forEach(k)},m(l,o){F(l,e,o),m(e,t)},d(l){l&&k(e)}}}function Pe(_){var h;let e,t=[],l=new Map,o,s,i=_[0].tasks;const u=a=>a[6].id;for(let a=0;a<i.length;a+=1){let c=ae(_,i,a),p=u(c);l.set(p,t[a]=ue(p,c))}let f=((h=_[1])==null?void 0:h.success)&&re();return{c(){e=T("div");for(let a=0;a<t.length;a+=1)t[a].c();o=O(),f&&f.c(),s=ee(),this.h()},l(a){e=w(a,"DIV",{class:!0});var c=S(e);for(let p=0;p<t.length;p+=1)t[p].l(c);c.forEach(k),o=j(a),f&&f.l(a),s=ee(),this.h()},h(){d(e,"class","container m-auto max-w-5xl")},m(a,c){F(a,e,c);for(let p=0;p<t.length;p+=1)t[p]&&t[p].m(e,null);F(a,o,c),f&&f.m(a,c),F(a,s,c)},p(a,[c]){var p;c&1&&(i=a[0].tasks,t=B(t,c,u,1,a,i,l,e,Q,ue,null,ae)),(p=a[1])!=null&&p.success?f||(f=re(),f.c(),f.m(s.parentNode,s)):f&&(f.d(1),f=null)},i:te,o:te,d(a){a&&k(e);for(let c=0;c<t.length;c+=1)t[c].d();a&&k(o),f&&f.d(a),a&&k(s)}}}function Ne(_,e,t){let{data:l}=e,{form:o}=e;function s(h,a){h[a].id=this.value,t(0,l)}function i(h,a){h[a].name=this.value,t(0,l)}function u(h,a){h[a].estimate=this.value,t(0,l)}function f(h,a){h[a].actual=this.value,t(0,l)}return _.$$set=h=>{"data"in h&&t(0,l=h.data),"form"in h&&t(1,o=h.form)},[l,o,s,i,u,f]}class Me extends he{constructor(e){super(),me(this,e,Ne,Pe,ve,{data:0,form:1})}}export{Me as default};