#!/usr/bin/env python3
"""Render draft A2 student, answer, and teacher PDFs from the shared bank and print plan.

Requirements: reportlab. Example:
 python build_a2_sample.py --bank ../problems/a2_bank.json --plan ../printable/a2_sample_plan.json --out .
"""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
FONT = "HeiseiKakuGo-W5"
PAGE_W, PAGE_H = A4
MARGIN = 38
PAPER_W = PAGE_W - 2*MARGIN
INK, MUTED, BORDER, ACCENT = [HexColor(x) for x in ("#17202A", "#64707B", "#CBD3DB", "#1D4156")]
LIGHT = HexColor("#F3F6F7")


def fmt(v):
    if isinstance(v, int) or (isinstance(v, float) and abs(v-round(v)) < 1e-8):
        return str(int(round(v)))
    return f"{v:.8g}"


def expr(problem):
    return " × ".join(fmt(x) for x in problem["factors"])


def focus_formula(problem):
    return "、".join(" × ".join(fmt(v) for v in pair) for pair in problem["focus"] if pair)


def comment(problem):
    """Representative method, not a claim of a unique optimum."""
    if not any(problem["focus"]):
        return "きりのよい積が特にない対照問題。別の順で概算してもよい。"
    id_parts = problem["id"].split("-")
    focus = problem["focus"]
    ds = id_parts[3].split("_")
    decomposition = []
    ps = id_parts[2].split("P")[1:]
    for pair, posstr, d in zip(focus, ps, ds):
        if len(posstr) != 2:
            continue
        a, b = int(posstr[0])-1, int(posstr[1])-1
        if d in ("D1", "DB"):
            n = problem["factors"][a]
            ratio = n / pair[0]
            decomposition.append(f"{fmt(n)}={fmt(pair[0])}×{fmt(ratio)}")
        if d in ("D2", "DB"):
            n = problem["factors"][b]
            ratio = n / pair[1]
            decomposition.append(f"{fmt(n)}={fmt(pair[1])}×{fmt(ratio)}")
    pair_parts = [f"{fmt(a)}×{fmt(b)}={fmt(a*b)}" for a,b in focus if len([a,b]) == 2]
    head = "先に " + "、".join(pair_parts)
    if decomposition:
        return "分解: " + "、".join(decomposition) + "。 " + head
    return head


def tx(c, x, y, string, size=10, color=INK):
    c.setFont(FONT, size)
    c.setFillColor(color)
    c.drawString(x, y, str(string))


def fit(c, x, y, value, max_w, size=13, min_size=8, color=INK):
    size=float(size)
    while pdfmetrics.stringWidth(str(value),FONT,size)>max_w and size>min_size:
        size-=0.35
    tx(c,x,y,value,size,color)


def header(c, title, subtitle, page_no, student=False):
    c.setFillColor(ACCENT)
    c.rect(0,PAGE_H-9,PAGE_W,9,stroke=0,fill=1)
    tx(c,MARGIN,PAGE_H-48,title,18,INK)
    tx(c,MARGIN,PAGE_H-76,subtitle,11,MUTED)
    if student:
        tx(c,PAGE_W-205,PAGE_H-46,"氏名：",10,MUTED)
        c.setLineWidth(.65);c.setStrokeColor(BORDER)
        c.line(PAGE_W-170,PAGE_H-48,PAGE_W-MARGIN,PAGE_H-48)
    c.setLineWidth(.6);c.setStrokeColor(BORDER)
    c.line(MARGIN,PAGE_H-94,PAGE_W-MARGIN,PAGE_H-94)
    tx(c,MARGIN,28,"A2 / 試作版 v0.1　・　2026-11-21",8,MUTED)
    tx(c,PAGE_W-MARGIN-80,28,f"{page_no} ページ",8,MUTED)


def draw_problem(c, p, label, x, top, w, h, mode):
    c.setLineWidth(.6);c.setStrokeColor(BORDER)
    c.roundRect(x,top-h,w,h-5,5,stroke=1,fill=0)
    tx(c,x+13,top-26,f"{label}.",10,MUTED)
    fit(c,x+45,top-27,expr(p),w-62,14,9)
    c.setLineWidth(.55);c.setStrokeColor(BORDER)
    if mode=="selfcheck":
        tx(c,x+15,top-58,"最初の答え",9,MUTED)
        c.line(x+102,top-61,x+w-16,top-61)
        tx(c,x+15,top-96,"見直し後",9,MUTED)
        c.line(x+102,top-99,x+w-16,top-99)
        tx(c,x+15,top-124,"見直しで気づいたこと：",8,MUTED)
    elif h>=126:
        c.line(x+15,top-h+42,x+w-15,top-h+42)
        tx(c,x+15,top-h+15,"答え：",9,MUTED)
        c.line(x+57,top-h+15,x+w-15,top-h+15)
    else:
        tx(c,x+15,top-h+19,"答え：",9,MUTED)
        c.line(x+55,top-h+18,x+w-15,top-h+18)


def student_pdf(plan, lookup, dest):
    c=Canvas(str(dest),pagesize=A4,pageCompression=1)
    c.setTitle("A2 計算ドリル　学生用・試作")
    y0=PAGE_H-124
    for page,section in enumerate(plan["sections"],1):
        header(c,"計算ドリル　試作",section["student_title"],page,student=True)
        notes={
          "foundation":"次の計算をしてください。",
          "discovery":"次の計算をしてください。途中式は自由に書いてかまいません。",
          "transfer":"次の計算をしてください。",
          "decomposition":"次の計算をしてください。",
          "selfcheck":"まず答えを書き、答えを見る前に見直して、必要なら書き直しましょう。",
        }
        tx(c,MARGIN,y0,notes[section["key"]],10,INK)
        items=[lookup[x] for x in section["ids"]]
        top=y0-25
        mode=section["layout"]
        if mode=="two-column":
            cols=2; gap=10; cell_w=(PAPER_W-gap)/2
            rows=math.ceil(len(items)/2)
            max_h=(top-74)/rows
            for i,p in enumerate(items):
                r,col=divmod(i,2)
                draw_problem(c,p,i+1,MARGIN+col*(cell_w+gap),top-r*max_h,cell_w,max_h,mode)
        else:
            rows=len(items)
            extra=("selfcheck"==mode)
            h=min(143 if extra else 75, (top-74)/rows)
            for i,p in enumerate(items):
                draw_problem(c,p,i+1,MARGIN,top-i*h,PAPER_W,h,mode)
        if section["key"]=="discovery":
            tx(c,MARGIN,61,"ふり返り：途中で計算の進め方を変えた問題があれば、番号を書いてください。",9,MUTED)
            c.line(MARGIN+423,59,PAGE_W-MARGIN,59)
        if section["key"]=="selfcheck":
            tx(c,MARGIN,73,"答えを見る前に、自分で見直せた問題の番号：",9,MUTED)
            c.line(MARGIN+270,72,PAGE_W-MARGIN,72)
        c.showPage()
    c.save()


def answer_pdf(plan, lookup, dest):
    c=Canvas(str(dest),pagesize=A4,pageCompression=1)
    c.setTitle("A2 計算ドリル　解答・解説・試作")
    pnum=0
    for s in plan["sections"]:
        pnum+=1
        header(c,"解答・解説　試作",s["student_title"]+" / 問題番号は学生用PDFと対応",pnum)
        top=PAGE_H-129
        n=len(s["ids"])
        h=min(94 if n<=8 else 54,(top-61)/n)
        for i,id in enumerate(s["ids"]):
            p=lookup[id]
            y=top-i*h
            c.setLineWidth(.5);c.setStrokeColor(BORDER)
            c.line(MARGIN,y-37,PAGE_W-MARGIN,y-37)
            tx(c,MARGIN,y-4,f"{i+1:02d}.",10,MUTED)
            fit(c,MARGIN+35,y-4,expr(p),205,12,8)
            fit(c,MARGIN+290,y-4,"＝ "+fmt(p["answer"]),PAPER_W-296,12,9,ACCENT)
            fit(c,MARGIN+35,y-25,comment(p),PAPER_W-45,9,7,MUTED)
        c.showPage()
    c.save()


def teacher_pdf(plan, lookup, dest):
    c=Canvas(str(dest),pagesize=A4,pageCompression=1)
    c.setTitle("A2 計算ドリル　教員用メモ・試作")
    header(c,"教員向けメモ　試作","A2 / ねらい・扱い方・設計上の制約",1)
    y=PAGE_H-130
    lines=[
      "この資料は初期試作です。学習効果・適正問題数は未検証です。",
      "目的 G1: 自分で工夫を発見　G2: 計算手順を選択　G3: 正答を見る前に自己点検",
      "初回の基礎問題でつまずく場合、難しい配置や分解へ進む前に補充を検討します。",
      "発見型（2ページ）では、最初から「25×4を先に」等と教えないでください。",
      "支援の例：①順番は固定か？ ②先に計算しやすい数は？ ③例題の2通りを比較。",
      "L1の発見に至らなくても失敗扱いしません。必要なら適切な時点で示します。",
      "位置 P12 は左からでもよい場合があり、必ず並べ替える練習とはしません。",
      "分解 D1/D2/DB は基本の積 F とは独立の習熟要素として観察します。",
      "最後の自己点検では「最初の答え」と「見直し後」を正答提示前に記録します。",
      "正しい別解を認め、最終解答のみから実際の計算経路を断定しません。",
    ]
    for item in lines:
        fit(c,MARGIN,y,item,PAPER_W,10,8)
        y-=35
    y-=12
    tx(c,MARGIN,y,"今回の試作セットの内訳",12,ACCENT);y-=28
    for s in plan["sections"]:
        p0=lookup[s["ids"][0]]
        tx(c,MARGIN+6,y,f"{s['student_title']}：{len(s['ids'])} 問",10,INK)
        y-=29
    y-=10
    tx(c,MARGIN,y,"問題バンクとPDFの関係",12,ACCENT);y-=30
    for line in [
       "・A2の全問題バンクから、このPDFでは44問を抽出しています。",
       "・配布する問題数は学習者の前提技能と授業時間に応じて変更できます。",
       "・IDは生徒用に表示せず、教員と将来のCBDでの診断に利用します。",
       "・公開リポジトリに個別の生徒の答案・履歴を保存しません。",
    ]:
        fit(c,MARGIN,y,line,PAPER_W,9,8);y-=24
    c.showPage();c.save()


def run():
    ap=argparse.ArgumentParser()
    ap.add_argument("--bank",type=Path,required=True)
    ap.add_argument("--plan",type=Path,required=True)
    ap.add_argument("--out",type=Path,default=Path("."))
    args=ap.parse_args()
    bank=json.loads(args.bank.read_text(encoding="utf-8"))
    plan=json.loads(args.plan.read_text(encoding="utf-8"))
    lookup={x["id"]:x for x in bank["problems"]}
    if len(lookup)!=len(bank["problems"]):raise ValueError("Duplicate IDs")
    selection=[id for s in plan["sections"] for id in s["ids"]]
    if len(selection)!=len(set(selection)):raise ValueError("Repeated question in print plan")
    if missing:=set(selection)-set(lookup):raise ValueError(f"Missing IDs: {missing}")
    for item in bank["problems"]:
        product=math.prod(item["factors"])
        if not math.isclose(product,item["answer"],rel_tol=1e-10,abs_tol=1e-7):
            raise ValueError("Answer mismatch: "+item["id"])
    args.out.mkdir(parents=True,exist_ok=True)
    files=[args.out/"a2_sample_student.pdf",args.out/"a2_sample_answers.pdf",args.out/"a2_sample_teacher.pdf"]
    student_pdf(plan,lookup,files[0]); answer_pdf(plan,lookup,files[1]);teacher_pdf(plan,lookup,files[2])
    print(f"Validated {len(bank['problems'])} bank entries; rendered {len(selection)} selected questions")
    for f in files:print(f, f.stat().st_size)

if __name__=="__main__":run()
