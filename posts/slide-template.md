---
title: Marp + GitHub Actionsのテンプレートを作った
author: abap34
date: 2024/03/14
tag: [日記, Marp, GitHub Actions]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/boxer/n02108089_2653.jpg
description: 
url: https://abap34.com/posts/slide-template.html
site_name: abap34's blog
twitter_site: @abap34
---


## Marp + GitHub Actionsのテンプレートを作った

タイトルの通りです。

レポジトリは、


<a href="https://github.com/abap34/slide-template"><img src="https://gh-card.dev/repos/abap34/slide-template.svg"></a>



## 内容としくみ

### 内容

このテンプレートを使うと、

- Marp でスライドを書いて、 main に push すると自動でビルド & GitHub Pages にデプロイ
- スライドのソースファイル分割

ができます。

スライドが共有しやすくなりますし、 Git管理の設定の手間が省けます。


また、 ファイルが長大になるとdiffがわかりづらくなる、VSCode extensionで表示がチラつくなどの現象がよく発生してましたが、
ファイル分割することで、これらの問題も解消されます。

### しくみ

#### GiHub Actions

```yaml
name: Build Slide and Deploy
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3

      - name: Setup
        run: |
            make preprocess

      - name: Marp Build 
        uses: docker://Marpteam/Marp-cli:v3.4.0
        with:
            args: build/slide.md --config-file .Marprc.yml --output build/index.html
        env:
            Marp_USER: root:root

      - uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```


ここは特に何もしてなく、普通に Marp のビルドを行って、 GitHub Pages にデプロイしています。

Marpは公式でDockerイメージを提供しているので、それを使っています。


#### Makefile


```makefile
SRC_DIR = slides
BUILD_DIR = build
SRC_FILES = $(wildcard $(SRC_DIR)/*[0-9]_*.md)
HEADER_FILE = $(firstword $(SRC_FILES))
REST_FILES = $(filter-out $(HEADER_FILE), $(SRC_FILES))
OUTPUT_FILE = $(BUILD_DIR)/slide.md
THEME_NAME = honwaka-theme
THEME_REPO = https://github.com/abap34/honwaka-theme
MARPRC_FILE = .marprc.yml


all: clean preprocess pdf html pptx

preprocess: $(OUTPUT_FILE)
	@echo "Preprocessing..."
	
$(OUTPUT_FILE): $(SRC_FILES)
	@mkdir -p $(BUILD_DIR)
	@echo "Clone theme..."
	@git clone $(THEME_REPO)
	@mv $(THEME_NAME) $(BUILD_DIR)
	@echo "Creating slide file..."
	@echo "N_SECTION = $(words $(SRC_FILES))"

	@cp -r $(SRC_DIR)/* $(BUILD_DIR)/

	@echo "HEADER_FILE = $(HEADER_FILE)"
	@cat $(HEADER_FILE) > $(OUTPUT_FILE)
	
	@for file in $(REST_FILES); do \
		echo "### section: $$file"; \
		awk 'BEGIN { found = 0; } { if (found >= 2) print; if ($$0 == "---") found++; }' $$file >> $(OUTPUT_FILE); \
	done

pdf: preprocess
	@echo "Creating PDF..."
	@marp $(OUTPUT_FILE) --config-file $(MARPRC_FILE) --output $(BUILD_DIR)/slide.pdf

html: preprocess
	@echo "Creating HTML..."
	@marp $(OUTPUT_FILE) --config-file $(MARPRC_FILE) --output $(BUILD_DIR)/slide.html

pptx: preprocess
	@echo "Creating PPTX..."
	@marp $(OUTPUT_FILE) --config-file $(MARPRC_FILE) --output $(BUILD_DIR)/slide.pptx


preview: clean preprocess
	@echo "Creating preview..."
	@marp $(OUTPUT_FILE) --config-file $(MARPRC_FILE) --preview


clean:
	@echo "Cleaning up..."
	@rm -rf $(BUILD_DIR)
	@rm -rf honwaka-theme

.PHONY: all preprocess pdf html preview clean
```


本質パートはここです。

```Makefile
@echo "HEADER_FILE = $(HEADER_FILE)"
@cat $(HEADER_FILE) > $(OUTPUT_FILE)

@for file in $(REST_FILES); do \
    echo "### section: $$file"; \
    awk 'BEGIN { found = 0; } { if (found >= 2) print; if ($$0 == "---") found++; }' $$file >> $(OUTPUT_FILE); \
done
```

Marpでは YAML Front Matter で設定を行うことができます.

これがないと VSCode でプレビューができないので、それぞれのファイルで先頭にこれを書く必要がありますが、
結合するときに不都合です。


なのでちゃっと `awk` で二つ目の `---` までを削除することでいい感じに結合できます。

## 今日の一曲


<iframe width="560" height="315" src="https://www.youtube.com/embed/ayDVB4IAZWA?si=NrdiIKGNQkvdetr8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


       