import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScrollBlurBottom from './components/ScrollBlurBottom';

const DRAG_IMAGES = [
    {
        src: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/4DZJKMDEF8RDH0BD3ZFTRR1PST.png",
        alt: "Noodles illustration",
        className: "hero-image hero-image-1",
        label: "I looove Chinese food",
    },
    {
        src: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/260CW9B8HFWGRKXEZGXPX0F739.png",
        alt: "Gran Canaria photo",
        className: "hero-image hero-image-2",
        label: "Gran Canaria, a place that felt like home",
    },
    {
        src: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/00SN5DY5217V1VGSB2EY6DKNHV.jpg",
        alt: "Bicycle photo",
        className: "hero-image hero-image-3",
        label: "My yellow bicicle that helped me move around",
    },
    {
        src: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/6ECYAABTJKA0RHDVWW9M95PE0S.png",
        alt: "Horse silhouette",
        className: "hero-image hero-image-4",
        label: "My favorite friend",
    },
    {
        src: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/116K5WXNF8ZWH4KQ7KPVYK1SYA.jpg",
        alt: "Sea photo",
        className: "hero-image hero-image-5",
        label: "Formentera, an island that changed me",
    },
    {
        isVinylPlayer: true,
        className: "hero-image hero-image-6",
        label: "Play The Mountain Piano Documentary",
    },
];

const WORK_ITEMS = [
    {
        id: "transfermarkt",
        isMockupCard: true,
        category: "Website redesign",
        title: "TRANSFERMARKT REDESIGNED",
        subtitle: "Less searching. More discovering. A complet UX rethink of the world's most iconic football database.",
        buttonText: "View project",
        bgImage: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/01KYS4DH7C1CD9HGJ0DKS2F0MH.png",
        videoUrl: "/assets/transfermarkt_video.mp4",
        boxShadow: "0px 30px 40px rgba(0, 109, 241, 0.74) inset, 3px 10px 20px rgba(255, 255, 255, 0.5)",
        description: "Less searching. More discovering. A complet UX rethink of the world's most iconic football database.",
    },
    {
        id: "breathe",
        isMockupCard: true,
        category: "Wellness app",
        title: "the breathe app",
        subtitle: "A meditation app designed to bring you back to your breath, instantly and effortlessly.",
        buttonText: "View project",
        bgImage: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/01KYS47TEGFNZK9063DKBT6JFE.png",
        videoUrl: "/assets/breathe_video.mp4",
        boxShadow: "0px 30px 40px rgba(124, 14, 144, 0.3) inset, 3px 10px 20px rgba(255, 255, 255, 0.5)",
        introText: "A calm digital sanctuary, designed for a world that rarely slows down. Breathe invites people to pause, even just for a moment, and reconnect with themselves — one breath at a time.",
        description: "A calm digital sanctuary, designed for a world that rarely slows down. Breathe invites people to pause, even just for a moment, and reconnect with themselves — one breath at a time.",
    },
    {
        id: "reveal",
        isMockupCard: true,
        category: "Interactive design",
        title: "Burn to Reveal",
        subtitle: "A fun and interactive website that lets you discover and explore written content in unique and creative ways.",
        buttonText: "View project",
        bgImage: "https://app.paper.design/file-assets/01KY4X3C4M5YQAKN37W0653780/01KYS4JPHK95SB2XYA5ZHH97PW.png",
        videoUrl: "/assets/reveal_video.mp4",
        boxShadow: "3px 10px 20px rgba(255, 255, 255, 0.5)",
        introText: "After presenting more structured case studies, I wanted to include something different, something that reflects another side of digital design that I deeply enjoy: creativity, experimentation, and play.\n\nThis project transforms the way users discover content. Instead of simply reading through a page, users reveal information by moving a candle across the screen, creating a more interactive and engaging experience. It explores how small, unexpected interactions can strengthen the connection between people and digital products, turning navigation into discovery.\n\nFor me, great design is not only about solving problems, it’s also about daring to create memorable experiences.",
        liveUrl: "https://adventurous-app-059676.framer.app",
        description: "After presenting more structured case studies, I wanted to include something different, something that reflects another side of digital design that I deeply enjoy: creativity, experimentation, and play. This project transforms the way users discover content. Instead of simply reading through a page, users reveal information by moving a candle across the screen, creating a more interactive and engaging experience. It explores how small, unexpected interactions can strengthen the connection between people and digital products, turning navigation into discovery. For me, great design is not only about solving problems, it’s also about daring to create memorable experiences.",
    },
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

class DissolveCard {
  constructor(canvas, img, opts = {}) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.img      = img;

    this.cardW        = opts.width  ?? 300;
    this.cardH        = opts.height ?? 260;
    this.radius       = opts.radius ?? 14;
    this.spray        = opts.spray  ?? 90;
    this.edgeZone     = opts.edgeZone ?? 0.35;
    this.sampleStep   = opts.sampleStep ?? 2;  
    this.density      = opts.density ?? 0.65;  
    this.dissolveLeft  = opts.dissolveLeft ?? true;
    this.dissolveRight = opts.dissolveRight ?? true;
    this.dpr          = Math.min(window.devicePixelRatio || 1, 2);

    this.particles    = [];
    this.animId       = null;
    this._build();
    this._loop = this._loop.bind(this);
    this.animId = requestAnimationFrame(this._loop);
  }

  destroy() {
    if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
    }
  }

  _build() {
    const { cardW, cardH, spray, dpr, dissolveLeft, dissolveRight } = this;
    const sprayY = spray * 0.45;

    this.canvas.width  = (cardW + spray * 2) * dpr;
    this.canvas.height = (cardH + sprayY * 2) * dpr;
    this.canvas.style.width  = (cardW + spray * 2) + 'px';
    this.canvas.style.height = (cardH + sprayY * 2) + 'px';
    this.canvas.style.left = -spray + 'px';
    this.canvas.style.top = -sprayY + 'px';
    this.ctx.scale(dpr, dpr);

    const off = document.createElement('canvas');
    off.width = cardW;
    off.height = cardH;
    const octx = off.getContext('2d');

    const scale = Math.max(cardW / this.img.width, cardH / this.img.height);
    const dw = this.img.width * scale;
    const dh = this.img.height * scale;
    const dx = (cardW - dw) / 2;
    const dy = (cardH - dh) / 2;

    octx.save();
    this._roundRectPath(octx, 0, 0, cardW, cardH, this.radius);
    octx.clip();
    octx.drawImage(this.img, dx, dy, dw, dh);
    octx.restore();

    const imgData = octx.getImageData(0, 0, cardW, cardH);
    const data = imgData.data;

    const zonePx = cardW * this.edgeZone;

    for (let y = 0; y < cardH; y += this.sampleStep) {
      for (let x = 0; x < cardW; x += this.sampleStep) {
        const i = (y * cardW + x) * 4;
        const a = data[i + 3];
        if (a === 0) continue;

        const isLeftZone = (x < zonePx) && dissolveLeft;
        const isRightZone = ((cardW - x) < zonePx) && dissolveRight;

        if (!isLeftZone && !isRightZone) continue;

        const distFromEdge = isLeftZone ? x : (cardW - x);
        let t = distFromEdge / zonePx;
        const dissolve = 1 - (t * t * (3 - 2 * t));

        this._fadeBlock(data, cardW, cardH, x, y, this.sampleStep, 1 - dissolve * 0.98);

        if (Math.random() < dissolve * this.density) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const dir = isLeftZone ? -1 : 1;

          const brightR = Math.min(255, Math.round(r * 1.45 + 50));
          const brightG = Math.min(255, Math.round(g * 1.45 + 50));
          const brightB = Math.min(255, Math.round(b * 1.45 + 50));

          const isThemeHighlight = Math.random() < 0.3;
          const particleColor = isThemeHighlight
            ? (Math.random() < 0.6 ? 'rgb(217, 217, 200)' : 'rgb(168, 170, 160)')
            : `rgb(${brightR},${brightG},${brightB})`;

          const throwDist = Math.pow(Math.random(), 1.4) * this.spray;
          const spreadY = (throwDist / this.spray) * (Math.random() - 0.5) * sprayY * 1.6;

          this.particles.push({
            baseX: x, baseY: y,
            tx: x + dir * throwDist,
            ty: y + spreadY,
            color: particleColor,
            alpha: dissolve * (0.45 + Math.random() * 0.5),
            size: 0.6 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.5,
            wander: 4 + Math.random() * 8,
          });
        }
      }
    }

    octx.putImageData(imgData, 0, 0);
    this.baseLayer = off;
    this.sprayY = sprayY;
  }

  _fadeBlock(data, w, h, x, y, step, mult) {
    for (let yy = y; yy < Math.min(y + step, h); yy++) {
      for (let xx = x; xx < Math.min(x + step, w); xx++) {
        const idx = (yy * w + xx) * 4 + 3;
        data[idx] = data[idx] * mult;
      }
    }
  }

  _roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  _loop(time) {
    const ctx = this.ctx;
    const { spray, cardW, cardH } = this;
    const sprayY = this.sprayY || 0;
    ctx.clearRect(0, 0, cardW + spray * 2, cardH + sprayY * 2);

    if (this.baseLayer) {
        ctx.drawImage(this.baseLayer, spray, sprayY);
    }

    const t = time * 0.001;
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const drift = Math.sin(t * p.speed + p.phase) * p.wander;
      const x = spray + p.baseX + (p.tx - p.baseX) + drift * 0.3;
      const y = sprayY + p.baseY + (p.ty - p.baseY) + Math.cos(t * p.speed * 0.8 + p.phase) * p.wander * 0.3;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    this.animId = requestAnimationFrame(this._loop);
  }
}

function DissolveCanvas({ src, width = 300, height = 260, dissolveLeft = true, dissolveRight = true, spray = 90 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cardInstance = null;
        let cancelled = false;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (!cancelled) {
                cardInstance = new DissolveCard(canvas, img, { 
                    width, 
                    height, 
                    dissolveLeft, 
                    dissolveRight, 
                    spray,
                    edgeZone: 0.32,
                    density: 0.7
                });
            }
        };
        img.src = src;

        return () => {
            cancelled = true;
            if (cardInstance) {
                cardInstance.destroy();
            }
        };
    }, [src, width, height, dissolveLeft, dissolveRight, spray]);

    return <canvas ref={canvasRef} />;
}

function PerspectiveFanCarousel({ items, onSelectProject, isOverlayOpen }) {
    const [active, setActive] = useState(0);
    const [dragPx, setDragPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef({
        dragging: false,
        dragPx: 0,
        totalMoved: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0,
        timer: null
    });

    const [windowWidth, setWindowWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const dynamicSpacing = useMemo(() => {
        if (windowWidth <= 360) return 130;
        if (windowWidth <= 480) return 160;
        if (windowWidth <= 600) return 200;
        if (windowWidth <= 768) return 250;
        if (windowWidth <= 1024) return 320;
        if (windowWidth <= 1280) return 380;
        return 420;
    }, [windowWidth]);

    const dynamicDepthStep = useMemo(() => {
        if (windowWidth <= 480) return 80;
        if (windowWidth <= 768) return 100;
        if (windowWidth <= 1024) return 125;
        return 150;
    }, [windowWidth]);

    const config = {
        spacing: dynamicSpacing,
        angleStep: 18,
        depthStep: dynamicDepthStep,
        scaleStep: 0.1,
        blurStep: 1.1,
        blurAccel: 0.35,
        opacityFloor: 0.25,
        maxVisible: 3,
        autoAdvanceMs: 6500,
        dragClickThreshold: 6,
    };

    useEffect(() => {
        if (isOverlayOpen) {
            if (dragRef.current.timer) clearInterval(dragRef.current.timer);
            return;
        }

        const resetAutoplay = () => {
            if (dragRef.current.timer) clearInterval(dragRef.current.timer);
            dragRef.current.timer = setInterval(() => {
                if (!dragRef.current.dragging) {
                    setActive((prev) => (prev + 1) % items.length);
                }
            }, config.autoAdvanceMs);
        };

        resetAutoplay();
        return () => {
            if (dragRef.current.timer) clearInterval(dragRef.current.timer);
        };
    }, [items.length, isOverlayOpen]);

    const handlePointerDown = (e) => {
        if (isOverlayOpen) return;
        if (e.target.closest('.perspective-nav')) return;
        if (e.pointerType === 'mouse') {
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
        }
        dragRef.current.dragging = true;
        dragRef.current.direction = null;
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.totalMoved = 0;
        dragRef.current.dragPx = 0;
        dragRef.current.velocity = 0;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastTime = performance.now();
        dragRef.current.downTarget = e.target;
        setIsDragging(true);
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current.dragging) return;
        const now = performance.now();
        const dx = e.clientX - dragRef.current.lastX;
        const totalX = Math.abs(e.clientX - (dragRef.current.startX || e.clientX));
        const totalY = Math.abs(e.clientY - (dragRef.current.startY || e.clientY));

        if (dragRef.current.direction === null && (totalX > 8 || totalY > 8)) {
            if (totalY > totalX * 1.3 && totalY > 10) {
                dragRef.current.dragging = false;
                setIsDragging(false);
                if (e.pointerType === 'mouse') {
                    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                }
                setDragPx(0);
                return;
            } else {
                dragRef.current.direction = 'horizontal';
            }
        }

        const dt = Math.max(now - dragRef.current.lastTime, 1);
        const instVelocity = dx / dt;
        dragRef.current.velocity = dragRef.current.velocity * 0.7 + instVelocity * 0.3;
        dragRef.current.dragPx += dx;
        dragRef.current.totalMoved += Math.abs(dx);
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastTime = now;
        setDragPx(dragRef.current.dragPx);
    };

    const endDrag = (e) => {
        if (!dragRef.current.dragging) return;
        dragRef.current.dragging = false;
        setIsDragging(false);

        const moved = dragRef.current.totalMoved;
        const curDrag = dragRef.current.dragPx;
        const vel = dragRef.current.velocity;

        setDragPx(0);

        if (moved < config.dragClickThreshold) {
            const target = dragRef.current.downTarget || (e ? e.target : null);
            const cardElem = target ? target.closest('.paper-mockup-card') : null;
            const isButton = target ? Boolean(target.closest('.paper-mockup-card-button')) : false;
            const isMobile = windowWidth <= 768;

            if (cardElem) {
                const indexAttr = cardElem.getAttribute('data-index');
                if (indexAttr !== null) {
                    const idx = parseInt(indexAttr, 10);
                    const item = items[idx];
                    if (item) {
                        if (idx === active) {
                            if (isMobile) {
                                if (isButton && onSelectProject) {
                                    onSelectProject(item);
                                }
                            } else {
                                if (onSelectProject) {
                                    onSelectProject(item);
                                }
                            }
                        } else {
                            setActive(idx);
                        }
                    }
                }
            }
            return;
        }

        const isMobile = windowWidth <= 768;

        if (isMobile) {
            const SWIPE_DIST_THRESHOLD = 20;
            const FLICK_VEL_THRESHOLD = 0.12;
            let shift = 0;
            if (Math.abs(curDrag) > SWIPE_DIST_THRESHOLD || Math.abs(vel) > FLICK_VEL_THRESHOLD) {
                shift = curDrag < 0 ? 1 : -1;
            }
            if (shift !== 0) {
                setActive((prev) => ((prev + shift) % items.length + items.length) % items.length);
            }
        } else {
            const distanceSteps = curDrag / config.spacing;
            let shift = Math.round(distanceSteps);

            const FLICK_VELOCITY_THRESHOLD = 0.45;
            if (shift === 0 && Math.abs(vel) > FLICK_VELOCITY_THRESHOLD) {
                shift = vel > 0 ? 1 : -1;
            }

            setActive((prev) => ((prev - shift) % items.length + items.length) % items.length);
        }
    };

    const n = items.length;
    const isMobile = windowWidth <= 768;

    return (
        <div className="perspective-carousel-wrapper">
            <div 
                className={`stage ${isDragging ? 'dragging' : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={(e) => { if (dragRef.current.dragging && e.buttons === 0) endDrag(e); }}
            >
                {items.map((item, i) => {
                    let offset = i - active;
                    if (offset > n / 2) offset -= n;
                    if (offset < -n / 2) offset += n;

                    let cardStyle;
                    let isCenter;

                    if (isMobile) {
                        isCenter = offset === 0;

                        if (offset < -1 || offset > 2) {
                            return null;
                        }

                        let x = 0;
                        let y = 0;
                        let scale = 1;
                        let opacity = 1;
                        let rotate = 0;
                        let zIndex = 100;

                        if (offset === 0) {
                            if (isDragging) {
                                x = dragPx;
                                rotate = dragPx / 14;
                                opacity = Math.max(1 - Math.abs(dragPx) / 280, 0.4);
                                zIndex = dragPx > 0 ? 90 : 100;
                            } else {
                                x = 0;
                                y = 0;
                                scale = 1;
                                opacity = 1;
                                rotate = 0;
                                zIndex = 100;
                            }
                        } else if (offset === -1) {
                            if (isDragging && dragPx > 0) {
                                const progress = Math.min(dragPx / 160, 1);
                                x = -200 + progress * 200;
                                rotate = -12 + progress * 12;
                                scale = 0.9 + progress * 0.1;
                                opacity = Math.min(progress * 1.2, 1);
                                zIndex = 150;
                            } else {
                                x = -220;
                                opacity = 0;
                                scale = 0.9;
                                zIndex = 50;
                            }
                        } else if (offset > 0) {
                            let dragFactor = 0;
                            if (isDragging) {
                                if (dragPx < 0) {
                                    dragFactor = Math.abs(dragPx) / 160;
                                } else {
                                    dragFactor = -Math.min(dragPx / 160, 1);
                                }
                            }
                            const effectiveOffset = Math.max(0, offset - dragFactor);
                            scale = Math.max(1 - effectiveOffset * 0.05, 0.8);
                            y = -effectiveOffset * 40;
                            x = effectiveOffset * 6;
                            opacity = Math.max(1 - effectiveOffset * 0.12, 0.7);
                            zIndex = 100 - offset * 10;
                            rotate = effectiveOffset * 1.5;
                        }

                        cardStyle = {
                            transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                            filter: 'none',
                            WebkitFilter: 'none',
                            opacity: opacity,
                            zIndex: zIndex,
                            pointerEvents: 'auto',
                            transition: isDragging ? 'none' : 'transform 0.68s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.68s cubic-bezier(0.22, 1, 0.36, 1)',
                        };
                    } else {
                        const liveOffset = offset + (isDragging ? dragPx / config.spacing : 0);
                        const abs = Math.abs(liveOffset);
                        isCenter = abs < 0.5;

                        if (abs > config.maxVisible + 1.2) {
                            return null;
                        }

                        const x       = liveOffset * config.spacing;
                        const rotateY = liveOffset * config.angleStep;
                        const z       = -abs * config.depthStep;
                        const scale   = Math.max(1 - abs * config.scaleStep, 0.72);
                        const blur    = abs < 0.05 ? 0 : abs * config.blurStep + Math.max(abs - 1, 0) * config.blurAccel;
                        const opacity = isCenter ? 1 : 0.3;

                        cardStyle = {
                            transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                            filter: `blur(${blur}px)`,
                            WebkitFilter: `blur(${blur}px)`,
                            opacity: opacity,
                            zIndex: 100 - Math.round(abs),
                            pointerEvents: 'auto',
                            transition: isDragging ? 'none' : 'transform 0.68s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.68s cubic-bezier(0.22, 1, 0.36, 1), filter 0.68s cubic-bezier(0.22, 1, 0.36, 1)',
                        };
                    }

                    const cardBoxShadow = isMobile && item.boxShadow
                        ? item.boxShadow.replace(/3px 10px 20px rgba\(255, 255, 255, 0.5\)/g, '3px 4px 18px rgba(255, 255, 255, 0.5), 0px -3px 12px rgba(255, 255, 255, 0.35)')
                        : item.boxShadow;

                    if (item.isMockupCard) {
                        return (
                            <div
                                key={i}
                                data-index={i}
                                className={`card ${isCenter ? 'center' : ''} paper-mockup-card`}
                                style={{
                                    ...cardStyle,
                                    backgroundImage: `url(${item.bgImage})`,
                                    boxShadow: cardBoxShadow,
                                }}
                            >
                                <div className="paper-mockup-card-inner">
                                    <div className="paper-mockup-card-button">
                                        <span>{item.buttonText}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            <div className="paper-card-under-info">
                <span className="paper-card-under-category">
                    {items[active].category}
                </span>
                <h3 className="paper-card-under-title">
                    {items[active].title}
                </h3>
                <p className="paper-card-under-sub">
                    {items[active].subtitle}
                </p>
            </div>
        </div>
    );
}

function VinylPlayer({ trackUri = "spotify:track:7KKWdbcxg0qGtzVSFg8jjX", isPlaying, onTogglePlay }) {
    const embedRef = useRef(null);
    const controllerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const scriptId = 'spotify-iframe-api';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://open.spotify.com/embed/iframe-api/v1';
            script.async = true;
            document.body.appendChild(script);
        }

        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            if (embedRef.current) {
                IFrameAPI.createController(
                    embedRef.current,
                    { uri: trackUri },
                    (EmbedController) => {
                        controllerRef.current = EmbedController;
                        EmbedController.addListener('ready', () => setIsReady(true));
                    }
                );
            }
        };
    }, [trackUri]);

    return (
        <div>
            <div 
                className={`vinyl-player-widget ${isPlaying ? "playing" : ""}`}
                data-tooltip={isPlaying ? "Pause The Mountain Piano Documentary" : "Play The Mountain Piano Documentary"}
            >
            <svg viewBox="0 0 250 200" className="vinyl-svg">
                <defs>
                    <linearGradient id="vinylGloss" x1="20%" y1="0%" x2="80%" y2="100%">
                        <stop offset="0%" stopColor="#2d3036" />
                        <stop offset="25%" stopColor="#1a1b20" />
                        <stop offset="50%" stopColor="#0f1013" />
                        <stop offset="75%" stopColor="#191a1e" />
                        <stop offset="100%" stopColor="#08090a" />
                    </linearGradient>

                    <linearGradient id="sheenBeam1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                        <stop offset="35%" stopColor="rgba(255, 255, 255, 0.08)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 0)" />
                        <stop offset="65%" stopColor="rgba(255, 255, 255, 0.08)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
                    </linearGradient>

                    <linearGradient id="sheenBeam2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                        <stop offset="40%" stopColor="rgba(255, 255, 255, 0.02)" />
                        <stop offset="60%" stopColor="rgba(255, 255, 255, 0.02)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
                    </linearGradient>

                    <filter id="reflectionBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" />
                    </filter>

                    <clipPath id="vinylDiscClip">
                        <circle cx="92" cy="100" r="80" />
                    </clipPath>

                    <linearGradient id="whiteCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#e2e2e2" />
                        <stop offset="85%" stopColor="#cacaca" />
                        <stop offset="100%" stopColor="#9e9e9e" />
                    </linearGradient>

                    <linearGradient id="silverTube" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f5f5f5" />
                        <stop offset="40%" stopColor="#cccccc" />
                        <stop offset="70%" stopColor="#a3a3a3" />
                        <stop offset="100%" stopColor="#787878" />
                    </linearGradient>
                </defs>

                <g 
                    className={`vinyl-disc-group ${isPlaying ? "spinning" : ""}`} 
                    style={{ transformOrigin: "92px 100px" }}
                >
                    <circle cx="92" cy="100" r="82" fill="none" stroke="#000000" strokeWidth="5" />
                    <circle cx="92" cy="100" r="80" fill="url(#vinylGloss)" />

                    <circle cx="92" cy="100" r="74" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="67" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="60" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="53" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
                    <circle cx="92" cy="100" r="40" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="33" fill="none" stroke="#060608" strokeWidth="1.6" />
                    <circle cx="92" cy="100" r="27" fill="none" stroke="#060608" strokeWidth="1.6" />

                    <g clipPath="url(#vinylDiscClip)" filter="url(#reflectionBlur)" style={{ pointerEvents: "none" }}>
                        <path 
                            d="M 92 100 L 35 15 A 80 80 0 0 1 149 15 Z M 92 100 L 149 185 A 80 80 0 0 1 35 185 Z" 
                            fill="url(#sheenBeam1)" 
                            opacity="0.55" 
                        />
                        <path 
                            d="M 92 100 L 169 45 A 80 80 0 0 1 169 155 Z M 92 100 L 15 155 A 80 80 0 0 1 15 45 Z" 
                            fill="url(#sheenBeam2)" 
                            opacity="0.35" 
                        />
                    </g>

                    <circle cx="92" cy="100" r="23" fill="#c82424" stroke="#000000" strokeWidth="2.5" />
                    <circle cx="92" cy="100" r="5.5" fill="#ffffff" stroke="#000000" strokeWidth="1.8" />
                    <circle cx="92" cy="100" r="3.8" fill="#080808" />
                </g>

                <g 
                    className="tonearm-assembly" 
                    style={{ 
                        transformOrigin: "216px 28px", 
                        transform: isPlaying ? "rotate(28deg)" : "rotate(0deg)",
                        transition: "transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)"
                    }}
                >
                    <rect x="214" y="12" width="4" height="10" rx="2" fill="url(#whiteCylinder)" stroke="#888" strokeWidth="0.8" />
                    <rect x="208" y="20" width="16" height="26" rx="5" fill="url(#whiteCylinder)" stroke="#888" strokeWidth="1.2" />
                    <path 
                        d="M 216 46 L 216 95 Q 216 142 192 165 L 178 178" 
                        fill="none" 
                        stroke="url(#silverTube)" 
                        strokeWidth="4.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round" 
                    />
                    <rect 
                        x="169" 
                        y="170" 
                        width="15" 
                        height="25" 
                        rx="7" 
                        fill="url(#whiteCylinder)" 
                        stroke="#777" 
                        strokeWidth="1.2" 
                        transform="rotate(42 176.5 182.5)"
                    />
                </g>
            </svg>
        </div>
        <div
            ref={embedRef}
            style={{ display: 'none', position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none', top: -9999, left: -9999 }}
        />
    </div>
);
}

function MacbookScreenDisplay({ videoUrl, fallbackImg, title }) {
    const [videoAspect, setVideoAspect] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.defaultMuted = true;
        video.muted = true;
        const p = video.play();
        if (p && p.catch) {
            p.catch(() => {});
        }
    }, [videoUrl]);

    const handleLoadedMetadata = (e) => {
        const video = e.target;
        if (video && video.videoWidth && video.videoHeight) {
            setVideoAspect(video.videoWidth / video.videoHeight);
        }
    };

    return (
        <div className="macbook-display-wrapper">
            <div 
                className="macbook-screen-frame"
                style={videoAspect ? { aspectRatio: `${videoAspect}` } : {}}
            >
                <div className="macbook-notch" title="MacBook FaceTime Camera">
                    <div className="macbook-camera"></div>
                </div>
                
                <div className="macbook-screen-content">
                    {videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            disablePictureInPicture
                            disableRemotePlayback
                            onLoadedMetadata={handleLoadedMetadata}
                            className="macbook-video-element"
                        />
                    ) : (
                        <div className="macbook-placeholder-container">
                            <img src={fallbackImg} alt={title} className="macbook-screen-img" />
                        </div>
                    )}
                    <div className="macbook-glass-reflection"></div>
                </div>
            </div>
        </div>
    );
}

function IphoneScreenDisplay({ imgSrc, videoUrl, title }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.defaultMuted = true;
        video.muted = true;
        const p = video.play();
        if (p && p.catch) {
            p.catch(() => {});
        }
    }, [videoUrl]);

    return (
        <div className="iphone-display-wrapper">
            <div className="iphone-device-body">
                <div className="iphone-btn-volume-up"></div>
                <div className="iphone-btn-volume-down"></div>
                <div className="iphone-btn-power"></div>
                
                <div className="iphone-screen-frame">
                    <div className="iphone-dynamic-island">
                        <div className="iphone-camera-lens"></div>
                        <div className="iphone-sensor-dot"></div>
                    </div>
                    
                    <div className="iphone-screen-content">
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                disablePictureInPicture
                                disableRemotePlayback
                                className="iphone-video-element"
                            />
                        ) : (
                            <img src={imgSrc} alt={title} className="iphone-screen-img" />
                        )}
                        <div className="iphone-glass-reflection"></div>
                        <div className="iphone-home-indicator"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CharBlurText({ children }) {
    return children;
}

function ProjectOverlayFrame({ project, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    if (!project) return null;

    const isTransfermarkt = project.id === "transfermarkt" || (project.title && project.title.toUpperCase().includes("TRANSFERMARKT"));
    const isBreathe = project.id === "breathe" || (project.title && project.title.toLowerCase().includes("breathe"));
    const isReveal = project.id === "reveal" || (project.title && project.title.toLowerCase().includes("reveal"));

    return (
        <div className="project-overlay-backdrop" onClick={onClose}>
            <div className="project-overlay-frame" onClick={(e) => e.stopPropagation()}>
                <button className="project-overlay-close" onClick={onClose} aria-label="Close modal">
                    ✕
                </button>
                <div className="project-overlay-header">
                    <span className="project-overlay-category">{project.category}</span>
                    <h2 className="project-overlay-title">{project.title}</h2>
                    <p className="project-overlay-sub">{project.subtitle}</p>
                </div>
                
                {isTransfermarkt ? (
                    <React.Fragment>
                        <MacbookScreenDisplay
                            videoUrl={project.videoUrl}
                            fallbackImg={project.bgImage}
                            title={project.title}
                        />
                        <div className="transfermarkt-intro-container">
                            <p className="transfermarkt-intro-text">
                                One of football's most visited platforms, redesigned for clarity. Millions open it every day to check a score, a value, a transfer — yet the experience rarely matches the trust it's earned. This project rethinks that gap, aiming for an experience that finally matches the passion behind it.
                            </p>
                        </div>
                    </React.Fragment>
                ) : isBreathe ? (
                    <React.Fragment>
                        <IphoneScreenDisplay
                            imgSrc={project.bgImage}
                            videoUrl={project.videoUrl}
                            title={project.title}
                        />
                        {project.introText && (
                            <div className="transfermarkt-intro-container">
                                {project.introText.split('\n\n').map((para, idx, arr) => (
                                    <p key={idx} className="transfermarkt-intro-text" style={{ marginBottom: idx < arr.length - 1 ? '16px' : '0' }}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ) : isReveal ? (
                    <React.Fragment>
                        <MacbookScreenDisplay
                            videoUrl={project.videoUrl}
                            fallbackImg={project.bgImage}
                            title={project.title}
                        />
                        {project.introText && (
                            <div className="transfermarkt-intro-container">
                                {project.introText.split('\n\n').map((para, idx, arr) => (
                                    <p key={idx} className="transfermarkt-intro-text" style={{ marginBottom: idx < arr.length - 1 ? '16px' : '0' }}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <div className="project-overlay-media">
                            <img src={project.bgImage} alt={project.title} className="project-overlay-img" />
                        </div>
                        {project.introText && (
                            <div className="transfermarkt-intro-container">
                                {project.introText.split('\n\n').map((para, idx, arr) => (
                                    <p key={idx} className="transfermarkt-intro-text" style={{ marginBottom: idx < arr.length - 1 ? '16px' : '0' }}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                )}

                <div className="project-overlay-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isReveal ? '0px' : '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 className={`project-overlay-section-title ${isReveal ? 'project-overlay-live-title' : ''}`} style={{ margin: 0 }}>
                            {isReveal ? "EXPERIENCE IT YOURSELF:" : "CASE STUDY"}
                        </h3>
                        {(isTransfermarkt || isBreathe) && (
                            <a
                                href={isTransfermarkt ? "/assets/transfermarkt_case_study_paper.png" : "/assets/breathe_case_study_paper.png"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="case-study-full-res-link"
                            >
                                View full res file ↗
                            </a>
                        )}
                    </div>
                    {isTransfermarkt ? (
                        <div className="case-study-paper-frame">
                            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((idx) => (
                                <img
                                    key={idx}
                                    src={`/assets/slices/transfermarkt_${idx}.png`}
                                    alt={`Transfermarkt Case Study Part ${idx + 1}`}
                                    className="case-study-paper-img"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    ) : isBreathe ? (
                        <div className="case-study-paper-frame">
                            {[0,1,2,3,4,5,6,7,8,9].map((idx) => (
                                <img
                                    key={idx}
                                    src={`/assets/slices/breathe_${idx}.png`}
                                    alt={`Breathe Case Study Part ${idx + 1}`}
                                    className="case-study-paper-img"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    ) : isReveal ? (
                        <div className="project-overlay-live-container">
                            <a
                                href={project.liveUrl || "https://adventurous-app-059676.framer.app"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-overlay-live-btn"
                            >
                                <span>https://adventurous-app-059676.framer.app</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </a>
                        </div>
                    ) : (
                        <p className="project-overlay-desc">{project.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const heroRef = useRef(null);
    const dragMetaRef = useRef(null);
    const audioRef = useRef(null);
    const phraseVideoRef = useRef(null);
    const rafIdRef = useRef(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeDragIndex, setActiveDragIndex] = useState(null);
    const [hoverLabel, setHoverLabel] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [activeIndex, setActiveIndex] = useState(1);
    const [positions, setPositions] = useState(() =>
        DRAG_IMAGES.map(() => ({ x: 0, y: 0 }))
    );

    useEffect(() => {
        const video = phraseVideoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { threshold: 0.25 }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const audio = new Audio("/assets/the_mountain-piano-documentary-567436.mp3");
            audio.loop = true;
            audioRef.current = audio;
            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            };
        }
        return undefined;
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current && typeof window !== "undefined") {
            const audio = new Audio("/assets/the_mountain-piano-documentary-567436.mp3");
            audio.loop = true;
            audioRef.current = audio;
        }
        setIsPlaying((prev) => {
            const next = !prev;
            if (audioRef.current) {
                if (next) {
                    const p = audioRef.current.play();
                    if (p && p.catch) {
                        p.catch((err) => console.log("Audio playback error:", err));
                    }
                } else {
                    audioRef.current.pause();
                }
            }
            return next;
        });
    }, []);

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            typeof window.matchMedia === "function"
        ) {
            const media = window.matchMedia("(prefers-reduced-motion: reduce)");
            setReducedMotion(media.matches);
            const handler = (event) => setReducedMotion(event.matches);
            media.addEventListener("change", handler);
            return () => media.removeEventListener("change", handler);
        }
        return undefined;
    }, []);

    const handleImagePointerMove = useCallback((event, label) => {
        if (dragMetaRef.current || activeDragIndex !== null) {
            setHoverLabel(null);
            return;
        }
        const winWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
        const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;

        setHoverLabel({
            x: clamp(event.clientX, 10, winWidth - 120),
            y: clamp(event.clientY, 10, winHeight - 60),
            text: label,
        });
    }, [activeDragIndex]);

    const handleImagePointerLeave = useCallback(() => {
        setHoverLabel(null);
    }, []);

    const getClientCoords = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    };

    const onPointerDown = useCallback(
        (event, index) => {
            const hero = heroRef.current;
            if (!hero) return;

            const coords = getClientCoords(event);
            const heroRect = hero.getBoundingClientRect();
            const imageEl = hero.querySelector(`[data-drag-index="${index}"]`);
            const elemRect = imageEl ? imageEl.getBoundingClientRect() : null;

            const elemLeft = elemRect ? elemRect.left - heroRect.left : 0;
            const elemTop = elemRect ? elemRect.top - heroRect.top : 0;
            const elemWidth = elemRect ? elemRect.width : 100;
            const elemHeight = elemRect ? elemRect.height : 100;

            const isMobile = window.innerWidth <= 810;
            const padX = isMobile ? 120 : 0;
            const padY = isMobile ? 120 : 0;

            dragMetaRef.current = {
                index,
                startX: coords.clientX,
                startY: coords.clientY,
                initial: positions[index],
                minX: -elemLeft - padX,
                maxX: heroRect.width - elemLeft - elemWidth + padX,
                minY: -elemTop - padY,
                maxY: heroRect.height - elemTop - elemHeight + padY,
                moved: false,
                maxDist: 0,
            };
            setActiveDragIndex(index);
            if (event.pointerId !== undefined && event.currentTarget.setPointerCapture) {
                try {
                    event.currentTarget.setPointerCapture(event.pointerId);
                } catch (e) {}
            }
        },
        [positions]
    );

    const onPointerMove = useCallback((event) => {
        const meta = dragMetaRef.current;
        if (!meta) return;

        const coords = getClientCoords(event);
        const dx = coords.clientX - meta.startX;
        const dy = coords.clientY - meta.startY;
        const dist = Math.hypot(dx, dy);
        meta.maxDist = Math.max(meta.maxDist || 0, dist);

        if (dist > (DRAG_IMAGES[meta.index]?.isVinylPlayer ? 6 : 2)) {
            meta.moved = true;
        }

        if (rafIdRef.current) return;

        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            if (!dragMetaRef.current) return;
            setPositions((prev) =>
                prev.map((pos, idx) =>
                    idx === meta.index
                        ? {
                              x: clamp(meta.initial.x + dx, meta.minX, meta.maxX),
                              y: clamp(meta.initial.y + dy, meta.minY, meta.maxY),
                          }
                        : pos
                )
            );
        });
    }, []);

    const onPointerUp = useCallback((event) => {
        const meta = dragMetaRef.current;
        if (meta && !meta.moved && DRAG_IMAGES[meta.index]?.isVinylPlayer) {
            togglePlay();
        }
        dragMetaRef.current = null;
        setActiveDragIndex(null);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }, [togglePlay]);

    useEffect(() => {
        if (activeDragIndex !== null && typeof window !== "undefined") {
            const handleTouchMove = (e) => {
                if (dragMetaRef.current && e.cancelable) {
                    e.preventDefault();
                }
            };

            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
            window.addEventListener("pointercancel", onPointerUp);
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("touchend", onPointerUp);
            window.addEventListener("touchcancel", onPointerUp);

            return () => {
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
                window.removeEventListener("pointercancel", onPointerUp);
                window.removeEventListener("touchmove", handleTouchMove);
                window.removeEventListener("touchend", onPointerUp);
                window.removeEventListener("touchcancel", onPointerUp);
            };
        }
        return undefined;
    }, [activeDragIndex, onPointerMove, onPointerUp]);

    const handleSmoothScroll = useCallback((e, targetId) => {
        e.preventDefault();
        const element = document.querySelector(targetId);
        if (!element) return;

        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = element.getBoundingClientRect().top + startPosition;
        const distance = targetPosition - startPosition;
        const duration = 400;
        let startTime = null;

        const easeInOutCubic = (t) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const animation = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }, []);

    return (
        <React.Fragment>
            <main className={`home-page ${reducedMotion ? "reduce-motion" : ""}`}>
            {hoverLabel && (() => {
                const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
                const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
                const labelWidthEst = winWidth <= 600 ? 150 : 210;
                
                let labelLeft = hoverLabel.x + 16;
                if (labelLeft + labelWidthEst > winWidth - 16) {
                    labelLeft = Math.max(12, hoverLabel.x - labelWidthEst - 12);
                }

                let labelTop = hoverLabel.y + 12;
                if (labelTop + 45 > winHeight - 12) {
                    labelTop = Math.max(12, hoverLabel.y - 45);
                }

                return (
                    <div
                        className="hero-cursor-label"
                        style={{
                            position: "fixed",
                            left: `${labelLeft}px`,
                            top: `${labelTop}px`,
                            zIndex: 99999,
                            pointerEvents: "none",
                        }}
                    >
                        {hoverLabel.text}
                    </div>
                );
            })()}
            <section className="hero" ref={heroRef} aria-label="Intro section" style={{ background: 'linear-gradient(180deg, #D9D9C8 44%, #919E9E 75%, #020407 100%)' }}>
                <div className="hero-noise" aria-hidden="true" />
                <header className="hero-header">
                    <nav className="hero-nav" aria-label="Primary">
                        <a href="#inspirations" onClick={(e) => handleSmoothScroll(e, '#inspirations')}>Inspirations</a>
                        <a href="#my-work" onClick={(e) => handleSmoothScroll(e, '#my-work')}>My work</a>
                        <a href="#about-me" onClick={(e) => handleSmoothScroll(e, '#about-me')}>About me</a>
                        <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</a>
                    </nav>
                    <img
                        src="/assets/signature.png"
                        alt="Veronica Madorini signature"
                        className="hero-signature-img"
                    />
                </header>

                <div className="heading-container">
                    <p className="hero-hint">
                        (You can drag the pictures where you prefer)
                    </p>
                    <h1>VERONICA MADORINI</h1>
                    <p className="hero-subtitle">UI/UX DESIGNER</p>
                </div>

                <div className="hero-images">
                    {DRAG_IMAGES.map((image, index) => {
                        const isDragging = activeDragIndex === index;
                        const transformStyle = `translate3d(${positions[index].x}px, ${positions[index].y}px, 0) scale(${isDragging ? 1.05 : 1})`;
                        const transitionStyle = isDragging
                            ? "none"
                            : (reducedMotion ? "none" : "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)");

                        return image.isVinylPlayer ? (
                            <div
                                key="vinyl-player"
                                data-drag-index={index}
                                className={`${image.className} ${isDragging ? "is-dragging" : ""}`}
                                onPointerDown={(event) =>
                                    onPointerDown(event, index)
                                }
                                onTouchStart={(event) =>
                                    onPointerDown(event, index)
                                }
                                onPointerEnter={() => setHoverLabel(null)}
                                onPointerMove={() => setHoverLabel(null)}
                                style={{
                                    transform: transformStyle,
                                    transition: transitionStyle,
                                    zIndex: isDragging ? 100 : 1,
                                }}
                            >
                                <VinylPlayer isPlaying={isPlaying} onTogglePlay={togglePlay} />
                            </div>
                        ) : (
                            <img
                                key={image.src}
                                data-drag-index={index}
                                className={`${image.className} ${isDragging ? "is-dragging" : ""}`}
                                src={image.src}
                                alt={image.alt}
                                onPointerDown={(event) =>
                                    onPointerDown(event, index)
                                }
                                onTouchStart={(event) =>
                                    onPointerDown(event, index)
                                }
                                onPointerMove={(event) =>
                                    handleImagePointerMove(event, image.label)
                                }
                                onPointerLeave={handleImagePointerLeave}
                                style={{
                                    transform: transformStyle,
                                    transition: transitionStyle,
                                    zIndex: isDragging ? 100 : 1,
                                }}
                                draggable={false}
                            />
                        );
                    })}
                </div>
            </section>

            <section className="phrase-wrap" id="inspirations">
                <article className="phrase-panel">
                    <h2>
                        <CharBlurText>
                            CAUGHT BETWEEN BEAUTY AND PURPOSE — THAT’S WHERE THE GOOD STUFF HAPPENS.
                        </CharBlurText>
                    </h2>
                    <p className="phrase-subtext">
                        <CharBlurText>
                            CHOOSING DESIGN WAS CHOOSING TO STAY CLOSE TO THE PART OF ME THAT NEEDS TO CREATE — EVERY DAY, SOMETHING BEAUTIFUL, SOMETHING USEFUL, SOMETHING ALIVE.
                        </CharBlurText>
                    </p>
                    <div className="phrase-video-box">
                        <video
                            ref={phraseVideoRef}
                            src="/assets/meditation.mp4"
                            className="phrase-video"
                            muted
                            playsInline
                        />
                    </div>
                </article>
            </section>

            <section className="work-section" id="my-work" aria-label="My work">
                <div className="section-header">
                    <h3>MY WORK</h3>
                    <p className="section-header-year">2025 - 2026</p>
                </div>

                <PerspectiveFanCarousel 
                    items={WORK_ITEMS} 
                    onSelectProject={setSelectedProject} 
                    isOverlayOpen={Boolean(selectedProject)} 
                />
            </section>

            <section className="about-wrap" id="about-me">
                <article className="about-panel">
                    <h2><CharBlurText>ABOUT ME</CharBlurText></h2>
                    <p>
                        <CharBlurText>
                            I’M A UI/UX DESIGNER WHO BELIEVES DESIGN IS ONE OF THE MOST HONEST WAYS TO STAY CONNECTED TO THE CREATIVE PART OF YOURSELF.
                        </CharBlurText>
                    </p>
                    <p>
                        <CharBlurText>
                            I CARE ABOUT INTERACTIONS THAT FEEL INTUITIVE AND EXPERIENCES THAT MAKE PEOPLE SMILE. MY WORK BLENDS DESIGN PSYCHOLOGY WITH A GENUINE CURIOSITY FOR HOW PEOPLE THINK AND FEEL, BECAUSE GOOD DESIGN STARTS WITH TRULY UNDERSTANDING HUMANS.
                        </CharBlurText>
                    </p>
                    <p>
                        <CharBlurText>
                            LATELY I’VE BEEN EXPANDING INTO GRAPHIC DESIGN AND MOTION DESIGN, FEEDING A CURIOSITY THAT DOESN'T KNOW HOW TO SIT STILL.
                        </CharBlurText>
                    </p>
                    <p>
                        <CharBlurText>
                            I’VE LIVED ACROSS EUROPE, COLLECTED HABITS AND PERSPECTIVES FROM EVERY PLACE I’VE CALLED HOME, AND LEARNED THAT THE BEST IDEAS COME WHEN YOU’RE WILLING TO QUESTION EVERYTHING — INCLUDING YOURSELF.
                        </CharBlurText>
                    </p>
                    <p>
                        <CharBlurText>
                            AUTHENTIC, LIGHT-HEARTED, AND ENDLESSLY CURIOUS. CURRENTLY BASED IN ITALY, ALWAYS SOMEWHERE IN MY HEAD.
                        </CharBlurText>
                    </p>

                    <h3><CharBlurText>WHAT I DO</CharBlurText></h3>
                    <p>
                        <CharBlurText>
                            I DESIGN INTERFACES, BUILD WEBSITES, ANIMATE IDEAS, AND SHAPE THE VISUAL VOICE OF BRANDS.
                        </CharBlurText>
                    </p>

                    <h3><CharBlurText>HOW I WORK</CharBlurText></h3>
                    <p>
                        <CharBlurText>
                            FIGMA AND PAPER HOLD THE FIRST SKETCH OF AN IDEA. FRAMER GIVES IT MOVEMENT — BUILT ALONGSIDE CLAUDE AND ANTIGRAVITY, WHO I TALK TO AS MUCH AS I DIRECT. AND WHEN AN IMAGE EXISTS ONLY IN MY HEAD, HIGGSFIELD AND REVE HELP ME PULL IT INTO THE LIGHT.
                        </CharBlurText>
                    </p>

                    <ul className="tool-pills" aria-label="Tools used">
                        <li><CharBlurText>FIGMA</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>PAPER</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>FRAMER</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>CLAUDE</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>ANTIGRAVITY</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>HIGGSFIELD AI</CharBlurText></li>
                        <li className="tool-dot" aria-hidden="true"></li>
                        <li><CharBlurText>REVE</CharBlurText></li>
                    </ul>
                </article>

                <footer className="contact-footer" id="contact">
                    <p className="contact-intro">
                        <CharBlurText>
                            Open to freelance, collaborations, and full-time roles, but mostly open to good work with good people.
                        </CharBlurText>
                    </p>
                    <p className="contact-item">
                        <span className="contact-label"><CharBlurText>EMAIL:</CharBlurText> </span>
                        <a href="mailto:madorinidesign@gmail.com" className="contact-link">
                            <CharBlurText>madorinidesign@gmail.com</CharBlurText>
                        </a>
                    </p>
                    <p className="contact-item">
                        <span className="contact-label"><CharBlurText>LINKEDIN:</CharBlurText> </span>
                        <a
                            href="https://www.linkedin.com/in/veronica-madorini"
                            target="_blank"
                            rel="noreferrer"
                            className="contact-link"
                        >
                            <CharBlurText>www.linkedin.com/in/veronica-madorini</CharBlurText>
                        </a>
                    </p>
                    <p className="contact-item">
                        <span className="contact-label" style={{ display: 'inline-flex', alignItems: 'center' }} aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </span>
                        <a
                            href="https://www.instagram.com/madorinidesign"
                            target="_blank"
                            rel="noreferrer"
                            className="contact-link"
                        >
                            <CharBlurText>@madorinidesign</CharBlurText>
                        </a>
                    </p>
                </footer>
            </section>

            {selectedProject && (
                <ProjectOverlayFrame 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                />
            )}

        </main>
        <ScrollBlurBottom />
    </React.Fragment>
);
}
