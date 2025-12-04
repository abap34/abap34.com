import { useEffect, useRef } from 'react';
import './ParticleLife.css';

const ParticleLife = () => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let isRunning = false;

        // ダークモードかどうかをチェック
        const checkDarkMode = () => {
            return document.documentElement.getAttribute('data-webtui-theme') === 'catppuccin-mocha';
        };

        // 初期チェック
        if (!checkDarkMode()) {
            return;
        }

        isRunning = true;

        // Canvas サイズを設定
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // パーティクルの設定
        const PARTICLE_COUNT = 350;  // 粒子数を増やす
        const PARTICLE_TYPES = 3;
        const PARTICLE_RADIUS = 1.8;  // 粒子を小さく
        const MAX_DISTANCE = 100;  // 相互作用距離を広げて複雑なパターンを促進
        const MAX_DISTANCE_SQ = MAX_DISTANCE * MAX_DISTANCE;  // 距離の二乗（sqrt回避用）
        const RMIN = 8;  // 最小距離を広げて斥力が働く範囲を拡大
        const FRICTION = 0.88;  // 摩擦を少し下げて動きを活発に
        const TIME_SCALE = 0.8;  // 世界の進みを遅くする（0.8倍速）
        const GRID_SIZE = MAX_DISTANCE;

        // 色の設定（ダークモード専用）
        const colors = [
            'rgba(186, 194, 222, 0.7)',  // foreground1
            'rgba(180, 190, 254, 0.7)',  // accent1
            'rgba(148, 226, 213, 0.7)'   // accent2
        ];

        // グローエフェクト用の色（より明るく強く）
        const glowColors = [
            'rgba(186, 194, 222, 1.0)',
            'rgba(180, 190, 254, 1.0)',
            'rgba(148, 226, 213, 1.0)'
        ];

        // グラデーションをキャッシュ（毎フレーム作成すると重い）
        const gradientCache = colors.map((color, type) => {
            // グロー範囲を大きくして光を強調
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, PARTICLE_RADIUS * 3.5);
            // 滑らかなグラデーションで中心から外側へ自然に薄くなる
            gradient.addColorStop(0, glowColors[type]);
            gradient.addColorStop(0.15, glowColors[type]);
            gradient.addColorStop(0.35, color);
            gradient.addColorStop(0.7, colors[type].replace(/[\d.]+\)$/g, '0.15)'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            return gradient;
        });

        // 生物的パターンを生成する非対称なルール
        // 研究によると、非対称な相互作用がより興味深いパターンを生む
        const rules = Array(PARTICLE_TYPES).fill(0).map((_, i) =>
            Array(PARTICLE_TYPES).fill(0).map((_, j) => {
                if (i === j) {
                    // 同種間: 弱い引力か弱い斥力
                    return (Math.random() - 0.5) * 0.3;
                } else {
                    // 異種間: より強い非対称な相互作用
                    // 例: 青が緑を引き付けるが、緑は青を反発する
                    const baseForce = Math.random() - 0.5;
                    const asymmetry = Math.random() * 0.4;
                    return baseForce * 0.8 + (i > j ? asymmetry : -asymmetry);
                }
            })
        );

        // 特定の興味深いパターンを促進するための調整
        // タイプ0がタイプ1を追いかける
        rules[0][1] = 0.5;   // タイプ0はタイプ1に引き付けられる
        rules[1][0] = -0.3;  // タイプ1はタイプ0から逃げる
        // タイプ1とタイプ2の相互作用
        rules[1][2] = 0.4;   // タイプ1はタイプ2に引き付けられる
        rules[2][1] = 0.2;   // タイプ2もタイプ1に引き付けられる（弱く）
        // タイプ2とタイプ0の相互作用
        rules[2][0] = -0.2;  // タイプ2はタイプ0を避ける
        rules[0][2] = 0.1;   // タイプ0はタイプ2に弱く引き付けられる

        // Particle Life標準の力関数（生物的パターン用に調整）
        const forceFunction = (r, a) => {
            if (r < RMIN) {
                // 近距離での斥力（線形）- 強めの斥力
                return (r / RMIN - 1) * 1.2;
            } else if (r < MAX_DISTANCE) {
                // 相互作用力（山型の関数）
                // betaを調整して、力のピーク位置を変える
                const beta = 0.4;  // 0.3 -> 0.4 でより広い範囲で力が働く
                const smoothFactor = 1 - Math.abs(2 * r / MAX_DISTANCE - 1 - beta) / (1 - beta);
                // 力を滑らかにするための追加項
                return a * smoothFactor * (1 - (r / MAX_DISTANCE) * 0.2);
            }
            return 0;
        };

        // パーティクルクラス
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = 0;
                this.vy = 0;
                this.type = Math.floor(Math.random() * PARTICLE_TYPES);
            }

            update(particles, grid, frameCount) {
                let fx = 0;
                let fy = 0;

                // グリッドベースの近傍探索
                const gridX = Math.floor(this.x / GRID_SIZE);
                const gridY = Math.floor(this.y / GRID_SIZE);

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const key = `${gridX + dx},${gridY + dy}`;
                        const neighbors = grid[key];
                        if (!neighbors) continue;

                        for (const other of neighbors) {
                            if (other === this) continue;

                            const dx_dist = other.x - this.x;
                            const dy_dist = other.y - this.y;
                            const distanceSq = dx_dist * dx_dist + dy_dist * dy_dist;

                            // sqrt回避: 距離の二乗で比較
                            if (distanceSq > 0 && distanceSq < MAX_DISTANCE_SQ) {
                                const distance = Math.sqrt(distanceSq);
                                const a = rules[this.type][other.type];
                                const force = forceFunction(distance, a);

                                // 力を距離で正規化して方向ベクトルに適用
                                if (distance > 0.01) {  // ゼロ除算を回避
                                    const strength = force / distance;
                                    fx += strength * dx_dist;
                                    fy += strength * dy_dist;
                                }
                            }
                        }
                    }
                }

                // 停滞を防ぐ弱い力場を追加（時間で変化）
                const t = frameCount * 0.005;
                const flowStrength = 0.012;
                const flowX = Math.sin(this.y * 0.003 + t) * Math.cos(this.x * 0.002 + t * 0.7);
                const flowY = Math.cos(this.x * 0.003 + t) * Math.sin(this.y * 0.002 + t * 0.7);
                fx += flowX * flowStrength;
                fy += flowY * flowStrength;

                // 小さなランダムノイズを追加（完全な停滞を防ぐ）
                fx += (Math.random() - 0.5) * 0.003;
                fy += (Math.random() - 0.5) * 0.003;

                this.vx = (this.vx + fx * TIME_SCALE) * FRICTION;
                this.vy = (this.vy + fy * TIME_SCALE) * FRICTION;

                this.x += this.vx * TIME_SCALE;
                this.y += this.vy * TIME_SCALE;

                // 画面端での折り返し
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw(ctx, frameCount) {
                // 点滅の計算
                const pattern = blinkPatterns[this.type];
                let blinkIntensity = 1.0;

                if (pattern.enabled) {
                    // サイン波で滑らかに点滅（0.4〜1.0の範囲）
                    blinkIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frameCount * pattern.speed));
                }

                // キャッシュされたグラデーションを使用（座標変換で対応）
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.globalAlpha = blinkIntensity;

                // グローエフェクト（グラデーションのみで滑らかに）
                ctx.fillStyle = gradientCache[this.type];
                ctx.beginPath();
                ctx.arc(0, 0, PARTICLE_RADIUS * 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // パーティクルの初期化
        const particles = Array(PARTICLE_COUNT).fill(0).map(() => new Particle());

        // グリッドの構築
        const buildGrid = () => {
            const grid = {};
            for (const particle of particles) {
                const gridX = Math.floor(particle.x / GRID_SIZE);
                const gridY = Math.floor(particle.y / GRID_SIZE);
                const key = `${gridX},${gridY}`;
                if (!grid[key]) grid[key] = [];
                grid[key].push(particle);
            }
            return grid;
        };

        // 点滅パターンの設定（種類ごと）
        const blinkPatterns = [
            { enabled: false, speed: 0 },           // タイプ0: 点滅なし
            { enabled: true, speed: 0.03 },         // タイプ1: ゆっくり点滅
            { enabled: true, speed: 0.05 }          // タイプ2: 速めに点滅
        ];

        let frameCount = 0;

        // アニメーションループ
        const animate = () => {
            if (!isRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // グリッドを再構築
            const grid = buildGrid();

            // 更新と描画
            for (const particle of particles) {
                particle.update(particles, grid, frameCount);
                particle.draw(ctx, frameCount);
            }

            frameCount++;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // テーマ変更を監視
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-webtui-theme') {
                    const isDark = checkDarkMode();
                    if (isDark && !isRunning) {
                        // ダークモードに切り替わった - アニメーション開始
                        isRunning = true;
                        animate();
                    } else if (!isDark && isRunning) {
                        // ライトモードに切り替わった - アニメーション停止
                        isRunning = false;
                        if (animationFrameRef.current) {
                            cancelAnimationFrame(animationFrameRef.current);
                        }
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-webtui-theme']
        });

        animate();

        // クリーンアップ
        return () => {
            isRunning = false;
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="particle-life-canvas"
        />
    );
};

export default ParticleLife;
