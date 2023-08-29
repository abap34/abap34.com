---
title: GitHub Actionsで過去コミットとかを参照したいときは fetch-depth: 0 にしないとダメだった
author: abap34
date: 2023/08/29
---

# GitHub Actionsで過去コミットとかを参照したいときは fetch-depth: 0 にしないとダメだった

## GitHub Actionsで過去コミットとかを参照したいときは fetch-depth: 0 にしないとダメだった

このページをビルドしてくれるGitHub Actionのワークフローファイルでは、
マークダウンファイルで差分があったときだけビルドするために

```
- name: Check for Changes in MD Files
        id: check_changes
        run: |
          changed_files=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep '\.md$' || true)
          if [[ -z "$changed_files" ]]; then
            echo "No changes in MD files. Skipping build."
            exit 1
          else
            echo "Change: $changed_files"
            echo "change_file=$changed_files" >> $GITHUB_OUTPUT
          fi
```

みたいなことをしていますが、これを普通に書くだけでは
`fetal: bad obejct xxx...`と言われます。

全然原因がわからず、
`actions/checkout@v2`を見にいくと、

![Alt text](checkout.png)

すいません。 READMEの一番上に書いてありました。

## 対応策

```
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v2
        with:
            fetch-depth: 0
```

として全てのコミットを参照できるようにすると
`git diff`が動いて差分だけビルドできるようになりました。


