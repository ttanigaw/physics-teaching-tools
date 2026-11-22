import {readFileSync,writeFileSync} from "node:fs";
function exportA4Records(bank,plan){
 const dict=new Map(bank.problems.map(p=>[p.id,p])),rows=["# A4_SAMPLE_RECORDS_V2"],canon=new Set();
 const canonical=p=>p.terms.map((t,i)=>(p.signs[i]===-1?"-":"+")+":"+t.slice().sort((a,b)=>a-b).join("×")).sort().join("+");
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
