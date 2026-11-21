import { writeFileSync } from "node:fs";
export function buildBank() {
  const problems=[], ids=new Set(),exprs=new Set(),serials=new Map();
  const baselines={F1:[2,5],F2:[25,4],F3:[125,8]};
  const round=(x)=>Math.round(x*1e9)/1e9;
  const same=(a,b)=>Math.abs(a-b)<1e-7;
  function validate(item){
    const parts=item.id.split("-");
    if(parts.length!==5||parts[0]!=="A2"||!/^\d\d$/.test(parts[4]))throw Error("ID syntax: "+item.id);
    const fcodes=parts[1].split("_");
    const NP=parts[2].match(/^N(\d+)(P\d\d(?:_P\d\d)*)$/);
    if(!NP)throw Error("NP: "+item.id);
    const N=+NP[1],pCodes=NP[2].split("_"),dCodes=parts[3].split("_");
    if(N!==item.factors.length||fcodes.length!==pCodes.length||fcodes.length!==dCodes.length||fcodes.length!==item.focus.length)throw Error("axes: "+item.id);
    const used=[];
    for(let i=0;i<fcodes.length;i++){
      const f=fcodes[i],p=pCodes[i],d=dCodes[i],target=item.focus[i];
      if(f==="F00"){if(p!=="P00"||d!=="D0"||target.length!==0)throw Error("control mismatch");continue;}
      if(!/^F[123][ABC]$/.test(f)||!/^P[1-9][1-9]$/.test(p)||!/^D(?:0|1|2|B)$/.test(d))throw Error("bad codes: "+item.id);
      const a=+p[1]-1,b=+p[2]-1;if(a>=N||b>=N||a===b)throw Error("position: "+item.id);
      used.push(a,b);
      const [v1,v2]=target, [z1,z2]=baselines["F"+f[1]];
      const ratios=[v1/z1,v2/z2];
      if(!ratios.every(x=>x>0&&same(Math.log10(x),Math.round(Math.log10(x)))))throw Error("not power 10: "+item.id);
      if(f[2]==="A"&&!ratios.every(x=>same(x,1)))throw Error("A factor: "+item.id);
      if(f[2]==="B"&&!(ratios.some(x=>x>1)&&ratios.every(x=>x>=1)))throw Error("B factor: "+item.id);
      if(f[2]==="C"&&!(ratios.some(x=>x<1)&&ratios.every(x=>x<=1)))throw Error("C factor: "+item.id);
      const s1=item.factors[a]/v1,s2=item.factors[b]/v2;
      const ck1=d==="D1"||d==="DB",ck2=d==="D2"||d==="DB";
      if(!((ck1? s1>1&&same(s1,Math.round(s1)):same(s1,1))&&(ck2?s2>1&&same(s2,Math.round(s2)):same(s2,1))))throw Error("D factors: "+item.id);
    }
    if(new Set(used).size!==used.length)throw Error("overlapping designated pairs: "+item.id);
  }
  function add(id,nums,focus,phase,checks,description){
    // Main audience is 15–16: isolated 1..9 × 1..9 is assumed mastered.
    // Products involving the multiplication table may still appear inside
    // multi-factor calculations, where the target is recognizing a shortcut.
    if(nums.length===2 && nums.every(v=>Number.isInteger(v) && v>=1 && v<=9))
      throw new Error("Do not include isolated multiplication-table problems: "+id);
    const item={id,factors:nums,focus,answer:round(nums.reduce((a,b)=>a*b,1)),phase,checks,description,skill:"A2",status:"draft",diagnostic_axes:[]};
    item.diagnostic_axes=id.slice(3).split("-").slice(0,3);
    validate(item);
    const expr=nums.join("×");
    if(ids.has(id)||exprs.has(expr))throw Error("duplicate ID or formula: "+id+" "+expr);
    ids.add(id);exprs.add(expr);
    problems.push(item);
    const prefix=id.replace(/-\d\d$/,"");
    serials.set(prefix,Math.max(serials.get(prefix)||0,+id.slice(-2)));
    return item;
  }
  function auto(f,np,d,nums,focus,phase,checks,description){
    const prefix=`A2-${f}-${np}-${d}`;
    const seq=(serials.get(prefix)||0)+1;
    if(seq>99)throw Error("serial overflow");
    return add(`${prefix}-${String(seq).padStart(2,"0")}`,nums,focus,phase,checks,description);
  }
  // These 28 expressions retain the IDs used in the reviewed A2 design document.
  const legacy=[
["A2-F2A-N3P13-D0-01",[25,37,4],[[25,4]],"discovery"],
["A2-F3A-N3P13-D0-01",[125,43,8],[[125,8]],"discovery"],
["A2-F1B-N3P13-D0-01",[20,67,5],[[20,5]],"discovery"],
["A2-F2A-N3P31-D0-01",[4,53,25],[[25,4]],"discovery"],
["A2-F1B-N3P31-D0-01",[50,19,2],[[2,50]],"discovery"],
["A2-F2A-N3P23-D0-01",[41,25,4],[[25,4]],"transfer3"],
["A2-F3A-N3P23-D0-01",[53,125,8],[[125,8]],"transfer3"],
["A2-F1B-N3P23-D0-01",[73,20,5],[[20,5]],"transfer3"],
["A2-F2A-N3P32-D0-01",[67,4,25],[[25,4]],"transfer3"],
["A2-F2A-N3P12-D0-01",[25,4,61],[[25,4]],"transfer3"],
["A2-F3A-N3P21-D0-01",[8,125,29],[[125,8]],"transfer3"],
["A2-F1B-N3P12-D0-01",[20,5,47],[[20,5]],"transfer3"],
["A2-F2A-N4P12-D0-01",[25,4,17,13],[[25,4]],"transfer4"],
["A2-F3A-N4P13-D0-01",[125,17,8,3],[[125,8]],"transfer4"],
["A2-F1B-N4P14-D0-01",[20,17,3,5],[[20,5]],"transfer4"],
["A2-F2A-N4P23-D0-01",[19,25,4,7],[[25,4]],"transfer4"],
["A2-F1B-N4P24-D0-01",[23,20,7,5],[[20,5]],"transfer4"],
["A2-F3A-N4P34-D0-01",[29,3,125,8],[[125,8]],"transfer4"],
["A2-F1B-N4P21-D0-01",[50,2,23,7],[[2,50]],"transfer4"],
["A2-F2A-N4P13-D0-01",[25,19,4,11],[[25,4]],"transfer4"],
["A2-F3A-N4P14-D0-01",[125,13,7,8],[[125,8]],"transfer4"],
["A2-F1B-N4P23-D0-01",[31,20,5,7],[[20,5]],"transfer4"],
["A2-F2A-N4P24-D0-01",[17,25,9,4],[[25,4]],"transfer4"],
["A2-F3A-N4P34-D0-02",[23,9,125,8],[[125,8]],"transfer4"],
["A2-F2A_F3A-N4P13_P42-D0_D0-01",[25,8,4,125],[[25,4],[125,8]],"choice"],
["A2-F1B_F2A-N4P13_P24-D0_D0-01",[20,25,5,4],[[20,5],[25,4]],"choice"],
["A2-F00-N3P00-D0-01",[13,17,19],[[]],"choice"],
["A2-F00-N4P00-D0-01",[11,17,23,3],[[]],"choice"]];
  for(const [id,n,f,phase] of legacy)add(id,n,f,phase,["M1","M4"],"設計書の既存候補");
  // Two-factor fluency: both directions, and scaled variants (do not treat scaling as decomposition).
  const variants={
    F1A:[[2,5]],F1B:[[20,5],[2,50],[200,5]],F1C:[[.2,5],[2,.5]],
    F2A:[[25,4]],F2B:[[250,4],[25,40]],F2C:[[2.5,4],[.25,4],[25,.4]],
    F3A:[[125,8]],F3B:[[1250,8],[125,80]],F3C:[[12.5,8],[1.25,8],[125,.8]]
  };
  for(const [f,sets] of Object.entries(variants)){
    for(const pair of sets){
      if(pair.every(v=>Number.isInteger(v) && v>=1 && v<=9)) continue;
      auto(f,"N2P12","D0",pair,[pair],"foundation",["M4"],"2数の積と倍率を確認");
      auto(f,"N2P21","D0",[pair[1],pair[0]],[pair],"foundation",["M4"],"逆の順でも計算");
    }
  }
  // Every ordered position pair in three-factor calculations; at least 4 F families.
  const positions3=["P12","P21","P13","P31","P23","P32"];
  const families3=[["F1A",[2,5]],["F1B",[20,5]],["F2A",[25,4]],["F3A",[125,8]]];
  for(let fi=0;fi<families3.length;fi++){
    const [f,pair]=families3[fi];
    for(let j=0;j<positions3.length;j++){
      const p=positions3[j],nums=new Array(3).fill(null),z=83+fi*8+j*4;
      nums[+p[1]-1]=pair[0];nums[+p[2]-1]=pair[1];
      for(let k=0;k<3;k++)if(nums[k]===null)nums[k]=z;
      auto(f,"N3"+p,"D0",nums,[pair],j===2||j===3?"discovery":"transfer3",["M1","M4"],"3因子・位置と向きの確認");
    }
  }
  // All 12 ordered position pairs with 4 factors, for 3 core families.
  const positions4=["P12","P21","P13","P31","P14","P41","P23","P32","P24","P42","P34","P43"];
  const families4=[["F1B",[20,5]],["F2A",[25,4]],["F3A",[125,8]]];
  for(let fi=0;fi<families4.length;fi++){
    const [f,pair]=families4[fi];
    for(let j=0;j<positions4.length;j++){
      const p=positions4[j],nums=[null,null,null,null];
      nums[+p[1]-1]=pair[0];nums[+p[2]-1]=pair[1];
      const others=[11+4*fi+2*j,17+4*fi+2*j];let k=0;
      for(let idx=0;idx<4;idx++)if(nums[idx]===null)nums[idx]=others[k++];
      auto(f,"N4"+p,"D0",nums,[pair],"transfer4",["M1","M4"],"4因子・位置と向きの確認");
    }
  }
  // Decomposition is orthogonal to the F family; include first/second/both and reversed P.
  const decomps=[
// 6×5 is excluded: a standalone multiplication-table exercise.
["F1A","N2P12","D2",[2,15],[2,5]],
["F1A","N2P12","DB",[6,15],[2,5]],
["F2A","N2P12","D1",[75,4],[25,4]],
["F2A","N2P12","D2",[25,12],[25,4]],
["F2A","N2P12","DB",[75,12],[25,4]],
["F2A","N2P21","D1",[4,75],[25,4]],
["F2A","N2P21","D2",[12,25],[25,4]],
["F3A","N2P12","D1",[375,8],[125,8]],
["F3A","N2P12","D2",[125,24],[125,8]],
["F3A","N2P12","DB",[375,24],[125,8]],
["F1B","N3P13","D1",[40,37,5],[20,5]],
["F1B","N3P13","D2",[20,53,15],[20,5]],
["F2A","N3P32","D2",[17,8,25],[25,4]],
["F2A","N3P13","D2",[25,17,12],[25,4]],
["F1A","N3P13","DB",[6,31,15],[2,5]],
["F3C","N4P24","DB",[37,25,19,24],[12.5,8]]
  ];
  for(const [f,np,d,n,pair]of decomps)auto(f,np,d,n,[pair],"decomposition",["M1","M6"],"基本の組を取り出すための分解");
  const distribution={};for(const p of problems){const a=p.id.split("-");const key=a[1]+"/"+a[2].slice(0,2)+"/"+a[3];distribution[key]=(distribution[key]||0)+1;}
  return {schema_version:"a2-bank-0.1",updated:"2026-11-21",status:"draft",description:"A2初期問題バンク。主対象15〜16歳。独立した九九（1〜9の整数同士の1回の積）は既習として除外。既存28候補とF/P/D診断別の問題を含み、PDFは一部を選択。",problems,validation:{count:problems.length,unique_ids:ids.size,unique_formulas:exprs.size}};
}
const bank=buildBank();
if(process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll("\\","/"))){
  writeFileSync(new URL("../problems/a2_bank.json",import.meta.url),JSON.stringify(bank,null,2)+"\n","utf8");
  console.log("Wrote",bank.problems.length,"problems.");
}
