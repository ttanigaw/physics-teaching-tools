import {readFileSync,writeFileSync} from "node:fs";
function exportRecords(bank,plan){
 const byId=new Map(bank.problems.map(p=>[p.id,p])),rows=["# A4_SAMPLE_RECORDS_V1"];
 for(let i=0;i<plan.sections.length;i++){
  const s=plan.sections[i],page=i+1;
  rows.push(["#PAGE",page,s.title,s.prompt,s.teacher_goal].join("\t"));
  for(const id of s.ids){const x=byId.get(id);if(!x)throw Error(id);
   rows.push([page,id,x.terms.map(t=>t.join(",")).join(";"),x.answer,x.common_factor,x.common_terms.join(",")].join("\t"));
  }
 }
 return rows.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a4_bank.json","utf8"));
const plan=JSON.parse(readFileSync("printable/a4_sample_plan.json","utf8"));
writeFileSync("printable/a4_sample_records.tsv",exportRecords(bank,plan),"utf8");
console.log("Wrote A4 print records.");
