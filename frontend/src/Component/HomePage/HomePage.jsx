import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const COLORS = ['#facc15', '#ec4899', '#14b8a6', '#2563eb', '#fb923c', '#22c55e', '#ffffff']
const WORDS = ['Create', 'Explore', 'Connect', 'Share', 'Grow', 'Imagine']

const FEATURES = [
    { icon: '⚡', title: 'Lightning Fast', text: 'Smooth, quick and responsive on every device you use.', cls: 'fOne' },
    { icon: '🔒', title: 'Safe & Secure', text: 'Your account is protected with verified login and OTP.', cls: 'fTwo' },
    { icon: '🎨', title: 'Beautiful Design', text: 'A colorful, friendly look that makes everything a joy.', cls: 'fThree' },
]

const HomePage = () => {
    const mainRef = useRef(null)
    const [bursts, setBursts] = useState([])

    // Mouse parallax: floating shapes follow the cursor
    const handleMove = (e) => {
        const el = mainRef.current
        if (!el) return
        el.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5) * 2)
        el.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5) * 2)
    }

    // Colorful particle burst
    const createBurst = (x, y) => {
        const id = Date.now() + Math.random()
        const count = 16
        const parts = Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
            const dist = 60 + Math.random() * 80
            return {
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist,
                size: 8 + Math.random() * 10,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            }
        })
        setBursts((b) => [...b, { id, x, y, parts }])
        setTimeout(() => setBursts((b) => b.filter((item) => item.id !== id)), 1000)
    }

    const handleClick = (e) => createBurst(e.clientX, e.clientY)

    // "Surprise me" button fires several bursts at random spots
    const surprise = (e) => {
        e.stopPropagation()
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                createBurst(
                    80 + Math.random() * (window.innerWidth - 160),
                    80 + Math.random() * (window.innerHeight - 160)
                )
            }, i * 150)
        }
    }

    // 3D tilt for cards
    const tilt = (e) => {
        const card = e.currentTarget
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.setProperty('--rx', `${-y * 14}deg`)
        card.style.setProperty('--ry', `${x * 14}deg`)
    }

    const untilt = (e) => {
        e.currentTarget.style.setProperty('--rx', '0deg')
        e.currentTarget.style.setProperty('--ry', '0deg')
    }

    return (
        <div className={styles.main} ref={mainRef} onMouseMove={handleMove} onClick={handleClick}>
            {/* Background glow blobs */}
            <div className={`${styles.blob} ${styles.blobOne}`} />
            <div className={`${styles.blob} ${styles.blobTwo}`} />

            {/* Floating shapes (follow the mouse) */}
            <span className={`${styles.shape} ${styles.circle}`} />
            <span className={`${styles.shape} ${styles.ring}`} />
            <span className={`${styles.shape} ${styles.square}`} />
            <span className={`${styles.shape} ${styles.dot}`} />
            <span className={`${styles.shape} ${styles.star}`}>✦</span>
            <span className={`${styles.shape} ${styles.ring2}`} />

            {/* Hero */}
            <section className={styles.hero}>
                <span className={styles.badge}>✨ Welcome</span>
                <h1 className={styles.title}>
                    Make Something <span className={styles.gradientText}>Amazing</span>
                </h1>
                <p className={styles.subtitle}>
                    Move your mouse, click anywhere and watch the page come alive.
                </p>

                <div className={styles.actions}>
                    <Link to="/" className={`${styles.btn} ${styles.btnPrimary}`} onClick={(e) => e.stopPropagation()}>
                        Get Started
                    </Link>
                    <button type="button" className={`${styles.btn} ${styles.btnGlass}`} onClick={surprise}>
                        ✨ Surprise Me
                    </button>
                </div>

                <p className={styles.hint}>
                    <span className={styles.hintDot} /> Click anywhere to make some magic
                </p>
            </section>

            {/* Scrolling words */}
            <section className={styles.marquee}>
                <div className={styles.track}>
                    {[...WORDS, ...WORDS, ...WORDS, ...WORDS].map((w, i) => (
                        <span key={i} className={styles.word}>
                            {w} <span className={styles.sep}>✦</span>
                        </span>
                    ))}
                </div>
            </section>

            {/* Feature cards (3D tilt) */}
            <section className={styles.cards}>
                {FEATURES.map((f) => (
                    <div
                        key={f.title}
                        className={`${styles.card} ${styles[f.cls]}`}
                        onMouseMove={tilt}
                        onMouseLeave={untilt}
                    >
                        <div className={styles.icon}>{f.icon}</div>
                        <h3 className={styles.cardTitle}>{f.title}</h3>
                        <p className={styles.cardText}>{f.text}</p>
                    </div>
                ))}
            </section>

            {/* Click bursts */}
            <div className={styles.burstLayer}>
                {bursts.map((b) => (
                    <div key={b.id} className={styles.burst} style={{ left: b.x, top: b.y }}>
                        {b.parts.map((p, i) => (
                            <span
                                key={i}
                                className={styles.particle}
                                style={{
                                    '--dx': `${p.dx}px`,
                                    '--dy': `${p.dy}px`,
                                    width: p.size,
                                    height: p.size,
                                    background: p.color,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HomePage