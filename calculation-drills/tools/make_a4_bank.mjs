import {writeFileSync} from "node:fs";
function makeBank(){
 const P2=["11","22","12","21"],P3=["111","112","121","122","211","212","221","222"];
 const A={L22:[43,67,89,57,74],L32:[437,683,791,863,947],L33:[437,683,791,863,947],L43:[4387,5729,6841,7391,8263],L44:[4387,5729,6841,7391,8263],L52:[43871,57239,68147]};
 const B={2:{R0:[[27,46],[33,58],[38,47]],R1:[[27,43],[34,56]],R2:[[27,73],[38,62]]},3:{R0:[[286,317],[431,276],[253,419]],R1:[[286,324],[137,493]],R2:[[286,714],[431,569]]},4:{R0:[[2764,3129],[1847,3621],[2396,4187]],R1:[[2764,3236],[1847,3153]],R2:[[2764,7236],[1847,8153]]}};
 const TR={3:{R0:[[286,317,243],[431,276,158]],R1:[[286,317,227]],R2:[[286,317,397]]},4:{R0:[[2764,3129,1863],[1847,3621,2198]],R2:[[2764,3129,4107]]}};
 const D={L33:[[523,641],[758,862],[914,376],[593,647]],L44:[[5937,6412],[7183,5269],[8641,4527],[5713,6299]]};
 const out=[],uniq=new Set(),eid=new Set(),serial=new Map();
 const dg=x=>String(x).length,Rtype=sum=>sum>=10&&Number.isInteger(Math.log10(sum))?"R2":sum%10===0?"R1":"R0";
 function add(N,T,P,L,R,K,a,terms,phase){
  const pre=`A4-N${N}T${T}-P${P}-${L}-${R}${K}-H0S0`,seq=(serial.get(pre)||0)+1,id=pre+"-"+String(seq).padStart(2,"0"),expr=terms.map(t=>t.join("×")).join("+");
  if(seq>99||eid.has(id)||uniq.has(expr))throw Error("duplicate "+id+" "+expr);
  const ix=T.split("").map(x=>+x-1);
  const residual=ix.map((pos,i)=>{if(terms[pos][+P[i]-1]!==a)throw Error("P "+id);return terms[pos][2-(+P[i])];});
  if(dg(a)!==+L[1]||residual.some(b=>dg(b)!==+L[2]))throw Error("L "+id);
  const sum=residual.reduce((x,y)=>x+y,0);
  if(Rtype(sum)!==R)throw Error("R "+id+" "+sum);
  if(K==="K1"&&![[20,50],[25,40],[125,80]].some(([c,r])=>c===a&&r===sum))throw Error("K "+id);
  const other=terms.map((t,i)=>ix.includes(i)?0:t[0]*t[1]).reduce((x,y)=>x+y,0);
  if(terms.some((t,i)=>!ix.includes(i)&&t.includes(a)))throw Error("distractor "+id);
  const answer=terms.reduce((v,t)=>v+t[0]*t[1],0);
  if(answer!==a*sum+other||!Number.isSafeInteger(answer))throw Error("answer "+id);
  out.push({id,terms,answer,common_factor:a,common_terms:ix.map(i=>i+1),shared_positions:P.split("").map(Number),term_count:N,shared_count:ix.length,L,R,K,H:"H0",S:"S0",remainder_sum:sum,naive_multiplications:N,grouped_multiplications:1+N-ix.length,phase,discovery_difficulty:"unmeasured",solution:{grouped_terms:residual,other_products:terms.filter((_,i)=>!ix.includes(i)).map(t=>t[0]*t[1]),grouped_product:a*sum},status:"draft"});
  serial.set(pre,seq);eid.add(id);uniq.add(expr);
 }
 for(const L of Object.keys(A))for(const R of (L==="L52"?["R0"]:["L32","L43"].includes(L)?["R0","R1"]:["R0","R1","R2"]))for(const P of P2)for(let v=0;v<(["L33","L44"].includes(L)?2:1);v++){
  const a=A[L][(v+P2.indexOf(P))%A[L].length],b=B[+L[2]][R][v%B[+L[2]][R].length];
  add(2,"12",P,L,R,"K0",a,P.split("").map((p,i)=>p==="1"?[a,b[i]]:[b[i],a]),R==="R0"?"recognition":"reward");
 }
 for(const [a,forms] of [[20,[[17,33],[21,29],[13,37]]],[25,[[17,23],[14,26],[11,29]]],[125,[[31,49],[37,43],[26,54]]]])for(const P of P2)for(let v=0;v<2;v++){
  const b=forms[(v+P2.indexOf(P))%forms.length];add(2,"12",P,"L"+dg(a)+"2","R1","K1",a,P.split("").map((p,i)=>p==="1"?[a,b[i]]:[b[i],a]),"bonus");
 }
 for(const T of ["12","13","23"])for(const P of P2)for(const L of ["L33","L44"])for(const R of (L==="L33"?["R0","R1"]:["R0"]))for(let v=0;v<(R==="R0"?2:1);v++){
  const z=v+(+T[0])+P2.indexOf(P),a=A[L][z%A[L].length],b=B[+L[2]][R][(v+P2.indexOf(P))%B[+L[2]][R].length],t=new Array(3);
  for(let i=0;i<2;i++)t[+T[i]-1]=P[i]==="1"?[a,b[i]]:[b[i],a];
  for(let i=0;i<3;i++)if(!t[i])t[i]=D[L][z%D[L].length];
  add(3,T,P,L,R,"K0",a,t,"partial3");
 }
 for(const P of P3)for(const L of ["L33","L44"])for(const R of (L==="L33"?["R0","R1","R2"]:["R0","R2"]))for(let v=0;v<(R==="R0"?2:1);v++){
  const a=A[L][(v+P3.indexOf(P))%A[L].length],b=TR[+L[2]][R][(v+P3.indexOf(P))%TR[+L[2]][R].length];
  add(3,"123",P,L,R,"K0",a,P.split("").map((p,i)=>p==="1"?[a,b[i]]:[b[i],a]),"all3");
 }
 return {schema_version:"a4-bank-0.1",updated:"2026-11-22",status:"draft",description:"A4初期問題バンク。整数・加算・H0、R0中心、L33/L44と3項の2項共通→3項全部を優先。",problems:out,validation:{count:out.length,unique_ids:eid.size,unique_expressions:uniq.size}};
}
function diversifyA4(bank){
 let seed=0x4A422611;
 function rand(){seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;}
 const num=(lo,hi)=>lo+Math.floor(rand()*(hi-lo+1)),digits=n=>String(Math.abs(n)).length;
 const rc=s=>s>=10&&Number.isInteger(Math.log10(s))?"R2":s%10===0?"R1":"R0";
 const canon=(terms,signs)=>terms.map((t,i)=>signs[i]+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
 const usedA=new Set(),combos=new Set(),exprs=new Set(),ids=new Set();
 function aNew(d){
  for(let n=0;n<15000;n++){const a=num(10**(d-1),10**d-1);if(a%10===0||a===20||a===25||a===125||usedA.has(a))continue;usedA.add(a);return a;}
  throw Error("No distinct a for "+d);
 }
 function residues(n,d,R,a,special){
  const lo=10**(d-1),hi=10**d-1;
  for(let trial=0;trial<30000;trial++){
   let b,sum;
   if(special){sum=special;let f=num(Math.max(lo,sum-hi),Math.min(hi,sum-lo));b=[f,sum-f];}
   else if(R==="R2"){sum=10**d;b=[num(lo,hi)];if(n===3)b.push(num(lo,hi));b.push(sum-b.reduce((x,y)=>x+y,0));}
   else if(R==="R1"){sum=10*num(Math.ceil(n*lo/10),Math.floor(n*hi/10));b=[num(lo,hi)];if(n===3)b.push(num(lo,hi));b.push(sum-b.reduce((x,y)=>x+y,0));}
   else{b=Array.from({length:n},()=>num(lo,hi));sum=b.reduce((x,y)=>x+y,0);}
   if(b.some(x=>digits(x)!==d||x===a)||new Set(b).size!==n||rc(sum)!==R)continue;
   let key=b.slice().sort((x,y)=>x-y).join(",");
   if(combos.has(key))continue;combos.add(key);return b;
  }throw Error("residues "+[n,d,R,a,special].join("-"));
 }
 function noise(d,exclude){let a=[];for(let i=0;i<2;i++)for(let j=0;j<4000;j++){let v=num(10**(d-1),10**d-1);if(v%10===0||exclude.has(v))continue;a.push(v);exclude.add(v);break;}if(a.length!==2)throw Error("noise");return a;}
 function apply(p,a,b,signs){
  const terms=new Array(p.term_count),t=p.common_terms;
  t.forEach((v,i)=>terms[v-1]=p.shared_positions[i]===1?[a,b[i]]:[b[i],a]);
  if(t.length<p.term_count){let z=noise(+p.L[2],new Set([a,...b]));for(let i=0;i<terms.length;i++)if(!terms[i])terms[i]=z;}
  const key=canon(terms,signs);if(exprs.has(key)||ids.has(p.id))throw Error("duplicate "+p.id);exprs.add(key);ids.add(p.id);
  const r=b.reduce((acc,v,i)=>acc+v*signs[t[i]-1],0);
  if(r<=0||rc(r)!==p.R)throw Error("R mismatch "+p.id+" "+r+" vs "+p.R);
  const others=terms.map((term,i)=>t.includes(i+1)?null:signs[i]*term[0]*term[1]).filter(x=>x!==null);
  const answer=terms.reduce((x,term,i)=>x+signs[i]*term[0]*term[1],0);
  if(answer!==a*r+others.reduce((x,y)=>x+y,0)||!Number.isSafeInteger(answer))throw Error("answer "+p.id);
  Object.assign(p,{terms,signs,answer,common_factor:a,remainder_sum:r,solution:{grouped_terms:b,other_products:others,grouped_product:a*r},remainder_digits:digits(r),cancellation_from_digits:signs.includes(-1)?+p.L[2]:null,numeric_revision:"v0.2"});
 }
 for(const p of bank.problems){
  const a=p.K==="K1"?p.common_factor:aNew(+p.L[1]);
  const special=p.K==="K1"?{20:50,25:40,125:80}[a]:null;
  const b=residues(p.shared_count,+p.L[2],p.R,a,special);
  apply(p,a,b,Array(p.term_count).fill(1));
 }
 const placements=["111","112","121","122","211","212","221","222"];
 for(const L of ["L33","L44"])for(const S of ["S1","S2"])for(let i=0;i<placements.length;i++){
  const P=placements[i],sg=S==="S1"?[1,1,-1]:[1,-1,1],d=+L[2],a=aNew(+L[1]);
  let target=i%2===0?num(2,9):num(11,89);if(i===3)target=10;if(i===7)target=30;
  const R=rc(target),low=d===3?230:2300,high=d===3?470:4700;
  let b;
  for(let tries=0;tries<30000;tries++){
   const x=num(low,high),y=num(low,high),v=x+y-target;
   const test=S==="S1"?[x,y,v]:[x,v,y];
   if(test.some(n=>digits(n)!==d||n===a)||new Set(test).size!==3)continue;
   const key=test.slice().sort((a,b)=>a-b).join(",");if(combos.has(key))continue;
   combos.add(key);b=test;break;
  }
  if(!b)throw Error("signed build failed");
  const id=`A4-N3T123-P${P}-${L}-${R}K0-H0${S}-01`;
  const p={id,terms:[],answer:0,common_factor:a,common_terms:[1,2,3],shared_positions:P.split("").map(Number),term_count:3,shared_count:3,L,R,K:"K0",H:"H0",S,remainder_sum:target,naive_multiplications:3,grouped_multiplications:1,phase:"all3_signed",discovery_difficulty:"unmeasured",checking:["estimate","alternative_grouping","sign"],solution:{},description:"共通因子をくくり、3/4桁の項の差で1/2桁になることを体験",status:"draft"};
  apply(p,a,b,sg);if(p.remainder_sum!==target)throw Error("signed target");
  bank.problems.push(p);
 }
 bank.schema_version="a4-bank-0.2";bank.updated="2026-11-22";
 bank.description="一般問題の共通因子・残り因子を多様化し、K1の20/25/125は意図的に反復。T123のS1/S2減算を32問追加（差で1/2桁）。";
 bank.validation={count:bank.problems.length,unique_ids:ids.size,unique_expressions:exprs.size};
 return bank;
}
const bank=diversifyA4(makeBank());
writeFileSync("problems/a4_bank.json",JSON.stringify(bank,null,2)+"\n","utf8");
console.log("A4",bank.problems.length);
