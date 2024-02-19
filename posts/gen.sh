#!/bin/bash

template="---
title: 
author: abap34
date: $(date +'%Y/%m/%d')
tag: 
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: 
description: 
url: https://abap34.com/posts/$(basename "$1" .md).html
site_name: abap34.com
twitter_site: @abap34
---"

echo "$template" > "$1"

ogp_url=$(curl -s https://dog.ceo/api/breeds/image/random | jq -r '.message')
sed -i -e "s|ogp_url: |ogp_url: $ogp_url|g" "$1"
rm "$1-e"

mkdir -p $(basename "$1" .md)


echo "記事テンプレートが作成されました: $1"
