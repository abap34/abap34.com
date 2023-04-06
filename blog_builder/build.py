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
    
    body = mistune.markdown(markdown)
    
    with open(output_file, 'w') as f:
        f.write(header)
        f.write(body)

if __name__ == '__main__':
    raw_file = sys.argv[1]
    settings_file = sys.argv[2]
    output_file = sys.argv[3]

    build_article(raw_file, settings_file, output_file)
