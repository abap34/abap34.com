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
        let scaledParticleRadius = 1.8;

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
            scaledParticleRadius = 1.8 * sizeScaleFactor;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // パーティクルの設定
        const BASE_PARTICLE_COUNT = 350;
        // 画面サイズに応じた粒子数を計算（最小100、最大1000）
        const PARTICLE_COUNT = Math.max(100, Math.min(1000, Math.floor(BASE_PARTICLE_COUNT * sizeScaleFactor)));
        const PARTICLE_TYPES = 3;
        const FRICTION = 0.88;
        const TIME_SCALE = 0.8;
        const STRETCH_STIFFNESS = 0.16;
        const STRETCH_DAMPING = 0.58;
        const MAX_STRETCH_BASE = 150;
        const STRETCH_SHIFT_FACTOR = 0.85;
        const STRETCH_ELONGATION = 4.3;
        const TAIL_RADIUS_FACTOR = 0.85;
        const FORCE_SCALE = 0.65;

        // 色の設定（ダークモード専用）
        const colors = [
            'rgba(186, 194, 222, 0.7)',  // foreground1
            'rgba(180, 190, 254, 0.7)',  // accent1
            'rgba(148, 226, 213, 0.7)'   // accent2
        ];

        const glowColors = [
            'rgba(235, 238, 255, 1)',
            'rgba(216, 224, 255, 1)',
            'rgba(198, 245, 233, 1)'
        ];

        const adjustAlpha = (color, alpha) => color.replace(/[\d.]+\)$/g, `${alpha})`);

        const BASE_PARTICLE_RADIUS = 1.9;

        const gradientCache = colors.map((color, type) => {
            const radius = BASE_PARTICLE_RADIUS * 4.8;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0.0, adjustAlpha(glowColors[type], 1));
            gradient.addColorStop(0.2, adjustAlpha(glowColors[type], 0.85));
            gradient.addColorStop(0.45, adjustAlpha(color, 0.65));
            gradient.addColorStop(0.72, adjustAlpha(color, 0.28));
            gradient.addColorStop(1, adjustAlpha(color, 0));
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

        const wrapDelta = (target, current, max) => {
            let delta = target - current;
            if (delta > max / 2) delta -= max;
            if (delta < -max / 2) delta += max;
            return delta;
        };

        // パーティクルクラス
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = 0;
                this.vy = 0;
                this.type = Math.floor(Math.random() * PARTICLE_TYPES);
                this.renderX = this.x;
                this.renderY = this.y;
                this.renderVX = 0;
                this.renderVY = 0;
                this.stretchVectorX = 0;
                this.stretchVectorY = 0;
                this.squish = 0;
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
                                const force = forceFunction(distance, a) * FORCE_SCALE;

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

                // 画面上での表示位置はターゲット位置をスプリングで追従させ、餅のように伸びる感覚を出す
                const dxToTarget = wrapDelta(this.x, this.renderX, canvas.width);
                const dyToTarget = wrapDelta(this.y, this.renderY, canvas.height);
                this.renderVX = (this.renderVX + dxToTarget * STRETCH_STIFFNESS) * STRETCH_DAMPING;
                this.renderVY = (this.renderVY + dyToTarget * STRETCH_STIFFNESS) * STRETCH_DAMPING;
                this.renderX = (this.renderX + this.renderVX + canvas.width) % canvas.width;
                this.renderY = (this.renderY + this.renderVY + canvas.height) % canvas.height;
                this.stretchVectorX = wrapDelta(this.x, this.renderX, canvas.width);
                this.stretchVectorY = wrapDelta(this.y, this.renderY, canvas.height);

                const stretchMagnitude = Math.sqrt(this.stretchVectorX * this.stretchVectorX + this.stretchVectorY * this.stretchVectorY);
                const normalizedStretch = Math.min(1, stretchMagnitude / (MAX_STRETCH_BASE * sizeScaleFactor));
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const targetSquish = Math.min(1.35, normalizedStretch * 1.05 + speed * 0.45);
                this.squish += (targetSquish - this.squish) * 0.15;
            }

            draw(ctx, frameCount) {
                const pattern = blinkPatterns[this.type];
                let blinkIntensity = 1.0;

                if (pattern.enabled) {
                    blinkIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frameCount * pattern.speed));
                }

                const stretchDx = this.stretchVectorX;
                const stretchDy = this.stretchVectorY;
                const stretchDistance = Math.sqrt(stretchDx * stretchDx + stretchDy * stretchDy);
                const maxStretch = MAX_STRETCH_BASE * sizeScaleFactor;
                const clampedStretch = Math.min(stretchDistance, maxStretch);
                const normalizedStretch = clampedStretch / maxStretch;
                const hasStretch = stretchDistance > 0.001;
                const squish = this.squish;
                const baseRadius = BASE_PARTICLE_RADIUS * 2.5;
                const headRadiusX = baseRadius * (1 + normalizedStretch * STRETCH_ELONGATION + squish * 0.7);
                const headRadiusY = baseRadius * Math.max(0.18, 1 - normalizedStretch * 0.55 - squish * 0.35);
                const tailRadius = baseRadius * (0.7 + normalizedStretch * 1.45 + squish * 0.65) * TAIL_RADIUS_FACTOR;
                const stretchOffset = normalizedStretch * STRETCH_SHIFT_FACTOR * scaledMaxDistance * 0.2 + squish * 6 * sizeScaleFactor;
                const tailOffset = -Math.min(clampedStretch * (1.05 + squish * 0.2), scaledMaxDistance * 0.65);
                const headOffset = hasStretch ? stretchOffset : 0;
                const angle = hasStretch ? Math.atan2(stretchDy, stretchDx) : 0;

                ctx.save();
                ctx.translate(this.renderX, this.renderY);
                if (hasStretch) {
                    ctx.rotate(angle);
                }
                ctx.scale(sizeScaleFactor, sizeScaleFactor);
                ctx.fillStyle = gradientCache[this.type];
                ctx.globalAlpha = blinkIntensity;

                const eccentricity = normalizedStretch + squish * 0.45;
                const ellipseRadiusX = baseRadius * (1 + eccentricity * STRETCH_ELONGATION);
                const ellipseRadiusY = baseRadius * Math.max(0.2, 1 - eccentricity * 0.6);
                ctx.beginPath();
                ctx.ellipse(
                    hasStretch ? (headOffset + tailOffset) * 0.5 : 0,
                    0,
                    ellipseRadiusX,
                    ellipseRadiusY,
                    0,
                    0,
                    Math.PI * 2
                );
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
