# A4 計算ドリル：試作PDF（v0.1）

A4問題バンク220問から**72問を選択した学生用9ページ、解答・解説9ページ、教員用メモ2ページ**の試作です。各ページは独立配布できます。数学的な正答と共通因子の位置を確認していますが、学習効果の実測はまだです。

| ページ | ねらい | 問題数 |
|---|---|---:|
| 1 | 2項・共通因子の発見、L33/L44を含む | 8 |
| 2 | 共通因子の位置 P11/P12/P21/P22 を混合 | 8 |
| 3 | L43/L44・R0、乗算負荷が高い問題 | 8 |
| 4 | R1/R2、10の倍数・10の冪のボーナス | 8 |
| 5 | A4×A2複合6問とR0対照2問 | 8 |
| 6 | 3項中2項に共通因子・L33 | 8 |
| 7 | 3項中2項に共通因子・L44 | 8 |
| 8 | 3項すべてに共通因子 | 8 |
| 9 | 3項中2項／全部を混ぜ、正答を見る前に見直す | 8 |

- [出題プラン：a4_sample_plan.json](a4_sample_plan.json)
- [PDF生成用の選択データ：a4_sample_records.tsv](a4_sample_records.tsv)
- PDF生成用プログラム：`build_a4_sample.py`
- [詳細設計](../design/A4_COMMON_FACTOR.md)
- [全問題一覧](../problems/A4_ALL_PROBLEMS.md)

`calculation-drills/`から：

```bash
python -m pip install reportlab
node tools/make_a4_pdf_records.mjs
python printable/build_a4_sample.py \
  --records printable/a4_sample_records.tsv \
  --out printable/generated
```

生成ファイル名：
- `a4_sample_student.pdf`
- `a4_sample_answers.pdf`
- `a4_sample_teacher.pdf`

学生用には「共通因子でくくりなさい」「R0」などの解法の種明かしをしません。答え用には共通因子を用いた代表的な変形を記載し、別解を許容します。最終ページで初回答案と見直し後を分けます。

**PDFは試作品として会話で提供し、GitHubには再生成するためのJSON・TSV・スクリプトを登録**します。正式公開時のPDF保存方法は別途決めます。
