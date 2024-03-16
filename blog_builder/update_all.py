import glob


def main():
    for path in glob.glob('posts/*.md'):
        with open(path, 'r') as f:
            # 末尾にスペースを追加
            text = f.read() + ' '
            
        with open(path, 'w') as f:
            f.write(text)

        
if __name__ == '__main__':
    main()