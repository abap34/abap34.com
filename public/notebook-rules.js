(() => {
    const article = document.querySelector('.content');
    if (!article) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const rules = document.createElementNS(svgNS, 'svg');
    rules.classList.add('notebook-rules');
    rules.setAttribute('aria-hidden', 'true');
    rules.setAttribute('focusable', 'false');
    const path = document.createElementNS(svgNS, 'path');
    rules.append(path);
    article.append(rules);
    article.classList.add('notebook-ruled');

    // コード・図表・独立した数式などには罫線を引かない．
    const excluded = [
        'script', 'style', 'svg', 'pre', 'table', 'figure', 'img', 'video',
        'iframe', 'canvas', 'textarea', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        '.code-block', '.cb', '.math-block', '.math-scroll', '.link-card', '.responsive-card',
        'mjx-container[display="true"]', '[hidden]', '[aria-hidden="true"]',
        '.article-navigation', '.mobile-related-articles', '.related-articles', '.utterances',
    ].join(',');
    const atomicInline = '.math-inline, .inline-code, mjx-container';
    const range = document.createRange();
    let pending = false;

    function fitInlineMath() {
        const changes = [];
        for (const inline of article.querySelectorAll('.math-inline')) {
            const math = inline.querySelector('mjx-math');
            if (!math) continue;
            let owner = inline.parentElement;
            while (owner !== article && getComputedStyle(owner).display === 'inline') owner = owner.parentElement;
            const style = getComputedStyle(owner);
            const width = owner.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            // 閉じた details など，幅をまだ測れない要素は次の表示時に処理する．
            if (width <= 0) continue;
            const scroll = math.getBoundingClientRect().width > width + 0.5;
            if (scroll !== inline.classList.contains('math-scroll')) changes.push({ inline, scroll });
        }
        for (const { inline, scroll } of changes) {
            inline.classList.toggle('math-scroll', scroll);
            if (scroll) {
                inline.setAttribute('tabindex', '0');
            } else {
                inline.removeAttribute('tabindex');
            }
        }
    }

    function compactBlankLines() {
        for (const lineBreak of article.querySelectorAll('br')) {
            if (lineBreak.closest(excluded)) continue;
            let previous = lineBreak.previousSibling;
            while (previous && (
                previous.nodeType === Node.COMMENT_NODE ||
                (previous.nodeType === Node.TEXT_NODE && !previous.textContent.trim()) ||
                (previous.nodeType === Node.ELEMENT_NODE && previous.matches('script, style'))
            )) previous = previous.previousSibling;
            if (previous?.nodeType !== Node.ELEMENT_NODE || !previous.matches('br, .notebook-blank-line')) continue;
            // 行を終える最初の br は残し，空行だけを半行分の余白にする．
            const blank = document.createElement('span');
            blank.className = 'notebook-blank-line';
            blank.setAttribute('aria-hidden', 'true');
            lineBreak.replaceWith(blank);
        }
    }

    function draw() {
        pending = false;
        compactBlankLines();
        fitInlineMath();
        const origin = rules.getBoundingClientRect();
        const groups = new Map();

        function addRects(owner, rects, includeEmptyLine = false) {
            for (const rect of rects) {
                if ((!rect.width && !includeEmptyLine) || !rect.height) continue;
                if (!groups.has(owner)) groups.set(owner, []);
                groups.get(owner).push(rect);
            }
        }

        function hasInlineContent(lineBreak, direction) {
            for (let node = lineBreak[direction]; node; node = node[direction]) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.trim()) return true;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('br, .notebook-blank-line, script, style, template, [hidden]')) continue;
                    const style = getComputedStyle(node);
                    if (style.display === 'none' || style.visibility !== 'visible') continue;
                    if (!['inline', 'inline-block', 'contents'].includes(style.display)) return false;
                    if (node.textContent.trim()) return true;
                }
            }
            return false;
        }

        // almo の本文は p 要素だけでなく，テキストと br の並びでも出力される．
        // インライン要素を含めて行を測り，箇条書きや引用は各ブロックの幅を使う．
        function measure(element, owner) {
            // 閉じた details の本文にも矩形を返すブラウザーがあるため除外する．
            const children = element.matches('details:not([open])')
                ? [...element.children].filter(child => child.tagName === 'SUMMARY').slice(0, 1)
                : element.childNodes;
            for (const node of children) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (!node.textContent.trim()) continue;
                    range.selectNodeContents(node);
                    addRects(owner, range.getClientRects());
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('.notebook-blank-line')) {
                        if (hasInlineContent(node, 'previousSibling') && hasInlineContent(node, 'nextSibling')) {
                            const rect = node.getBoundingClientRect();
                            if (rect.width && rect.height) {
                                // 短くした空行では余白の中央を基準に罫線を置く．
                                const center = rect.top + rect.height / 2;
                                addRects(owner, [{ top: center - 0.5, bottom: center + 0.5, width: rect.width, height: 1 }]);
                            }
                        }
                        continue;
                    }
                    if (node.matches(excluded)) continue;
                    const style = getComputedStyle(node);
                    if (style.display === 'none' || style.visibility !== 'visible') continue;
                    if (node.tagName === 'BR') {
                        // 空行もブラウザーの実際の行位置で測る．br の矩形は幅が 0 になる．
                        // 前後が文章につながらない，ブロック境界の空行は除く．
                        if (hasInlineContent(node, 'previousSibling') && hasInlineContent(node, 'nextSibling')) {
                            addRects(owner, node.getClientRects(), true);
                        }
                    } else if (node.matches(atomicInline)) {
                        addRects(owner, node.getClientRects());
                        // 分数や添字は通常のインラインボックスからはみ出すため，数式自体も測る．
                        if (node.matches('.math-inline')) {
                            const math = node.querySelector('mjx-container');
                            if (math) addRects(owner, math.getClientRects());
                        }
                    } else {
                        const inline = style.display === 'inline' || style.display === 'contents';
                        measure(node, inline ? owner : node);
                    }
                }
            }
        }

        measure(article, article);
        const rows = [];
        for (const [owner, rects] of groups) {
            rects.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
            const lines = [];
            for (const rect of rects) {
                const previous = lines[lines.length - 1];
                // 強調・リンク・数式など，同じ行にある断片を一つにまとめる．
                if (previous && rect.top < previous.bottom - 1) {
                    previous.bottom = Math.max(previous.bottom, rect.bottom);
                } else {
                    lines.push({ top: rect.top, bottom: rect.bottom });
                }
            }

            const box = owner.getBoundingClientRect();
            const style = getComputedStyle(owner);
            const left = box.left - origin.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
            const right = box.right - origin.left - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
            const start = left;
            if (start >= right - 1.5) continue;
            for (const line of lines) {
                rows.push({ ...line, start, right });
            }
        }

        rows.sort((a, b) => a.top - b.top);
        const segments = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const next = rows[index + 1];
            // 箇条書きの項目間や背の高い数式でも，罫線が次の文字に重ならないようにする．
            const offset = next ? Math.min(4, (next.top - row.bottom) / 2) : 4;
            if (offset < 1.75) continue;
            const y = row.bottom - origin.top + offset;
            segments.push(`M${row.start},${y.toFixed(2)}H${(row.right - 1.5).toFixed(2)}`);
        }

        // 行の位置の読み取りを終えてから罫線を描画する．
        path.setAttribute('d', segments.join(' '));
    }

    function schedule() {
        if (pending) return;
        pending = true;
        requestAnimationFrame(draw);
    }

    new ResizeObserver(schedule).observe(article);
    new MutationObserver(records => {
        if (records.some(record => !rules.contains(record.target))) schedule();
    }).observe(article, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'open', 'hidden'],
    });
    new MutationObserver(schedule).observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });
    // 後から読み込まれる画像・数式・フォント，折り畳みの開閉にも追従する．
    article.addEventListener('load', schedule, true);
    article.addEventListener('toggle', schedule, true);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    document.fonts.addEventListener('loadingdone', schedule);
    schedule();
})();
