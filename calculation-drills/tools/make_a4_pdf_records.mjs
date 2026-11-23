import {readFileSync,writeFileSync} from "node:fs";
function exportA4Records(bank,plan){
 const dict=new Map(bank.problems.map(p=>[p.id,p])),rows=["# A4_SAMPLE_RECORDS_V3"],seen=new Set();
 const canonical=p=>p.terms.map((t,i)=>(p.signs[i]===-1?"-":"+")+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
 if(plan.sections.length!==10)throw Error("A4 example must have 10 sheets");
 let h1Count=0,s1Count=0;
 for(let i=0;i<plan.sections.length;i++){
  const s=plan.sections[i];
  if(s.ids.length!==8)throw Error("Each worksheet must have 8 questions");
  const H1=s.ids.filter(id=>dict.get(id)?.H.startsWith("H1")).length;
  if(i<3&&H1!==0||i>=3&&(H1<1||H1>2))throw Error("H1 must be absent on first three sheets and appear 1-2 times on each later sheet");
  if(i<5&&s.ids.filter(id=>dict.get(id)?.S==="S1").length!==3)throw Error("The first 5 sheets need 3 S1 questions each");
  if(s.ids.slice(0,6).some(id=>dict.get(id)?.H.startsWith("H1")))throw Error("H1 belongs near bottom of sheet");
  rows.push(["#PAGE",i+1,s.title,s.prompt,s.teacher_goal].join("\t"));
  for(const id of s.ids){
   const p=dict.get(id);if(!p)throw Error("Unknown ID "+id);
   const k=canonical(p);if(seen.has(k))throw Error("Repeated equivalent calculation "+id);seen.add(k);
   const mult=p.H==="H0"?p.common_terms.map(()=>1):p.solution.factor_multipliers;
   if(mult.length!==p.common_terms.length||mult.filter(n=>n===2).length!==(p.H==="H0"?0:1))throw Error("Bad H1 multiplier metadata");
   if(p.H.startsWith("H1"))h1Count++;
   if(p.S==="S1")s1Count++;
   rows.push([i+1,id,p.terms.map(t=>t.join(",")).join(";"),p.answer,p.common_factor,p.common_terms.join(","),p.signs.join(","),mult.join(",")].join("\t"));
  }
 }
 if(h1Count!==9||s1Count!==24)throw Error("Wrong overall H1/S1 count");
 return rows.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a4_bank.json","utf8"));
const plan=JSON.parse(readFileSync("printable/a4_sample_plan.json","utf8"));
writeFileSync("printable/a4_sample_records.tsv",exportA4Records(bank,plan),"utf8");
