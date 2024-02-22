import glob


def main():
    for path in glob.glob('posts/*.md'):
        with open(path, 'r') as f:
            # 末尾に改行を追加
            text = f.read() + '\n'
        with open(path, 'w') as f:
            f.write(text)

        
if __name__ == '__main__':
    main()