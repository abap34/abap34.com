import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ParticleLife.css';

const ParticleLife = () => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const { isDark } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // ダークモードでない場合はキャンバスをクリアして終了
        if (!isDark) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Canvas サイズを設定
        let sizeScaleFactor = 1.0;
        let scaledMaxDistance = 100;
        let scaledMaxDistanceSq = 10000;
        let scaledRMin = 8;
        let scaledGridSize = 100;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 画面サイズに応じたスケーリング係数を計算
            // 基準サイズ: 1920x1080
            const baseWidth = 1920;
            const baseHeight = 1080;
            const baseArea = baseWidth * baseHeight;
            const currentArea = canvas.width * canvas.height;

            // 面積の比の平方根でスケーリング（線形に近い効果）
            sizeScaleFactor = Math.sqrt(currentArea / baseArea);

            // 距離パラメータもスケーリング
            scaledMaxDistance = 100 * sizeScaleFactor;
            scaledMaxDistanceSq = scaledMaxDistance * scaledMaxDistance;
            scaledRMin = 8 * sizeScaleFactor;
            scaledGridSize = scaledMaxDistance;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // パーティクルの設定
        const BASE_PARTICLE_COUNT = 350;
        // 画面サイズに応じた粒子数を計算（最小100、最大1000）
        const PARTICLE_COUNT = Math.max(100, Math.min(1000, Math.floor(BASE_PARTICLE_COUNT * sizeScaleFactor)));
        const PARTICLE_TYPES = 3;
        const PARTICLE_RADIUS = 1.8;
        const FRICTION = 0.88;
        const TIME_SCALE = 0.8;

        // 色の設定（ダークモード専用）
        const colors = [
            'rgba(186, 194, 222, 0.7)',  // foreground1
            'rgba(180, 190, 254, 0.7)',  // accent1
            'rgba(148, 226, 213, 0.7)'   // accent2
        ];

        // グローエフェクト用の色
        const glowColors = [
            'rgba(186, 194, 222, 1.0)',
            'rgba(180, 190, 254, 1.0)',
            'rgba(148, 226, 213, 1.0)'
        ];

        // グラデーションをキャッシュ
        const gradientCache = colors.map((color, type) => {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, PARTICLE_RADIUS * 3.5);
            gradient.addColorStop(0, glowColors[type]);
            gradient.addColorStop(0.15, glowColors[type]);
            gradient.addColorStop(0.35, color);
            gradient.addColorStop(0.7, colors[type].replace(/[\d.]+\)$/g, '0.15)'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            return gradient;
        });

        // 生物的パターンを生成する非対称なルール
        const rules = Array(PARTICLE_TYPES).fill(0).map((_, i) =>
            Array(PARTICLE_TYPES).fill(0).map((_, j) => {
                if (i === j) {
                    return (Math.random() - 0.5) * 0.3;
                } else {
                    const baseForce = Math.random() - 0.5;
                    const asymmetry = Math.random() * 0.4;
                    return baseForce * 0.8 + (i > j ? asymmetry : -asymmetry);
                }
            })
        );

        // 特定の興味深いパターンを促進するための調整
        rules[0][1] = 0.5;
        rules[1][0] = -0.3;
        rules[1][2] = 0.4;
        rules[2][1] = 0.2;
        rules[2][0] = -0.2;
        rules[0][2] = 0.1;

        // Particle Life標準の力関数
        const forceFunction = (r, a) => {
            if (r < scaledRMin) {
                return (r / scaledRMin - 1) * 1.2;
            } else if (r < scaledMaxDistance) {
                const beta = 0.4;
                const smoothFactor = 1 - Math.abs(2 * r / scaledMaxDistance - 1 - beta) / (1 - beta);
                return a * smoothFactor * (1 - (r / scaledMaxDistance) * 0.2);
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

                const gridX = Math.floor(this.x / scaledGridSize);
                const gridY = Math.floor(this.y / scaledGridSize);

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

                            if (distanceSq > 0 && distanceSq < scaledMaxDistanceSq) {
                                const distance = Math.sqrt(distanceSq);
                                const a = rules[this.type][other.type];
                                const force = forceFunction(distance, a);

                                if (distance > 0.01) {
                                    const strength = force / distance;
                                    fx += strength * dx_dist;
                                    fy += strength * dy_dist;
                                }
                            }
                        }
                    }
                }

                // 停滞を防ぐ弱い力場を追加
                const t = frameCount * 0.005;
                const flowStrength = 0.012;
                const flowX = Math.sin(this.y * 0.003 + t) * Math.cos(this.x * 0.002 + t * 0.7);
                const flowY = Math.cos(this.x * 0.003 + t) * Math.sin(this.y * 0.002 + t * 0.7);
                fx += flowX * flowStrength;
                fy += flowY * flowStrength;

                // 小さなランダムノイズを追加
                fx += (Math.random() - 0.5) * 0.003;
                fy += (Math.random() - 0.5) * 0.003;

                // 画面サイズに応じたスケーリングを適用
                fx *= sizeScaleFactor;
                fy *= sizeScaleFactor;

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
                const pattern = blinkPatterns[this.type];
                let blinkIntensity = 1.0;

                if (pattern.enabled) {
                    blinkIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frameCount * pattern.speed));
                }

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.globalAlpha = blinkIntensity;

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
                const gridX = Math.floor(particle.x / scaledGridSize);
                const gridY = Math.floor(particle.y / scaledGridSize);
                const key = `${gridX},${gridY}`;
                if (!grid[key]) grid[key] = [];
                grid[key].push(particle);
            }
            return grid;
        };

        // 点滅パターンの設定
        const blinkPatterns = [
            { enabled: false, speed: 0 },
            { enabled: true, speed: 0.03 },
            { enabled: true, speed: 0.05 }
        ];

        let frameCount = 0;

        // アニメーションループ
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const grid = buildGrid();

            for (const particle of particles) {
                particle.update(particles, grid, frameCount);
                particle.draw(ctx, frameCount);
            }

            frameCount++;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // クリーンアップ
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isDark]); // isDarkが変わったら再実行

    return (
        <canvas
            ref={canvasRef}
            className="particle-life-canvas"
        />
    );
};

export default ParticleLife;
