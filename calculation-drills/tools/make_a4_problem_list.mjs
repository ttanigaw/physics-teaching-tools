import {readFileSync,writeFileSync} from "node:fs";
function makeList(bank){
 const labels={recognition:"2項・くくりの発見",reward:"2項・和のボーナス",bonus:"A4×A2の複合",partial3:"3項のうち2項",all3:"3項すべて"};
 const lines=["# A4 全問題一覧","",`> 問題バンク全${bank.problems.length}問（試作・未検証）。データの正本は [a4_bank.json](a4_bank.json)。`,"","仮IDは項数N・共通項T・項内位置P・桁数L・和の種類R・複合K・可視性H・符号S・末尾2桁の数値違いを示す。","","[A4詳細設計](../design/A4_COMMON_FACTOR.md)" ,""];
 for(const ph of ["recognition","reward","bonus","partial3","all3"]){
  const ps=bank.problems.filter(p=>p.phase===ph).sort((a,b)=>a.id.localeCompare(b.id,"en"));
  lines.push(`## ${labels[ph]}（${ps.length}問）`,"","| 仮ID | 数式 | 共通因子 | くくった後の形 | 答え |","|---|---|---:|---|---:|");
  for(const p of ps){const expr=p.terms.map(t=>t.join(" × ")).join(" + "),rest=p.terms.filter((_,i)=>!p.common_terms.includes(i+1)).map(t=>t.join(" × "));
   lines.push(`| \`${p.id}\` | ${expr} | ${p.common_factor} | ${p.common_factor} × (${p.solution.grouped_terms.join(" + ")})${rest.length?" + "+rest.join(" + "):""} | ${p.answer} |`);
  }lines.push("");
 }return lines.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a4_bank.json","utf8"));
writeFileSync("problems/A4_ALL_PROBLEMS.md",makeList(bank),"utf8");
