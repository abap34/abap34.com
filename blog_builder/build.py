import mistune
import sys
import yaml

def build_article(raw_file, settings_file, output_file):
    with open(raw_file, 'r') as f:
        markdown = f.read()
    
    with open(settings_file, 'r') as f:
        data = yaml.safe_load(f)
    
    title = data['title']
    date = data['date']
    updated = data['updated']
    tags = data['tags']
    is_pickup = data['is_pickup']
    header = f'''
    ---
    title: {title}
    date: {date}
    updated: {updated}
    tags: {tags}
    is_pickup: {is_pickup}
    ---
    '''
    
    # 記事の本文をMarkdownからHTMLに変換する
    body = mistune.markdown(markdown)
    
    # 記事のHTMLをファイルに書き込む
    with open(output_file, 'w') as f:
        f.write(header)
        f.write(body)

# コマンドライン引数から記事の本文を保存するファイル名、記事のメタデータを保存するファイル名、記事のHTMLを保存するファイル名を取得する
raw_file = sys.argv[1]
settings_file = sys.argv[2]
output_file = sys.argv[3]

# 記事の本文とメタデータからHTMLを作成する
build_article(raw_file, settings_file, output_file)
