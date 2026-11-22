#!/usr/bin/env python3
"""Create A4 trial PDFs from a4_sample_records.tsv (generated from bank and plan).
Run from calculation-drills/: python printable/build_a4_sample.py --records printable/a4_sample_records.tsv --out printable/generated
Requires reportlab.
"""
from __future__ import annotations
import argparse
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
F="HeiseiKakuGo-W5"
W,H=A4
M=43
INK=HexColor("#263849")
SUB=HexColor("#637382")
BORDER=HexColor("#C5CED7")
ACCENT=HexColor("#22465D")

def load(path):
    pages={}
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        if not raw or raw.startswith("# A4_SAMPLE_RECORDS"):continue
        if raw.startswith("#PAGE\t"):
            _,n,title,prompt,goal=raw.split("\t",4)
            pages[int(n)]={"title":title,"prompt":prompt,"goal":goal,"items":[]}
            continue
        fields=raw.split("\t")
        if len(fields)!=7:raise ValueError("Bad v2 row: "+raw)
        pg,pid,term_data,ans,a,target,sign_data=fields
        terms=[tuple(map(int,x.split(","))) for x in term_data.split(";")]
        target=[int(x) for x in target.split(",")]
        signs=[int(v) for v in sign_data.split(",")]
        ans,a=int(ans),int(a)
        if len(signs)!=len(terms) or signs[0]!=1 or any(s not in (1,-1) for s in signs):
            raise ValueError("Bad signs: "+pid)
        if ans!=sum(s*x*y for s,(x,y) in zip(signs,terms)):raise ValueError("Bad answer: "+pid)
        if any(a not in terms[i-1] for i in target):raise ValueError("Bad common factor: "+pid)
        pages[int(pg)]["items"].append({"id":pid,"terms":terms,"signs":signs,"answer":ans,"a":a,"target":target})
    ordered=[pages[i] for i in sorted(pages)]
    if len(ordered)!=10 or any(len(s["items"])!=8 for s in ordered):raise ValueError("Need 10×8")
    ids=[p["id"] for s in ordered for p in s["items"]]
    if len(set(ids))!=len(ids):raise ValueError("Repeated ID")
    return ordered

def t(c,x,y,s,sz=10,color=INK):
    c.setFont(F,sz);c.setFillColor(color);c.drawString(x,y,str(s))

def fit(c,x,y,s,width,sz=12,low=7.5,color=INK):
    while sz>low and pdfmetrics.stringWidth(str(s),F,sz)>width:sz-=0.3
    t(c,x,y,s,sz,color)

def head(c,label,sub,page,total,student=False):
    c.setFillColor(ACCENT);c.rect(0,H-8,W,8,stroke=0,fill=1)
    t(c,M,H-48,label,17);t(c,M,H-73,sub,10,SUB)
    if student:
        t(c,W-199,H-46,"氏名：",10,SUB)
        c.setStrokeColor(BORDER);c.line(W-153,H-49,W-M,H-49)
    c.setStrokeColor(BORDER);c.line(M,H-88,W-M,H-88)
    t(c,M,25,"A4 計算ドリル / 試作 v0.2",8,SUB)
    t(c,W-M-81,25,f"{page}/{total} ページ",8,SUB)

def formula(p):
    return "".join(("" if i==0 else (" − " if p["signs"][i]<0 else " + "))+f"{x} × {y}" for i,(x,y) in enumerate(p["terms"]))

def grouped(p):
    a=p["a"]
    target=p["target"]
    tokens=[]
    for j,i in enumerate(target):
        x,y=p["terms"][i-1]
        v=y if x==a else x
        sg=p["signs"][i-1]
        tokens.append(("" if j==0 else (" − " if sg<0 else " + "))+str(v))
    result=f"{a} × ("+"".join(tokens)+")"
    for i,term in enumerate(p["terms"],1):
        if i not in target:
            result+=(" − " if p["signs"][i-1]<0 else " + ")+f"{term[0]} × {term[1]}"
    return result

def answer_detail(p):
    a=p["a"]
    rest=p["target"]
    remainder=sum(p["signs"][i-1]*(p["terms"][i-1][1] if p["terms"][i-1][0]==a else p["terms"][i-1][0]) for i in rest)
    others=[p["signs"][i-1]*x*y for i,(x,y) in enumerate(p["terms"],1) if i not in rest]
    part=f"= {a:,} × {remainder:,}"
    for v in others:
        part+=(" − " if v<0 else " + ")+f"{abs(v):,}"
    return part+f" = {p['answer']:,}"


def student(pages,out):
    c=Canvas(str(out),pagesize=A4,pageCompression=1);c.setTitle("A4 計算ドリル 学生用")
    for page,section in enumerate(pages,1):
        head(c,"計算ドリル　試作",section["title"],page,len(pages),student=True)
        fit(c,M,H-108,section["prompt"],W-2*M,10,9)
        for i,p in enumerate(section["items"]):
            y=H-126-78.7*i
            c.setLineWidth(.55);c.setStrokeColor(BORDER)
            c.roundRect(M,y-78.7+5,W-2*M,73.7,4,stroke=1,fill=0)
            t(c,M+12,y-23,f"{i+1:02}.",9.5,SUB)
            fit(c,M+45,y-25,formula(p),W-2*M-59,13.3,9.2)
            if "見直し" in section["title"]:
                t(c,M+15,y-49,"最初：",8.5,SUB);c.line(M+60,y-50,M+227,y-50)
                t(c,M+248,y-49,"見直し後：",8.5,SUB);c.line(M+325,y-50,W-M-13,y-50)
            else:
                t(c,M+15,y-60,"答え：",8.8,SUB);c.line(M+58,y-61,W-M-13,y-61)
        c.showPage()
    c.save()

def answers(pages,out):
    c=Canvas(str(out),pagesize=A4,pageCompression=1);c.setTitle("A4 計算ドリル 解答・解説")
    for page,section in enumerate(pages,1):
        head(c,"解答・代表的な計算方法",section["title"],page,len(pages))
        t(c,M,H-108,"共通因子を用いた計算例です。別解も認めてください。",9,SUB)
        for i,p in enumerate(section["items"]):
            y=H-126-78.7*i
            c.setStrokeColor(BORDER);c.setLineWidth(.5);c.line(M,y-72.7,W-M,y-72.7)
            t(c,M+5,y-20,f"{i+1:02}.",9,SUB)
            fit(c,M+37,y-21,formula(p),W-2*M-44,11.2,8.1)
            fit(c,M+37,y-43,"= "+grouped(p),W-2*M-44,10.2,7.5,ACCENT)
            fit(c,M+37,y-64,answer_detail(p),W-2*M-44,10.1,7.5)
        c.showPage()
    c.save()

def teacher(pages,out):
    c=Canvas(str(out),pagesize=A4,pageCompression=1);c.setTitle("A4 計算ドリル 教員用メモ")
    head(c,"教員向けメモ　試作","A4 / 共通因子による計算の工夫",1,2)
    notes=[
        "主対象は15〜16歳。九九は既習。大きい数の掛け算も意図的に使用。",
        "くくった後に和が特別な数にならなくても掛け算の回数を減らせる。",
        "R0を中心に、R1/R2は追加のうれしさを体験するボーナス。",
        "L33/L44は桁数をそろえ、数字を探して共通因子を発見する練習。",
        "1～3ページ：2項の工夫。最初は解法を教えず発見の余地を残す。",
        "4ページ：R1/R2。5ページ：20×50、25×40、125×80とA2との複合。",
        "6～7ページ：3項中2項に共通因子。乗算3回→2回。",
        "8ページ：3項すべてに共通因子。乗算3回→1回を発見する。",
        "9ページ：3項すべてをくくり、差で3桁が1桁・2桁になる発見。",
        "10ページ：3項中2項／全部の混合、減算の確認と自己点検。",
        "学生用では分類コードと解法の種明かしを出さない。",
        "必要なら段階的ヒント。別の効率的解法を認める。",
        "全80問が必修ではない。目的に合うページを選んで配布。",
        "問題バンク252問のうち一部を使った未検証の試作教材。",
    ]
    y=H-125
    for note in notes:fit(c,M,y,"・"+note,W-2*M,9.5,8);y-=39
    c.showPage();head(c,"教員向けメモ　試作","各ページのねらいと問題数",2,2)
    y=H-125
    for i,section in enumerate(pages,1):
        t(c,M,y,f'{i}. {section["title"]}（8問）',11)
        fit(c,M+17,y-23,section["goal"],W-2*M-20,9.2,8,SUB)
        y-=61
    fit(c,M,y-8,"計80問。数式と分類は検証済み。学習効果は未検証。",W-2*M,9,8,ACCENT)
    c.showPage();c.save()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--records",type=Path,required=True)
    ap.add_argument("--out",type=Path,default=Path("."))
    args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    pages=load(args.records)
    for name,create in [("a4_sample_student.pdf",student),("a4_sample_answers.pdf",answers),("a4_sample_teacher.pdf",teacher)]:
        create(pages,args.out/name)
        print(args.out/name)
if __name__=="__main__":main()
