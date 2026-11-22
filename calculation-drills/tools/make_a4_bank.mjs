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
const bank=makeBank();
writeFileSync("problems/a4_bank.json",JSON.stringify(bank,null,2)+"\n","utf8");
console.log("A4",bank.problems.length);
