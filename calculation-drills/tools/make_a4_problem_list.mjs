import {readFileSync,writeFileSync} from "node:fs";
function listEval(b){
 const phaseLabels={recognition:"2項・くくりの発見",reward:"2項・和のボーナス",bonus:"A4×A2の複合",subtraction2:"2項・差をくくる",partial3:"3項のうち2項",all3:"3項すべて・加算",all3_signed:"3項すべて・減算"};
 const lines=[
 "# A4 全問題一覧","",
 `> 問題バンク全${b.problems.length}問（draft）。正本は [a4_bank.json](a4_bank.json)。一般問題は数値を多様化し、20・25・125は意図的に反復しています。`,"",
 "## 仮IDの命名規則","",
 "基本形式：**`A4-N2T12-P11-L32-R0K0-H0S0-01`**","",
 "| 要素 | 意味 | 読み方・コードの例 |",
 "|---|---|---|",
 "| `A4` | 技能分類 | 共通因子をくくる計算（分配法則の逆利用） |",
 "| `N2` | 元の式の項数 | `N2`＝2項、`N3`＝3項 |",
 "| `T12` | 共通因子を持つ項の番号 | `T12`＝第1・2項、`T13`＝第1・3項、`T23`＝第2・3項、`T123`＝3項全部 |",
 "| `P11` | `T`で指定した各項内で、共通因子がある位置 | 2因子の積の左側が`1`、右側が`2`。`P11`＝両項とも左、`P12`＝第1項は左・第2項は右。3項なら`P121`など |",
 "| `L32` | 共通因子と残りの因子の桁数 | 先の`3`＝共通因子3桁、後の`2`＝対象項の残りの因子が各2桁。`L33`、`L44`など |",
 "| `R0` | くくった後の和・差の性質 | `R0`＝10の倍数ではない通常の数、`R1`＝10の倍数（10の累乗以外）、`R2`＝10、100、1000など10の累乗 |",
 "| `K0` | 他の計算技能との複合 | `K0`＝A4が中心、`K1`＝A4でくくった後にA2的な工夫も有効（例：25×40） |",
 "| `H0` | 共通因子の見え方 | `H0`＝元の積に直接現れる。`H1`＝分解すると現れる（将来の拡張） |",
 "| `S0` | 項と項の間の符号 | `S0`＝すべて加算、`S1`＝**最後の項を減算**（N2なら＋−、N3なら＋＋−）、`S2`＝3項で第2項を減算（＋−＋） |",
 "| `-01` | 同じ詳細分類の数値違い | 末尾2桁の連番。配置や技能が異なれば別の分類IDにする |","",
 "**加算の桁数に関する作問規則**：共通因子をくくった括弧内の正の数の和について、例えば2桁＋2桁は2桁に収めるか、3桁なら**1の位が0**になる数にする。同様に3桁＋3桁では、3桁以内か、4桁になる場合は1の位が0になるようにする。4桁の残り因子や3項の和にも同じ原則を適用する。これは出題時の数値選択方針であり、独立したID軸ではありません。","",
 "**具体例（加算）**：`A4-N2T12-P11-L32-R0K0-H0S0-01` は `163×47＋163×29`。2項とも共通因子163が積の左側にあり、3桁×2桁の計算を、R0の和 `47＋29＝76` にまとめる問題です。","",
 "**具体例（減算）**：`A4-N2T12-P11-L22-R0K0-H0S1-01` は `51×88−51×55`。共通因子をくくると `51×(88−55)＝51×33` になります。","",
 "この仮IDは**数学的な構造**を表します。実測の発見難度、出題順、学習者の回答・自己点検結果などは別のメタデータで管理します。","",
 "[A4詳細設計](../design/A4_COMMON_FACTOR.md)",""
 ];
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
