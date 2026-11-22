import {readFileSync,writeFileSync} from "node:fs";
function listEval(b){
 const phaseLabels={recognition:"2項・くくりの発見",reward:"2項・和のボーナス",bonus:"A4×A2の複合",partial3:"3項のうち2項",all3:"3項すべて・加算",all3_signed:"3項すべて・減算"};
 const lines=["# A4 全問題一覧","",`> 問題バンク全${b.problems.length}問（draft）。正本は [a4_bank.json](a4_bank.json)。一般問題は数値を多様化、20・25・125は意図的な反復。`,"","仮IDはN/T・P・L・R・K・H・Sを表す。S0=加算のみ、S1=第3項減算、S2=第2項減算。","", "[A4詳細設計](../design/A4_COMMON_FACTOR.md)",""];
 for(const phase of Object.keys(phaseLabels)){
  const probs=b.problems.filter(x=>x.phase===phase).sort((x,y)=>x.id.localeCompare(y.id,"en"));
  lines.push(`## ${phaseLabels[phase]}（${probs.length}問）`,"","| 仮ID | 数式 | 共通因子 | くくった後 | 正答 |","|---|---|---:|---|---:|");
  for(const p of probs){
   const fmt=(ts,signs)=>ts.map((t,i)=>(i>0?(signs[i]===-1?" − ":" + "):"")+t.join(" × ")).join("");
   const rs=p.common_terms.map((v,i)=>p.signs[v-1]);
   const residual=p.solution.grouped_terms.map(v=>[v]);
   const rest=p.terms.map((t,i)=>({t,i})).filter(x=>!p.common_terms.includes(x.i+1));
   const ext=rest.map(x=>` ${p.signs[x.i]===-1?"−":"+"} ${x.t.join(" × ")}`).join("");
   lines.push(`| \`${p.id}\` | ${fmt(p.terms,p.signs)} | ${p.common_factor} | ${p.common_factor} × (${fmt(residual,rs)})${ext} | ${p.answer} |`);
  }lines.push("");
 }
 return lines.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a4_bank.json","utf8"));
writeFileSync("problems/A4_ALL_PROBLEMS.md",listEval(bank),"utf8");
