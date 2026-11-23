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
function applyA4Corrections(bank){
 const patch={
  "A4-N2T12-P11-L22-R0K0-H0S0-01": {
    "a": 59,
    "b": [
      71,
      46
    ]
  },
  "A4-N2T12-P11-L32-R0K0-H0S0-01": {
    "a": 163,
    "b": [
      47,
      29
    ]
  },
  "A4-N2T12-P11-L22-R1K0-H0S0-01": {
    "b": [
      23,
      37
    ]
  },
  "A4-N2T12-P22-L22-R1K0-H0S0-01": {
    "b": [
      11,
      59
    ]
  },
  "A4-N2T12-P12-L22-R1K0-H0S0-01": {
    "b": [
      33,
      27
    ]
  },
  "A4-N2T12-P11-L33-R1K0-H0S0-02": {
    "b": [
      438,
      152
    ]
  },
  "A4-N2T12-P11-L43-R1K0-H0S0-01": {
    "b": [
      131,
      349
    ]
  },
  "A4-N2T12-P22-L44-R1K0-H0S0-01": {
    "b": [
      1016,
      3534
    ]
  },
  "A4-N3T123-P111-L33-R1K0-H0S0-01": {
    "b": [
      126,
      598,
      156
    ]
  },
  "A4-N3T123-P111-L33-R2K0-H0S0-01": {
    "b": [
      179,
      158,
      663
    ]
  },
  "A4-N3T123-P121-L33-R2K0-H0S0-01": {
    "b": [
      546,
      296,
      158
    ]
  },
  "A4-N3T123-P121-L44-R2K0-H0S0-01": {
    "b": [
      5616,
      1050,
      3334
    ]
  },
  "A4-N3T123-P122-L33-R2K0-H0S0-01": {
    "b": [
      589,
      299,
      112
    ]
  },
  "A4-N3T123-P122-L44-R2K0-H0S0-01": {
    "b": [
      4715,
      4044,
      1241
    ]
  },
  "A4-N3T123-P211-L44-R2K0-H0S0-01": {
    "b": [
      4162,
      1091,
      4747
    ]
  },
  "A4-N3T123-P221-L33-R2K0-H0S0-01": {
    "b": [
      789,
      106,
      105
    ]
  },
  "A4-N3T123-P221-L44-R2K0-H0S0-01": {
    "b": [
      7503,
      1061,
      1436
    ]
  },
  "A4-N3T123-P222-L33-R2K0-H0S0-01": {
    "b": [
      402,
      161,
      437
    ]
  },
  "A4-N3T123-P222-L44-R2K0-H0S0-01": {
    "b": [
      6692,
      1918,
      1390
    ]
  }
};
 const index=new Map(bank.problems.map(p=>[p.id,p]));
 const cat=s=>s>=10&&Number.isInteger(Math.log10(s))?"R2":s%10===0?"R1":"R0";
 const digit=n=>String(Math.abs(n)).length;
 for(const [id,fix]of Object.entries(patch)){
  const p=index.get(id);if(!p)throw Error("Missing corrected ID "+id);
  const a=fix.a??p.common_factor,b=fix.b;
  if(b.length!==p.common_terms.length)throw Error("Wrong residual count "+id);
  const terms=p.terms.map(t=>t.slice());
  for(let i=0;i<p.common_terms.length;i++){
   const pos=p.common_terms[i]-1,col=p.shared_positions[i]-1;
   terms[pos]=col===0?[a,b[i]]:[b[i],a];
  }
  const sum=b.reduce((u,v)=>u+v,0);
  if(cat(sum)!==p.R||digit(a)!==+p.L[1]||b.some(v=>v<=0||digit(v)!==+p.L[2]))throw Error("Classification mismatch "+id);
  const others=terms.map((t,i)=>p.common_terms.includes(i+1)?null:t[0]*t[1]).filter(v=>v!==null);
  const answer=terms.reduce((u,t)=>u+t[0]*t[1],0);
  if(answer!==a*sum+others.reduce((u,v)=>u+v,0))throw Error("Wrong answer "+id);
  Object.assign(p,{terms,common_factor:a,remainder_sum:sum,answer,solution:{grouped_terms:b,other_products:others,grouped_product:a*sum},remainder_digits:digit(sum),numeric_revision:"v0.2.2"});
 }
 if(bank.problems.some(p=>p.S==="S0"&&p.terms.flat().some(v=>v<=0)))throw Error("Negative factor in addition-only exercise");
 const idx=new Set(bank.problems.map(p=>p.id));
 const canonical=new Set(bank.problems.map(p=>p.terms.map((t,i)=>p.signs[i]+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+")));
 if(idx.size!==bank.problems.length||canonical.size!==bank.problems.length)throw Error("Duplicated structure after corrections");
 const elementary=bank.problems.filter(p=>p.phase==="recognition"&&p.shared_positions.join("")==="11");
 if(elementary.some(p=>p.terms.flat().some(v=>v>1&&(v&(v-1))===0)))throw Error("Accidental power of two in introductory aligned problems");
 bank.schema_version="a4-bank-0.2.2";
 bank.description="A4問題バンク252問。通常問題を多様化、K1は意図して反復。初歩の無関係な2のべき乗を回避し、S0の負数因子を修正。減算S1/S2は32問。";
 bank.validation={count:bank.problems.length,unique_ids:idx.size,unique_expressions:canonical.size};
 return bank;
}
function finishA4(bank){
  // S1 = subtraction of final term (N2 and N3); S2 = subtraction of the middle term (N3).
  // Addition-only groupings must not grow one digit unless the units digit is zero.
  const dg=n=>String(Math.abs(n)).length;
  const kind=n=>n>=10&&Number.isInteger(Math.log10(n))?"R2":n%10===0?"R1":"R0";
  const canon=p=>p.terms.map((t,i)=>p.signs[i]+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
  const pairKey=b=>b.slice().sort((a,b)=>a-b).join(",");
  const hash=s=>{let v=2166136261>>>0;for(const c of s)v=Math.imul(v^c.charCodeAt(0),16777619)>>>0;return v;};
  const rng=id=>{let seed=hash(id);return(lo,hi)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return lo+Math.floor((seed/4294967296)*(hi-lo+1));};};
  const needFix=p=>p.S==="S0"&&p.shared_count>=2&&+p.L[2]>=2&&p.remainder_sum>=10**(+p.L[2])&&p.remainder_sum%10!==0;
  const changing=bank.problems.filter(needFix);
  const seenPairs=new Set(bank.problems.filter(p=>!needFix(p)).map(p=>pairKey(p.solution.grouped_terms)));
  const seenA=new Set(bank.problems.filter(p=>p.K==="K0").map(p=>p.common_factor));
  const usedExpr=new Set(bank.problems.filter(p=>!needFix(p)).map(canon));
  function rewrite(p,b){
    const a=p.common_factor,terms=p.terms.map(t=>t.slice());
    for(let i=0;i<p.common_terms.length;i++){
      const ti=p.common_terms[i]-1,side=p.shared_positions[i]-1;
      terms[ti]=side===0?[a,b[i]]:[b[i],a];
    }
    const sum=b.reduce((x,y,i)=>x+p.signs[p.common_terms[i]-1]*y,0);
    const otherProducts=terms.map((t,i)=>p.common_terms.includes(i+1)?null:p.signs[i]*t[0]*t[1]).filter(x=>x!==null);
    const directly=terms.reduce((x,t,i)=>x+p.signs[i]*t[0]*t[1],0);
    if(kind(sum)!==p.R||directly!==a*sum+otherProducts.reduce((x,y)=>x+y,0)||terms.flat().some(v=>v<=0))throw Error("Invalid normalization "+p.id);
    Object.assign(p,{terms,answer:directly,remainder_sum:sum,solution:{grouped_terms:b,other_products:otherProducts,grouped_product:a*sum},remainder_digits:dg(sum),numeric_revision:"v0.3"});
  }
  for(const p of changing){
    const d=+p.L[2],n=p.shared_count,low=10**(d-1),high=10**d-1,r=rng(p.id);
    let chosen;
    for(let tries=0;tries<50000;tries++){
      const target=r(n*low,10**d-1);
      if(kind(target)!=="R0")continue;
      const b=[],sum=()=>b.reduce((x,y)=>x+y,0);
      for(let j=0;j<n;j++){
        const remain=n-j-1;
        const min=Math.max(low,target-sum()-remain*high);
        const max=Math.min(high,target-sum()-remain*low);
        if(min>max)break;
        b.push(r(min,max));
      }
      if(b.length!==n||sum()!==target||b.some(v=>v===p.common_factor)||new Set(b).size!==n)continue;
      if(p.phase==="recognition"&&p.shared_positions.join("")==="11"&&b.some(v=>v>1&&(v&(v-1))===0))continue;
      if(seenPairs.has(pairKey(b)))continue;
      const clone={...p,terms:p.terms.map(t=>t.slice())};
      for(let j=0;j<n;j++){
        const ti=p.common_terms[j]-1;
        clone.terms[ti]=p.shared_positions[j]===1?[p.common_factor,b[j]]:[b[j],p.common_factor];
      }
      if(usedExpr.has(canon(clone)))continue;
      chosen=b;break;
    }
    if(!chosen)throw Error("Unable to keep R0 and constrain sum on "+p.id);
    seenPairs.add(pairKey(chosen));
    rewrite(p,chosen);
    usedExpr.add(canon(p));
  }
  let added=0;
  const positions=["11","22","12","21"];
  const digitClasses=["L22","L32","L33","L43","L44"];
  for(const L of digitClasses)for(let pi=0;pi<positions.length;pi++)for(let v=0;v<2;v++){
    const P=positions[pi],R=v===0?"R0":pi%2===0?"R1":"R2",id=`A4-N2T12-P${P}-${L}-${R}K0-H0S1-01`;
    const rnd=rng(id),ad=+L[1],bd=+L[2],alo=10**(ad-1),ahi=10**ad-1,blo=10**(bd-1),bhi=10**bd-1;
    let a=null;
    for(let i=0;i<30000;i++){
      const v=rnd(alo,ahi);
      if(v%10===0||v===20||v===25||v===125||seenA.has(v)||(v>1&&(v&(v-1))===0))continue;
      a=v;seenA.add(v);break;
    }
    if(a===null)throw Error("No fresh common factor for "+id);
    let chosen=null;
    for(let i=0;i<20000;i++){
      let delta;
      if(R==="R2")delta=10**(bd-1);
      else if(R==="R1"){
        const from=bd===2?20:bd===3?120:1200;
        const to=bd===2?70:bd===3?490:4900;
        delta=10*rnd(from/10,to/10);
      }else{
        const from=pi%2===0?(bd===2?7:bd===3?17:75):(bd===2?21:bd===3?119:1109);
        const to=pi%2===0?(bd===2?39:bd===3?93:390):(bd===2?69:bd===3?386:3890);
        delta=rnd(from,to);
        if(delta%10===0)continue;
      }
      if(delta<=0||delta>=bhi-blo||kind(delta)!==R)continue;
      const first=rnd(blo+delta,bhi),second=first-delta,b=[first,second];
      if(b.some(z=>z===a||z>1&&(z&(z-1))===0)||seenPairs.has(pairKey(b)))continue;
      const terms=P.split("").map((s,j)=>+s===1?[a,b[j]]:[b[j],a]);
      const item={
        id,terms,signs:[1,-1],answer:a*delta,common_factor:a,common_terms:[1,2],
        shared_positions:P.split("").map(Number),term_count:2,shared_count:2,
        L,R,K:"K0",H:"H0",S:"S1",remainder_sum:delta,
        naive_multiplications:2,grouped_multiplications:1,phase:"subtraction2",
        discovery_difficulty:"unmeasured",checking:["estimate","alternative_grouping","sign"],
        solution:{grouped_terms:b,other_products:[],grouped_product:a*delta},
        remainder_digits:dg(delta),cancellation_from_digits:bd,
        description:"2項の減算でも共通因子をくくり、掛け算2回を1回に減らす。残りの差の桁縮約も扱う。",
        status:"draft",numeric_revision:"v0.3"
      };
      if(usedExpr.has(canon(item)))continue;
      chosen=item;seenPairs.add(pairKey(b));usedExpr.add(canon(item));break;
    }
    if(!chosen)throw Error("Cannot generate N2 subtraction "+id);
    bank.problems.push(chosen);added++;
  }
  // Verification includes every sign and every grouping, not only new entries.
  const IDs=new Set(),expressions=new Set(),sumOffenders=[];
  for(const p of bank.problems){
    if(IDs.has(p.id)||expressions.has(canon(p)))throw Error("Duplicate problem "+p.id);
    IDs.add(p.id);expressions.add(canon(p));
    if(p.terms.flat().some(v=>!Number.isInteger(v)||v<=0))throw Error("Invalid factors "+p.id);
    if(p.S==="S0"&&!p.signs.every(s=>s===1))throw Error("S0 signs "+p.id);
    if(p.S==="S1"&&(p.signs.slice(0,-1).some(s=>s!==1)||p.signs.at(-1)!==-1))throw Error("S1 last negative "+p.id);
    if(p.S==="S2"&&(p.term_count!==3||p.signs.join(",")!=="1,-1,1"))throw Error("S2 middle negative "+p.id);
    if(p.shared_count!==p.common_terms.length||p.common_terms.length!==p.shared_positions.length)throw Error("bad T/P "+p.id);
    const bs=p.common_terms.map((pos,i)=>{
      if(p.terms[pos-1][p.shared_positions[i]-1]!==p.common_factor)throw Error("T/P disagreement "+p.id);
      return p.terms[pos-1][2-p.shared_positions[i]];
    });
    if(dg(p.common_factor)!==+p.L[1]||bs.some(b=>dg(b)!==+p.L[2]))throw Error("L mismatch "+p.id);
    const sum=bs.reduce((x,y,i)=>x+y*p.signs[p.common_terms[i]-1],0);
    if(sum!==p.remainder_sum||kind(sum)!==p.R)throw Error("R mismatch "+p.id);
    const direct=p.terms.reduce((x,t,i)=>x+p.signs[i]*t[0]*t[1],0);
    const grouped=p.common_factor*sum+p.terms.reduce((x,t,i)=>x+(p.common_terms.includes(i+1)?0:p.signs[i]*t[0]*t[1]),0);
    if(direct!==p.answer||direct!==grouped)throw Error("answer mismatch "+p.id);
    if(p.S==="S0"&&+p.L[2]>=2&&p.shared_count>=2&&sum>=10**(+p.L[2])&&sum%10!==0)sumOffenders.push(p.id);
  }
  if(sumOffenders.length)throw Error("Overflow not rounded: "+sumOffenders.join(","));
  if(added!==40)throw Error("expected 40 new N2 questions");
  bank.schema_version="a4-bank-0.3";
  bank.updated="2026-11-23";
  bank.description="A4: N2の減算S1を40問追加。S1は末項を引く（N2/N3共通）、S2は3項の第2項を引く。加算で残る因子の和が元の桁を超える場合は1の位を0にする。";
  bank.validation={count:bank.problems.length,unique_ids:IDs.size,unique_expressions:expressions.size};
  return bank;
}
function extendA4H1(bank){
 const P2=["11","22","12","21"],P3=["111","112","121","122","211","212","221","222"];
 const candidates=Array.from({length:39},(_,i)=>11+i).filter(a=>a%5!==0&&![16,32].includes(a));
 const counts=new Map(),seen=new Set(),seenBases=new Set();
 const key=p=>p.terms.map((t,i)=>p.signs[i]+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
 for(const p of bank.problems){seen.add(key(p));if(p.L==="L22"&&p.solution?.grouped_terms)seenBases.add(p.solution.grouped_terms.slice().sort((a,b)=>a-b).join(","));}
 const hash=s=>{let h=2166136261>>>0;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
 const generator=s=>{let z=hash(s);return(lo,hi)=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return lo+Math.floor(z/4294967296*(hi-lo+1));};};
 const type=n=>n>=10&&Number.isInteger(Math.log10(n))?"R2":n%10===0?"R1":"R0";
 const gcd=(a,b)=>{while(b){const r=a%b;a=b;b=r;}return a;};
 function add(N,T,P,ordinal,S,R){
  const H="H1"+"ABC"[ordinal],id=`A4-N${N}T${T}-P${P}-L22-${R}K0-${H}${S}-01`;
  const which=T.split("").map(v=>+v-1),sg=S==="S0"?Array(N).fill(1):S==="S1"?Array(N).fill(1).map((x,i)=>i===N-1?-1:1):[1,-1,1],rand=generator(id);
  let found=null;
  const sorted=candidates.slice().sort((a,b)=>(counts.get(a)||0)-(counts.get(b)||0)||(hash(id+"/"+a)%197)-(hash(id+"/"+b)%197));
  for(const a of sorted){
   for(let j=0;j<65000;j++){
    const raw=which.map((v,i)=>rand(11,i===ordinal?49:99)),mult=which.map((v,i)=>i===ordinal?2:1);
    if(raw.some(x=>x%10===0))continue;
    const eff=raw.map((x,i)=>x*mult[i]);
    const rem=eff.reduce((s,x,i)=>s+x*sg[which[i]],0);
    if(rem<=0||type(rem)!==R||R==="R0"&&rem>=100||R==="R1"&&rem>=200)continue;
    if(R==="R0"&&eff.reduce((s,x)=>gcd(s,x),0)!==1)continue;
    if(raw.some(x=>x===a||x===2*a)||eff.some(x=>x===a||x===2*a||x<10||x>99)||new Set(raw).size!==raw.length)continue;
    const terms=Array(N);
    for(let i=0;i<which.length;i++){
     const x=a*mult[i],y=raw[i];
     terms[which[i]]=P[i]==="1"?[x,y]:[y,x];
    }
    if(N>which.length){
      const forbid=new Set([a,2*a,...raw,...eff]);let noise;
      for(let k=0;k<120;k++){
       const x=rand(11,99),y=rand(11,99);
       if(x!==y&&[x,y].every(n=>n%10!==0&&!forbid.has(n)&&n%a!==0)){noise=[x,y];break;}
      }
      if(!noise)continue;
      for(let i=0;i<N;i++)if(!terms[i])terms[i]=noise;
    }
    if(terms.some(t=>t.some(v=>v<10||v>99)))throw Error("H1 digits "+id);
    const proof=terms.map((t,i)=>sg[i]+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+"),rawkey=raw.slice().sort((a,b)=>a-b).join(",");
    if(seen.has(proof)||seenBases.has(rawkey))continue;
    const others=terms.map((t,i)=>which.includes(i)?null:sg[i]*t[0]*t[1]).filter(v=>v!==null),direct=terms.reduce((s,t,i)=>s+sg[i]*t[0]*t[1],0);
    if(direct<=0||direct!==a*rem+others.reduce((s,v)=>s+v,0))throw Error("H1 answer "+id);
    const p={id,terms,signs:sg,answer:direct,common_factor:a,common_terms:which.map(v=>v+1),shared_positions:P.split("").map(Number),term_count:N,shared_count:which.length,L:"L22",R,K:"K0",H,S,remainder_sum:rem,
     hidden_ratio:2,doubled_target_index:ordinal+1,doubled_term_index:which[ordinal]+1,visible_shared_factors:mult.map(v=>a*v),
     naive_multiplications:N,grouped_multiplications:N-which.length+2,large_multiplications_before:N,large_multiplications_after:N-which.length+1,small_doublings_after:1,
     phase:N===2?"hidden2":which.length===2?"hidden3_partial":"hidden3_all",discovery_difficulty:"unmeasured",checking:["estimate","alternative_grouping"],
     solution:{grouped_terms:eff,raw_grouped_terms:raw,factor_multipliers:mult,other_products:others,grouped_product:a*rem},
     remainder_digits:String(rem).length,cancellation_from_digits:sg.includes(-1)?2:null,
     description:"2倍の数に隠れた共通因子。H1A/B/Cは対象項の何番目が2倍か。",status:"draft",numeric_revision:"v0.4"};
    found={p,proof,rawkey};break;
   }
   if(found)break;
  }
  if(!found)throw Error("Cannot generate "+id);
  bank.problems.push(found.p);seen.add(found.proof);seenBases.add(found.rawkey);
  counts.set(found.p.common_factor,(counts.get(found.p.common_factor)||0)+1);
 }
 for(const P of P2)for(const d of [0,1])for(const S of ["S0","S1"])for(let v=0;v<2;v++)add(2,"12",P,d,S,v===0?"R0":S==="S0"&&P==="11"?"R2":"R1");
 for(const T of ["12","13","23"])for(const P of P2)for(const d of [0,1])add(3,T,P,d,"S0",P==="22"?"R1":"R0");
 for(const P of P3)for(const d of [0,1,2])add(3,"123",P,d,"S0",d===2?"R1":"R0");
 for(const P of P3)for(const S of ["S1","S2"])add(3,"123",P,(P3.indexOf(P)+(S==="S2"?1:0))%3,S,P3.indexOf(P)%4===0?"R1":"R0");
 const ids=new Set(bank.problems.map(p=>p.id));
 if(ids.size!==bank.problems.length||seen.size!==bank.problems.length||bank.problems.filter(p=>p.H.startsWith("H1")).length!==96)throw Error("Bank verification failed");
 bank.schema_version="a4-bank-0.4";bank.updated="2026-11-23";
 bank.description="L22で共通因子の見かけの違いが2倍になるH1A/B/Cを96問追加。N2、N3の2項共通と3項共通。H0データと試作プリントは維持。";
 bank.validation={count:bank.problems.length,unique_ids:ids.size,unique_expressions:seen.size};
 return bank;
}
const bank=extendA4H1(finishA4(applyA4Corrections(diversifyA4(makeBank()))));
writeFileSync("problems/a4_bank.json",JSON.stringify(bank,null,2)+"\n","utf8");
console.log("A4",bank.problems.length);
