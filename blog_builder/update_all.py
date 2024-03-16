import sys
import glob


def main(rm=False):
    for path in glob.glob('posts/*.md'):
        with open(path, 'r') as f:
            if rm:
                text = f.read().split('\n', 1)[0]
            else:
                text = f.read()

        with open(path, 'w') as f:
            if rm:
                f.write(
                    text.split('\n')[-1]
                )

            else:
                f.write(text)

        
if __name__ == '__main__':
    # コマンドライン引数で -d オプションが指定された場合は main(rm=True) を実行
    main('-d' in sys.argv)