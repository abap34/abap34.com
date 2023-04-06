import json
import sys
import yaml

def parse_issue(issue, raw_file, settings_file):
    title = issue['title']
    body = issue['body']
    created_at = issue['created_at']
    updated_at = issue['updated_at']
    tags = [tag for tag in issue['labels'] if tag['name'] != 'submit']
    is_pickup = 'pickup' in tags
    
    with open(raw_file, 'w') as f:
        f.write(body)
    
    data = {
        'title': title,
        'date': created_at,
        'updated': updated_at,
        'tags': tags,
        'is_pickup': is_pickup
    }
    with open(settings_file, 'w') as f:
        yaml.dump(data, f)

if __name__ == '__main__':
    raw_file = sys.argv[2]
    settings_file = sys.argv[3]

    with open(sys.argv[1], 'r') as f:
        issue = json.load(f)

    parse_issue(issue, raw_file, settings_file)
