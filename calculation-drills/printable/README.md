# A2 プリント試作

**試作中／未検証**。問題バンクを共通の正本とし、選択プランから学生用・解答解説用・教員向けメモの3種類のPDFを生成する。

| ファイル | 内容 |
|---|---|
| [a2_sample_plan.json](a2_sample_plan.json) | 試作5セット、計42問の問題IDと順序・指導意図 |
| [build_a2_sample.py](build_a2_sample.py) | A4 PDF 3種を再現可能に生成するスクリプト |

## 生成コマンド

`calculation-drills/`をカレントディレクトリとして実行する：

```bash
python -m pip install reportlab
python printable/build_a2_sample.py \
  --bank problems/a2_bank.json \
  --plan printable/a2_sample_plan.json \
  --out printable/generated
```

出力：
- `a2_sample_student.pdf`（5ページ、学生用：分類・解法は表示しない）
- `a2_sample_answers.pdf`（5ページ、解答・解説）
- `a2_sample_teacher.pdf`（1ページ、教員用メモ）

生成PDFは実行環境の `printable/generated/` に置く。**今はGitHubには生成ソースを登録し、PDF自体は試作品として会話に添付**する。後日正式公開する際のPDF配布方法は別途決める。

## 試作セットの構成

1. 2数の組の基礎確認（10問、九九だけの問題はなし）
2. 発見型、3数のP13を中心に（8問）
3. 3数・4数の位置と向きの混合（12問）
4. 分解の有無・複数組・対照問題（8問）
5. 初回答案と見直し後を分ける自己点検（4問）

**全員に42問を必ず課す設計ではない**。短いセットとして分割し、授業の段階や個々の前提技能に合わせて利用する。発見型の学生用紙面では解法の名称を先に示さない。授業前に数式・解答・難易度・記入欄を教員が再確認すること。
