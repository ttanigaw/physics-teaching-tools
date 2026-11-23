import {readFileSync,writeFileSync} from "node:fs";
function exportA4Records(bank,plan){
 const dict=new Map(bank.problems.map(p=>[p.id,p])),rows=["# A4_SAMPLE_RECORDS_V2"],canon=new Set();
 const canonical=p=>p.terms.map((t,i)=>(p.signs[i]===-1?"-":"+")+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
 if(plan.sections.length!==10)throw Error("A4 v0.4 sample should have 10 sheets");
 for(const sec of plan.sections.slice(0,5)){
   if(sec.ids.length!==8||sec.ids.filter(id=>dict.get(id)?.S==="S1").length!==3)
     throw Error("First 5 worksheets must contain exactly three S1 examples");
 }
 if(plan.sections.flatMap(sec=>sec.ids).filter(id=>dict.get(id)?.S==="S1").length!==24)
   throw Error("Expected 24 S1 / 80 questions");
 for(let i=0;i<plan.sections.length;i++){
  const s=plan.sections[i];rows.push(["#PAGE",i+1,s.title,s.prompt,s.teacher_goal].join("\t"));
  for(const id of s.ids){
   const p=dict.get(id);if(!p)throw Error("missing "+id);
   const k=canonical(p);if(canon.has(k))throw Error("arithmetic duplicate "+id);canon.add(k);
   rows.push([i+1,id,p.terms.map(t=>t.join(",")).join(";"),p.answer,p.common_factor,p.common_terms.join(","),p.signs.join(",")].join("\t"));
  }
 }return rows.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a4_bank.json","utf8"));
const plan=JSON.parse(readFileSync("printable/a4_sample_plan.json","utf8"));
writeFileSync("printable/a4_sample_records.tsv",exportA4Records(bank,plan),"utf8");
