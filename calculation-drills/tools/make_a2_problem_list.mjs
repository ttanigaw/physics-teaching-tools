// Generate a human-readable, complete Markdown index from the canonical A2 bank.
// Run from calculation-drills/: node tools/make_a2_problem_list.mjs
import {readFileSync,writeFileSync} from "node:fs";

function buildList(bank) {
 const phaseLabels={foundation:"2数の基礎",discovery:"発見",transfer3:"3因子・転移",transfer4:"4因子・転移",decomposition:"分解",choice:"方略選択"};
 if(!Array.isArray(bank.problems)||!bank.problems.length)throw Error("Empty A2 problem bank");
 const ids=new Set(),expressions=new Set(),groups=new Map();
 const fmt=x=>String(x);
 for(const p of bank.problems) {
  const expr=p.factors.map(fmt).join(" × ");
  if(ids.has(p.id))throw Error("Duplicate ID: "+p.id);
  if(expressions.has(expr))throw Error("Duplicate expression: "+expr);
  if(!/^A2-(?:F\d[A-C]|F00)(?:_(?:F\d[A-C]))?-N[234]P(?:\d\d|00)(?:_P\d\d)?-D(?:0|1|2|B)(?:_D(?:0|1|2|B))?-\d{2}$/.test(p.id))throw Error("Invalid A2 ID: "+p.id);
  if(p.factors.length===2&&p.factors.every(x=>Number.isInteger(x)&&x>=1&&x<=9))throw Error("Isolated times-table problem: "+p.id);
  const product=p.factors.reduce((a,b)=>a*b,1);
  if(Math.abs(product-p.answer)>1e-8*Math.max(1,Math.abs(product)))throw Error("Wrong answer: "+p.id);
  if(!phaseLabels[p.phase])throw Error("Unknown phase: "+p.phase);
  ids.add(p.id);expressions.add(expr);
  const f=p.id.split("-")[1];
  if(!groups.has(f))groups.set(f,[]);
  groups.get(f).push(p);
 }
 const order=["F1A","F1B","F1C","F2A","F2B","F2C","F3A","F3B","F3C"];
 const labels={F1A:"2×5・基本形",F1B:"2×5・10の正の冪倍",F1C:"2×5・10の負の冪倍",F2A:"25×4・基本形",F2B:"25×4・10の正の冪倍",F2C:"25×4・10の負の冪倍",F3A:"125×8・基本形",F3B:"125×8・10の正の冪倍",F3C:"125×8・10の負の冪倍",F00:"対照問題（指定の有利な組なし）"};
 const sorted=[...groups.keys()].sort((a,b)=>{
  const x=order.indexOf(a),y=order.indexOf(b);
  if(x>=0&&y>=0)return x-y;
  if(x>=0)return -1;if(y>=0)return 1;
  if(a==="F00")return 1;if(b==="F00")return -1;
  return a.localeCompare(b,"en");
 });
 const lines=[
 "# A2 問題バンク：全問題一覧",
 "",
 `> **${bank.problems.length}問・すべて試作段階（draft）**。この一覧は [a2_bank.json](a2_bank.json) から生成しています。JSONをデータの正本とし、数値・仮ID・正答をこの一覧だけで編集しないでください。`,
 "",
 "## 読み方",
 "",
 "- **仮ID**：例 `A2-F2A-N3P13-D0-01`。F＝有利な数の組と倍率、N＝因子数、P＝位置と向き、D＝数の分解の有無・対象、末尾2桁＝同一詳細パターン内の数値違いを示します。",
 "- **出題区分**：問題バンクに登録された試作上の `phase` タグを日本語表記したものです。学習形式L1〜L5を固定するものではありません。",
 "- **着目する組**：作問時に想定した組です。分解のある問題では原式中にそのまま現れない場合があります。別解を排除する意味ではありません。",
 "- 主な対象は15〜16歳。九九だけの独立問題は含めません。",
 "",
 "関連資料：[問題バンクの説明](README.md)／[A2詳細設計](../design/A2_MULTIPLICATION_ORDER.md)／[問題バンク生成スクリプト](../tools/make_a2_bank.mjs)",
 "",
 "## 分類別件数",
 "",
 "| F分類 | 問題数 |",
 "|---|---:|"
 ];
 for(const f of sorted)lines.push(`| \`${f}\` | ${groups.get(f).length} |`);
 lines.push(`| **計** | **${bank.problems.length}** |`,"");
 for(const f of sorted) {
  const items=groups.get(f).slice().sort((a,b)=>a.id.localeCompare(b.id,"en"));
  lines.push(`## ${f}：${labels[f]||"複数の有利な組"}（${items.length}問）`,"","| 仮ID | 数式 | 正答 | 出題区分 | 着目する組 |","|---|---|---:|---|---|");
  for(const p of items){
   const expression=p.factors.map(fmt).join(" × ");
   const focus=p.focus.filter(pair=>pair.length===2).map(pair=>pair.map(fmt).join(" × ")).join("、")||"—";
   lines.push(`| \`${p.id}\` | ${expression} | ${fmt(p.answer)} | ${phaseLabels[p.phase]} | ${focus} |`);
  }
  lines.push("");
 }
 lines.push("---","","生成コマンド（`calculation-drills/` から実行）：`node tools/make_a2_problem_list.mjs`","","新規問題や分類コードを追加した場合、問題バンクの検証後に一覧を再生成してください。");
 return lines.join("\n")+"\n";
}
const bank=JSON.parse(readFileSync("problems/a2_bank.json","utf8"));
const markdown=buildList(bank);
writeFileSync("problems/A2_ALL_PROBLEMS.md",markdown,"utf8");
console.log("Wrote problems/A2_ALL_PROBLEMS.md:",bank.problems.length,"problems");
