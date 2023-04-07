import json
import sys
import time

def parse_issue(issue, raw_file, settings_file):
    title = issue['title']
    body = issue['body']
    created_at = issue['created_at']
    updated_at = issue['updated_at']
    tags = [tag['name'] for tag in issue['labels'] if tag['name'] != 'submit']
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

    # export raw markdown
    with open(raw_file, 'w') as f:
        f.write(body)

    # encode dat['body'] by base64
    import base64
    data['body'] = base64.b64encode(body.encode('utf-8')).decode('utf-8')
    
    # export data as json
    with open(settings_file, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    raw_file = sys.argv[2]
    settings_file = sys.argv[3]

    print('-------- parse --------')

    print('read issue json from', sys.argv[1])
    print('export body to ', raw_file)
    print('export settings to ', settings_file)

    with open(sys.argv[1], 'r') as f:
        issue = json.load(f)

    parse_issue(issue, raw_file, settings_file)