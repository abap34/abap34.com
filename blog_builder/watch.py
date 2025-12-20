#!/usr/bin/env python3
# /// script
# dependencies = [
#     "aiofiles",
#     "aiohttp",
#     "click",
#     "psutil",
#     "qrcode",
#     "watchdog",
# ]
# ///

import asyncio
import json
import logging
import os
import pathlib
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from datetime import datetime
from typing import List, Optional, Set, Dict, Any
import signal

import aiohttp
from aiohttp import web, WSMsgType
import psutil
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import qrcode
import click
import aiofiles

# ログ設定
logging.basicConfig(level=logging.WARNING)  # 外部ライブラリのログを抑制
logger = logging.getLogger("pro_watch")


class GitHelper:
    @staticmethod
    def get_changed_articles() -> List[Dict[str, str]]:
        try:
            # 変更・ステージング・新規ファイルを取得
            commands = [
                (["git", "diff", "--name-only", "posts/*.md"], "modified"),
                (["git", "diff", "--cached", "--name-only", "posts/*.md"], "staged"),
                (["git", "ls-files", "--others", "--exclude-standard", "posts/*.md"], "new")
            ]
            
            articles = []
            seen = set()
            
            for cmd, status in commands:
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
                    if result.returncode == 0:
                        for line in result.stdout.strip().split('\n'):
                            if line and line.startswith('posts/') and line.endswith('.md'):
                                name = pathlib.Path(line).stem
                                if name not in seen:
                                    articles.append({"name": name, "status": status, "path": line})
                                    seen.add(name)
                except subprocess.TimeoutExpired:
                    pass
            
            return articles
        except Exception:
            return []
    
    @staticmethod
    def get_recent_articles(limit: int = 5) -> List[Dict[str, str]]:
        try:
            cmd = ["git", "log", "--oneline", "--name-only", f"-{limit*2}", "--", "posts/*.md"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            
            if result.returncode != 0:
                return []
            
            articles = []
            seen = set()
            
            for line in result.stdout.split('\n'):
                if line.startswith('posts/') and line.endswith('.md'):
                    name = pathlib.Path(line).stem
                    if name not in seen and len(articles) < limit:
                        articles.append({"name": name, "status": "recent", "path": line})
                        seen.add(name)
            
            return articles
        except Exception:
            return []


class SmartFileWatcher(FileSystemEventHandler):
    def __init__(self, callback, loop=None, watch_patterns: List[str] = None):
        super().__init__()
        self.callback = callback
        self.loop = loop
        self.watch_patterns = watch_patterns or ['.md', '.jpg', '.png', '.gif', '.svg', '.css', '.js']
        self.pending_tasks = {}  # ファイルパス -> asyncio.Task
        self.debounce_interval = 1.0  # 1秒 debounce
    
    def should_process_file(self, file_path: str) -> bool:
        path = pathlib.Path(file_path)
        return any(file_path.endswith(pattern) for pattern in self.watch_patterns)
    
    async def debounced_callback(self, file_path: str, event_type: str):
        """debounce間隔後にコールバックを実行"""
        try:
            await asyncio.sleep(self.debounce_interval)
            await self.callback(file_path, event_type)
        except Exception as e:
            print(f"Error in debounced callback: {e}")
        finally:
            # タスク完了後にクリーンアップ
            self.pending_tasks.pop(file_path, None)
    
    def schedule_debounced_callback(self, file_path: str, event_type: str):
        if not self.loop or self.loop.is_closed():
            return
            
        # 既存のタスクがある場合はキャンセル
        if file_path in self.pending_tasks:
            old_task = self.pending_tasks[file_path]
            if not old_task.done():
                old_task.cancel()
                print(f"Cancelled previous build for: {file_path}")
        
        # 新しいタスクをスケジュール
        try:
            task = asyncio.run_coroutine_threadsafe(
                self.debounced_callback(file_path, event_type),
                self.loop
            )
            self.pending_tasks[file_path] = task
            print(f"Scheduled debounced build for: {file_path}")
        except (RuntimeError, Exception) as e:
            print(f"Error scheduling callback: {e}")
    
    def on_modified(self, event):
        if not event.is_directory and self.should_process_file(event.src_path):
            print(f"File modified: {event.src_path}")
            self.schedule_debounced_callback(event.src_path, "modified")
    
    def on_created(self, event):
        if not event.is_directory and self.should_process_file(event.src_path):
            print(f"File created: {event.src_path}")
            self.schedule_debounced_callback(event.src_path, "created")


class AsyncBuildManager:
    def __init__(self):
        self.build_count = 0
        self.current_build_task = None
        self.pending_build_params = None

    @staticmethod
    def _build_command(article_name: str, with_navigation: bool = True) -> List[str]:
        """Construct command to run build script via uv if available."""
        uv_path = shutil.which("uv")
        if uv_path:
            cmd = [uv_path, "run", "blog_builder/build.py"]
        else:
            cmd = [sys.executable, "blog_builder/build.py"]

        cmd.extend(["--article", article_name])

        if not with_navigation:
            cmd.append("--no-navigation")

        return cmd
    
    async def build_article(self, article_name: str, with_navigation: bool = False, use_fake_data: bool = False) -> Dict[str, Any]:
        build_params = {
            "article_name": article_name,
            "with_navigation": with_navigation,
            "use_fake_data": use_fake_data
        }
        
        # 既存のビルドがある場合は新しいパラメータで置き換え
        if self.current_build_task and not self.current_build_task.done():
            print(f"Replacing current build with new parameters...")
            self.pending_build_params = build_params
            return {"success": True, "message": "Build queued", "article": article_name}
        
        # 新しいビルドを開始
        self.current_build_task = asyncio.create_task(self._execute_build(**build_params))
        return await self.current_build_task
    
    async def _execute_build(self, article_name: str, with_navigation: bool = False, use_fake_data: bool = False) -> Dict[str, Any]:
        while True:
            self.build_count += 1
            build_id = self.build_count
            start_time = time.time()
            
            try:
                if use_fake_data:
                    # 偽データモード：build.pyを呼ばずに直接ファイル操作
                    print(f"Starting fake data build #{build_id} for {article_name}")
                    result = await self._build_with_fake_data(article_name, build_id)
                else:
                    # 実データモード：build.pyを呼び出し
                    cmd = self._build_command(article_name, with_navigation=with_navigation)

                    print(f"Starting build #{build_id} for {article_name}")
                    
                    # 非同期でプロセス実行
                    process = await asyncio.create_subprocess_exec(
                        *cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                        cwd=pathlib.Path.cwd()
                    )
                    
                    stdout, stderr = await process.communicate()
                    
                    build_time = time.time() - start_time
                    
                    result = {
                        "build_id": build_id,
                        "success": process.returncode == 0,
                        "build_time": build_time,
                        "stdout": stdout.decode() if stdout else "",
                        "stderr": stderr.decode() if stderr else "",
                        "article": article_name
                    }
                
                # ビルド完了後、保留中の新しいパラメータがあるかチェック
                if self.pending_build_params:
                    pending_params = self.pending_build_params
                    self.pending_build_params = None
                    print(f"Found pending build, starting with new parameters...")
                    # 新しいパラメータでビルドを継続
                    article_name = pending_params["article_name"]
                    with_navigation = pending_params["with_navigation"]
                    use_fake_data = pending_params["use_fake_data"]
                    continue
                
                return result
                
            except Exception as e:
                build_time = time.time() - start_time
                result = {
                    "build_id": build_id,
                    "success": False,
                    "build_time": build_time,
                    "error": str(e),
                    "article": article_name
                }
                
                # エラーの場合も保留中のビルドをチェック
                if self.pending_build_params:
                    pending_params = self.pending_build_params
                    self.pending_build_params = None
                    print(f"Build failed, but found pending build, retrying with new parameters...")
                    article_name = pending_params["article_name"]
                    with_navigation = pending_params["with_navigation"]
                    use_fake_data = pending_params["use_fake_data"]
                    continue
                
                return result
    
    async def _build_with_fake_data(self, article_name: str, build_id: int) -> Dict[str, Any]:
        """偽データを使ってHTMLファイルを生成する簡易ビルド"""
        start_time = time.time()
        
        try:
            # まずノーマルビルドを実行（ナビゲーション無し）
            cmd = self._build_command(article_name, with_navigation=False)
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=pathlib.Path.cwd()
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                return {
                    "build_id": build_id,
                    "success": False,
                    "build_time": time.time() - start_time,
                    "stdout": stdout.decode() if stdout else "",
                    "stderr": stderr.decode() if stderr else "",
                    "article": article_name
                }
            
            # HTMLファイルに偽データを埋め込む
            html_path = pathlib.Path("public/posts") / f"{article_name}.html"
            if html_path.exists():
                await self._inject_fake_data_to_html(html_path)
            
            build_time = time.time() - start_time
            return {
                "build_id": build_id,
                "success": True,
                "build_time": build_time,
                "stdout": stdout.decode() if stdout else "",
                "stderr": stderr.decode() if stderr else "",
                "article": article_name
            }
            
        except Exception as e:
            return {
                "build_id": build_id,
                "success": False,
                "build_time": time.time() - start_time,
                "error": str(e),
                "article": article_name
            }
    
    async def _inject_fake_data_to_html(self, html_path: pathlib.Path):
        """HTMLファイルに偽データを注入"""
        try:
            async with aiofiles.open(html_path, 'r', encoding='utf-8') as f:
                content = await f.read()
            
            # 偽ナビゲーションHTML
            fake_navigation = '''
            <div class="article-navigation">
                <div class="nav-item nav-prev">
                    <a href="/posts/prev_article.html">
                        <div class="nav-direction">← 前の記事</div>
                        <div class="nav-title">前の記事のタイトル（サンプル）</div>
                    </a>
                </div>
                <div class="nav-item nav-next">
                    <a href="/posts/next_article.html">
                        <div class="nav-direction">次の記事 →</div>
                        <div class="nav-title">次の記事のタイトル（サンプル）</div>
                    </a>
                </div>
            </div>
            '''
            
            # 偽関連記事HTML
            fake_related = '''
            <div class="related-articles tag-related">
                <h3 class="related-title">同じようなタグの記事</h3>
                <div class="related-item">
                    <a href="/posts/related1.html">
                        <div class="related-item-title">関連記事1（タグベース）</div>
                        <div class="related-date">2024-01-15</div>
                        <div class="related-tags">
                            <span class="related-tag">#Python</span>
                            <span class="related-tag">#プログラミング</span>
                        </div>
                    </a>
                </div>
                <div class="related-item">
                    <a href="/posts/related2.html">
                        <div class="related-item-title">関連記事2（タグベース）</div>
                        <div class="related-date">2024-01-10</div>
                        <div class="related-tags">
                            <span class="related-tag">#機械学習</span>
                            <span class="related-tag">#データ分析</span>
                        </div>
                    </a>
                </div>
            </div>
            <div class="related-articles tfidf-related">
                <h3 class="related-title">同じような内容の記事</h3>
                <div class="related-item">
                    <a href="/posts/related3.html">
                        <div class="related-item-title">関連記事3（内容ベース）</div>
                        <div class="related-date">2024-01-20</div>
                        <div class="related-tags">
                            <span class="related-tag">#アルゴリズム</span>
                        </div>
                    </a>
                </div>
                <div class="related-item">
                    <a href="/posts/related4.html">
                        <div class="related-item-title">関連記事4（内容ベース）</div>
                        <div class="related-date">2024-01-05</div>
                        <div class="related-tags">
                            <span class="related-tag">#開発環境</span>
                            <span class="related-tag">#ツール</span>
                        </div>
                    </a>
                </div>
            </div>
            '''
            
            # プレースホルダーを置換
            content = content.replace("{{navigation}}", fake_navigation)
            content = content.replace("{{related_articles}}", fake_related)
            content = content.replace("{{mobile_sidebar}}", "")
            content = content.replace("{{mobile_related_articles}}", "")
            
            async with aiofiles.open(html_path, 'w', encoding='utf-8') as f:
                await f.write(content)
                
        except Exception as e:
            print(f"Error injecting fake data: {e}")


class LiveReloadServer:
    def __init__(self, port: int):
        self.port = port
        self.clients: Set[aiohttp.web.WebSocketResponse] = set()
        self.app = web.Application()
        self.runner = None
        
        self.app.router.add_get('/ws', self.websocket_handler)
        self.app.router.add_get('/livereload.js', self.livereload_script)
        self.app.router.add_static('/', 'public')
    
    async def websocket_handler(self, request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        self.clients.add(ws)
        client_info = f"{request.remote}:{request.transport.get_extra_info('peername')[1] if request.transport else 'unknown'}"
        
        try:
            await self.broadcast_message({
                "type": "client_connected",
                "client": client_info,
                "total_clients": len(self.clients)
            })
            
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        await self.handle_client_message(data, ws)
                    except json.JSONDecodeError:
                        pass
                elif msg.type == WSMsgType.ERROR:
                    break
        
        finally:
            self.clients.discard(ws)
            await self.broadcast_message({
                "type": "client_disconnected", 
                "total_clients": len(self.clients)
            })
        
        return ws
    
    async def handle_client_message(self, data: Dict, ws: aiohttp.web.WebSocketResponse):
        if data.get("type") == "ping":
            await ws.send_str(json.dumps({"type": "pong"}))
    
    async def livereload_script(self, request):
        script = f"""
(function() {{
    let ws;
    let reconnectDelay = 1000;
    let maxReconnectDelay = 30000;
    
    function connect() {{
        ws = new WebSocket('ws://localhost:{self.port}/ws');
        
        ws.onopen = function() {{
            console.log('LiveReload connected');
            reconnectDelay = 1000;
        }};
        
        ws.onmessage = function(event) {{
            const data = JSON.parse(event.data);
            
            switch(data.type) {{
                case 'reload':
                    console.log('Reloading due to file changes...');
                    window.location.reload();
                    break;
                case 'build_start':
                    console.log('Build started...');
                    break;
                case 'build_complete':
                    if (data.success) {{
                        console.log(`Build completed in ${{data.build_time.toFixed(2)}}s`);
                    }} else {{
                        console.error('Build failed:', data.error);
                    }}
                    break;
            }}
        }};
        
        ws.onclose = function() {{
            console.log('LiveReload disconnected, reconnecting...');
            setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 1.5, maxReconnectDelay);
        }};
        
        ws.onerror = function(error) {{
            console.error('LiveReload error:', error);
        }};
    }}
    
    connect();
    
    // Ping every 30 seconds to keep connection alive
    setInterval(() => {{
        if (ws && ws.readyState === WebSocket.OPEN) {{
            ws.send(JSON.stringify({{type: 'ping'}}));
        }}
    }}, 30000);
}})();
"""
        return web.Response(text=script, content_type='application/javascript')
    
    async def broadcast_message(self, message: Dict):
        if not self.clients:
            return
        
        message_str = json.dumps(message)
        disconnected = set()
        
        for client in self.clients:
            try:
                await client.send_str(message_str)
            except Exception:
                disconnected.add(client)
        
        # 切断されたクライアントを削除
        self.clients -= disconnected
    
    async def start(self):
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        
        site = web.TCPSite(self.runner, 'localhost', self.port)
        await site.start()
    
    async def stop(self):
        if self.runner:
            await self.runner.cleanup()


class SimpleConsole:
    def __init__(self, article_name: str, port: int):
        self.article_name = article_name
        self.port = port
        self.builds = 0
        self.build_time_total = 0
        
    def print_header(self):
        print(f"\nLive Reload System")
        print(f"Article: {self.article_name} | Port: {self.port}")
        print("-" * 50)
        
    def add_build_result(self, result: Dict):
        self.builds += 1
        build_time = result.get("build_time", 0.0)
        self.build_time_total += build_time
        
        status = "OK" if result.get("success", False) else "FAIL"
        avg_time = self.build_time_total / self.builds
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Build #{self.builds}: {status} ({build_time:.2f}s, avg: {avg_time:.2f}s)")
        
        if not result.get("success", False):
            error = result.get("error", result.get("stderr", "Unknown error"))
            print(f"Error: {error}")
    
    def stop(self):
        print("\nSystem stopped.")


class ArticleSelector:
    def select_article(self) -> Optional[str]:
        print("\n記事を選択してください:")
        print("-" * 40)
        
        changed = GitHelper.get_changed_articles()
        recent = GitHelper.get_recent_articles()
        
        options = []
        
        if changed:
            print("\n変更された記事:")
            for article in changed:
                print(f"  {len(options) + 1}. {article['name']} ({article['status']})")
                options.append(article["name"])
        
        if recent:
            print("\n最近編集した記事:")
            recent_count = 0
            for article in recent:
                if article["name"] not in [opt for opt in options]:
                    print(f"  {len(options) + 1}. {article['name']} (recent)")
                    options.append(article["name"])
                    recent_count += 1
                    if recent_count >= 3:
                        break
        
        if not options:
            print("変更された記事が見つかりません。")
            return None
        
        print(f"\n  {len(options) + 1}. 終了")
        
        try:
            choice = input("\n番号を選択: ")
            if not choice.isdigit():
                return None
            
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                selected = options[idx]
                print(f"選択: {selected}")
                return selected
            else:
                return None
                
        except (KeyboardInterrupt, EOFError):
            return None


def find_free_port(start_port: int = 8000) -> int:
    for port in range(start_port, start_port + 100):
        try:
            # ポートが使用されているかチェック
            for conn in psutil.net_connections():
                if conn.laddr.port == port:
                    break
            else:
                return port
        except Exception:
            continue
    return start_port  # fallback


def generate_qr_code(url: str):
    try:
        qr = qrcode.QRCode(version=1, box_size=1, border=1)
        qr.add_data(url)
        qr.make(fit=True)
        
        print("\nQR Code for mobile access:")
        qr.print_ascii(out=None, tty=True, invert=True)
        print(f"URL: {url}\n")
    except Exception:
        pass


class LiveWatcher:
    def __init__(self, article_name: str, port: int = None, with_navigation: bool = False, use_fake_data: bool = True, auto_reload: bool = False):
        self.article_name = article_name
        self.with_navigation = with_navigation
        self.use_fake_data = use_fake_data
        self.auto_reload = auto_reload
        self.port = port or find_free_port()
        
        self.console_ui = SimpleConsole(article_name, self.port)
        print("🎨 Design preview mode: Using fake data for navigation and related articles")
        self.build_manager = AsyncBuildManager()
        self.live_server = LiveReloadServer(self.port)
        
        # ファイル監視設定
        self.observer = Observer()
        self.file_handler = SmartFileWatcher(self.on_file_changed, loop=None)  # loopは後で設定
        
        # 監視対象パス
        self.article_path = pathlib.Path("posts") / f"{article_name}.md"
        self.asset_dir = pathlib.Path("posts") / article_name
        
        # 状態管理
        self.running = False
        self.startup_complete = False
        
        # ホットキー処理
        self.setup_signal_handlers()
    
    def setup_signal_handlers(self):
        """シグナルハンドラー設定"""
        def signal_handler(signum, frame):
            print(f"\nReceived signal {signum}, shutting down...")
            self.running = False
            # イベントループが実行中の場合、シャットダウンタスクを作成
            try:
                loop = asyncio.get_running_loop()
                if loop and not loop.is_closed():
                    # 新しいタスクでシャットダウンを実行
                    asyncio.create_task(self.force_shutdown())
            except RuntimeError:
                # イベントループが実行されていない場合は何もしない
                pass
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def force_shutdown(self):
        """強制シャットダウン用のヘルパー"""
        await asyncio.sleep(0.1)  # 短い遅延を入れる
        await self.shutdown()
    
    async def on_file_changed(self, file_path: str, event_type: str):
        print(f"File changed: {file_path} ({event_type})")
        
        if not self.startup_complete:
            return
        
        # ビルド開始通知
        await self.live_server.broadcast_message({
            "type": "build_start",
            "file": file_path,
            "event": event_type
        })
        
        # ビルド実行
        try:
            result = await self.build_manager.build_article(
                self.article_name, 
                self.with_navigation,
                self.use_fake_data
            )
            
            # 結果の検証
            if not isinstance(result, dict):
                result = {
                    "success": False,
                    "build_time": 0.0,
                    "error": "Invalid build result format",
                    "article": self.article_name
                }
        except Exception as e:
            print(f"Build error: {e}")
            result = {
                "success": False,
                "build_time": 0.0,
                "error": str(e),
                "article": self.article_name
            }
        
        self.console_ui.add_build_result(result)
        
        await self.live_server.broadcast_message({
            "type": "build_complete",
            "success": result.get("success", False),
            "build_time": result.get("build_time", 0.0),
            "error": result.get("error", result.get("stderr", ""))
        })
        
        if result["success"] and self.auto_reload:
            # ライブリロードスクリプトを再注入
            await self.inject_livereload_script()
            
            # クライアント数を確認
            client_count = len(self.live_server.clients)
            print(f"Sending reload to {client_count} clients")
            
            await self.live_server.broadcast_message({"type": "reload"})
        elif result["success"] and not self.auto_reload:
            print("Build successful. Auto-reload is disabled. Manually refresh browser to see changes.")
    
    def setup_file_watching(self):
        watch_paths = []
        
        # メイン記事ファイル
        if self.article_path.exists():
            watch_paths.append(self.article_path.parent)
        
        # アセットディレクトリ
        if self.asset_dir.exists():
            watch_paths.append(self.asset_dir)
        
        for path in watch_paths:
            self.observer.schedule(self.file_handler, str(path), recursive=True)
        
        print(f"Watching {len(watch_paths)} directories")
    
    async def initial_build(self):
        print("Initial build...")
        
        result = await self.build_manager.build_article(
            self.article_name,
            self.with_navigation,
            self.use_fake_data
        )
        
        self.console_ui.add_build_result(result)
        
        if not result["success"]:
            print(f"Initial build failed: {result.get('error', 'Unknown error')}")
            return False
        
        return True
    
    async def inject_livereload_script(self):
        try:
            html_path = pathlib.Path("public/posts") / f"{self.article_name}.html"
            if not html_path.exists():
                return
            
            async with aiofiles.open(html_path, 'r', encoding='utf-8') as f:
                content = await f.read()
            
            # スクリプト注入
            script_tag = f'<script src="http://localhost:{self.port}/livereload.js"></script>'
            
            if script_tag not in content:
                if '</head>' in content:
                    content = content.replace('</head>', f'  {script_tag}\n</head>')
                elif '</body>' in content:
                    content = content.replace('</body>', f'  {script_tag}\n</body>')
                else:
                    content += f'\n{script_tag}'
                
                async with aiofiles.open(html_path, 'w', encoding='utf-8') as f:
                    await f.write(content)
        
        except Exception as e:
            print(f"Error injecting livereload script: {e}")
    
    async def start(self):
        self.running = True
        
        # イベントループを設定
        self.file_handler.loop = asyncio.get_running_loop()
        
        # UI初期化
        self.console_ui.print_header()
        
        try:
            # 記事ファイル存在確認
            if not self.article_path.exists():
                print(f"Article not found: {self.article_path}")
                return
            
            # 初回ビルド
            if not await self.initial_build():
                return
            
            # ライブリロードスクリプト注入
            await self.inject_livereload_script()
            
            # サーバー開始
            await self.live_server.start()
            
            # ファイル監視開始
            self.setup_file_watching()
            self.observer.start()
            
            # ブラウザを開く
            url = f"http://localhost:{self.port}/posts/{self.article_name}.html"
            webbrowser.open(url)
            
            # QRコード表示
            generate_qr_code(url)
            
            self.startup_complete = True
            
            # メインループ
            print("Press Ctrl+C to stop the server...")
            try:
                while self.running:
                    await asyncio.sleep(0.5)
            except KeyboardInterrupt:
                print("\nKeyboard interrupt received in main loop, shutting down...")
                self.running = False
            except asyncio.CancelledError:
                print("\nAsyncio task cancelled, shutting down...")
                self.running = False
        
        finally:
            await self.shutdown()
    
    async def shutdown(self):
        if not self.running:
            return  # 既にシャットダウン処理中
            
        print("Shutting down systems...")
        self.running = False
        
        try:
            # ビルド中のタスクをキャンセル
            if (hasattr(self.build_manager, 'current_build_task') and 
                self.build_manager.current_build_task and 
                not self.build_manager.current_build_task.done()):
                print("Cancelling current build...")
                self.build_manager.current_build_task.cancel()
                try:
                    await self.build_manager.current_build_task
                except asyncio.CancelledError:
                    pass
            
            # ファイル監視停止
            if hasattr(self, 'observer') and self.observer.is_alive():
                print("Stopping file observer...")
                self.observer.stop()
                # ノンブロッキングで待機
                try:
                    self.observer.join(timeout=1)
                except:
                    pass
            
            # サーバー停止
            if hasattr(self, 'live_server'):
                print("Stopping live server...")
                await self.live_server.stop()
                
        except Exception as e:
            print(f"Error during shutdown: {e}")
        
        print("System stopped.")


@click.command()
@click.argument('article', required=False)
@click.option('--port', '-p', type=int, help='ポート番号 (自動検出)')
@click.option('--navigation', '-n', is_flag=True, help='ナビゲーション有効化 (重い)')
@click.option('--auto-reload', '-r', is_flag=True, help='自動リロード有効化 (デフォルト: 無効)')
@click.option('--help-extended', is_flag=True, help='詳細ヘルプ表示')
def main(article, port, navigation, auto_reload, help_extended):
    if help_extended:
        print("ライブリロードシステム")
        print("主な機能:")
        print("- リアルタイムファイル監視")
        print("- WebSocketベースのライブリロード")
        print("- 非同期ビルド処理")
        print("使用例:")
        print("  uv run blog_builder/watch.py                    # インタラクティブ選択")
        print("  uv run blog_builder/watch.py my_article         # 記事指定（偽データ）")
        print("  uv run blog_builder/watch.py my_article -n      # ナビゲーション有効")
        print("  uv run blog_builder/watch.py my_article -r      # 自動リロード有効")
        print("  uv run blog_builder/watch.py my_article -n -r   # 全機能有効")
        return
    
    # 記事選択
    if not article:
        selector = ArticleSelector()
        article = selector.select_article()
        if not article:
            return
    
    # 記事ファイル確認
    article_path = pathlib.Path("posts") / f"{article}.md"
    if not article_path.exists():
        print(f"Article not found: {article_path}")
        return
    
    # システム開始
    watcher = None
    try:
        watcher = LiveWatcher(
            article_name=article,
            port=port,
            with_navigation=navigation,
            use_fake_data=True,  # watch時は常に偽データ
            auto_reload=auto_reload
        )
        
        asyncio.run(watcher.start())
        
    except KeyboardInterrupt:
        print("\nKeyboard interrupt in main, shutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if watcher:
            print("Final cleanup...")
            # 同期的にクリーンアップ
            if hasattr(watcher, 'observer') and watcher.observer.is_alive():
                watcher.observer.stop()
                watcher.observer.join(timeout=0.5)
        print("Exiting...")


if __name__ == "__main__":
    main()
