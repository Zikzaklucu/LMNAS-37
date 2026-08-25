const styles = `
html { box-sizing: border-box; margin: 0; min-height: 100%; }
*, *::before, *::after { box-sizing: inherit; }
:root {
  --text: #6b6375; --text-h: #08060d; --bg: #fff; --border: #e5e4e7;
  --code-bg: #f4f3ec; --accent: #aa3bff; --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5); --social-bg: rgba(244, 243, 236, 0.5);
  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  font: 18px/145% var(--sans); letter-spacing: 0.18px; color-scheme: light dark;
  color: var(--text); background: var(--bg); font-synthesis: none;
  text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body { margin: 0; min-height: 100vh; background: #f3d685; color: #1a1a1a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
button, a { font: inherit; }
#root { width: 1126px; max-width: 100%; margin: 0 auto; text-align: center; border-inline: 1px solid var(--border); min-height: 100vh; display: flex; flex-direction: column; }
.faq-page { min-height: 100vh; position: relative; overflow: hidden; background: #f3d685; color: #0f1d0b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.faq-page::before { content: ''; position: absolute; inset: 0; background-image: url('https://www.figma.com/api/mcp/asset/a3ab65d0-1567-498a-a291-0bedee2ae9ce.png'); background-size: cover; background-position: center; opacity: 0.38; mix-blend-mode: multiply; pointer-events: none; }
.topbar, .faq-shell, .partners { position: relative; z-index: 1; }
.topbar { height: 112px; display: flex; align-items: center; padding: 0 3rem 0 2.2rem; background: rgba(62, 85, 38, 0.98); box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2); }
.brand-mark { width: 72px; height: 74px; display: grid; place-items: center; background-image: url('https://www.figma.com/api/mcp/asset/429f3de8-265a-4e10-901f-5d15b8947b64.png'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25)); }
.brand-mark span { opacity: 0; }
.main-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 1.5rem; margin-left: 3.35rem; font-size: 1.1rem; font-family: 'Trebuchet MS', 'Segoe UI', sans-serif; color: #fff; }
.main-nav a { color: #fff; text-decoration: none; opacity: 0.98; text-shadow: 0 0 4px rgba(0, 0, 0, 0.25); transition: opacity 0.2s ease; }
.main-nav a:hover, .main-nav a.is-active { opacity: 1; }
.faq-shell { max-width: 1280px; margin: 0 auto; padding: 2.5rem 1rem 0; }
.faq-shell h1 { margin: 0; text-align: center; font-size: clamp(5rem, 8vw, 10rem); line-height: 0.88; letter-spacing: 0.06em; font-weight: 900; color: #2f4d1f; font-family: 'Impact', 'Arial Black', sans-serif; text-transform: uppercase; transform: scaleY(1.15) translateY(-8px); text-shadow: 0 3px 0 rgba(110, 127, 74, 0.4); }
.faq-list { margin-top: 1.8rem; padding-bottom: 2.2rem; }
.faq-item { width: min(1059px, calc(100% - 80px)); margin: 0 auto 2.25rem; filter: drop-shadow(0 4px 0 rgba(62, 85, 38, 0.6)); }
.faq-header { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 81px; padding: 1rem 1.8rem 1rem 2rem; border: 1px solid #3e5526; border-bottom: none; border-radius: 19px 19px 0 0; background: #c08529; }
.faq-item h2 { margin: 0; color: #fff; font-size: clamp(1.5rem, 2.2vw, 2.5rem); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 700; font-family: 'Impact', 'Arial Black', sans-serif; line-height: 1.1; }
.faq-toggle { border: none; background: transparent; color: #fff; font-size: 3rem; line-height: 1; cursor: pointer; transform: translateY(-4px); padding: 0; }
.faq-item p { margin: 0; padding: 1.8rem 2.2rem 1.6rem; border: 9px solid #3e5526; border-top: none; border-radius: 0 0 31px 31px; background: rgba(250, 220, 154, 0.92); color: #1a1a1a; font-size: 1.12rem; line-height: 1.7; text-align: justify; font-weight: 500; }
.faq-item:not(.is-open) p { display: none; }
.partners { position: relative; margin-top: 0.7rem; background: rgba(58, 78, 40, 0.08); border-top: 2px solid rgba(62, 85, 38, 0.2); padding: 1.4rem 0 2.4rem; }
.partners::after { content: ''; position: absolute; right: 0; bottom: 0; width: min(32vw, 440px); height: 240px; background-image: url('https://www.figma.com/api/mcp/asset/b5c9d8ea-37c0-403c-9515-4b2865eb6211.svg'); background-size: cover; background-position: center; opacity: 0.9; pointer-events: none; }
.partner-row { display: flex; justify-content: center; gap: clamp(3rem, 10vw, 16rem); align-items: center; margin-bottom: 1.2rem; position: relative; z-index: 1; }
.partner-label { color: #3e5526; font-size: clamp(2rem, 2.7vw, 4rem); font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-family: 'Impact', 'Arial Black', sans-serif; line-height: 1; }
.social-list { position: relative; z-index: 1; display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem 2.2rem; padding: 0 1rem; max-width: 1200px; margin: 0 auto; }
.social-item { display: flex; align-items: center; gap: 0.8rem; min-width: 240px; color: #1d3d1c; font-size: 0.9rem; font-weight: 700; font-family: 'Segoe UI', sans-serif; }
.social-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: rgba(62, 85, 38, 0.14); border: 2px solid rgba(62, 85, 38, 0.5); font-size: 1.2rem; color: #23441b; }
@media (max-width: 1024px) { :root { font-size: 16px; } }
@media (max-width: 900px) {
  .topbar { flex-direction: column; justify-content: center; height: auto; padding: 0.55rem 1rem 1.1rem; gap: 0.35rem; }
  .brand-mark { flex: 0 0 auto; }
  .main-nav { justify-content: center; margin-left: 0; font-size: 0.95rem; gap: 0.8rem 1rem; width: 100%; }
  .faq-item { width: min(92vw, 700px); }
  .faq-header { padding: 1rem 1.1rem; }
  .faq-item p { padding: 1.1rem 1.2rem; font-size: 1rem; }
  .partner-row { flex-direction: column; gap: 0.6rem; }
  .partners::after { width: 220px; height: 150px; }
}
`

const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)

const navItems = ['Home', 'Daftar', 'Pengumuman', 'Contact', 'Silabus', 'Buku Panduan', 'Peraturan', 'FAQ']
const answer = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const faqItems = [answer, answer, answer]
const socialLinks = [
  ['LMNAS DAN SEMNASTIKA UGM', 'f'],
  ['@LMNAS_SEMNAS', 'x'],
  ['@LMNAS_SEMNAS', '◎'],
  ['SEMNASTIKA.FMIPA.UGM.AC.ID', '☎'],
]

const root = document.querySelector('#root')

root.innerHTML = `
  <div class="faq-page">
    <header class="topbar">
      <div class="brand-mark" aria-label="Brand logo"><span>W</span></div>
      <nav class="main-nav" aria-label="Main navigation">
        ${navItems.map((item) => `<a href="#" class="${item === 'FAQ' ? 'is-active' : ''}">${item}</a>`).join('')}
      </nav>
    </header>
    <main class="faq-shell">
      <h1>FAQ</h1>
      <div class="faq-list">
        ${faqItems.map((item, index) => `
            <section class="faq-item is-open" data-faq="${index}">
            <div class="faq-header">
              <h2>PERTANYAAN</h2>
              <button type="button" class="faq-toggle" aria-label="Toggle question ${index + 1}" aria-expanded="true">↓</button>
            </div>
            <p>${item}</p>
          </section>
        `).join('')}
      </div>
    </main>
    <footer class="partners">
      <div class="partner-row">
        <div class="partner-label">SPONSORED BY:</div>
        <div class="partner-label partner-label-right">MEDIA PARTNER:</div>
      </div>
      <div class="social-list" aria-label="Sponsors and media partners">
        ${socialLinks.map(([label, icon]) => `<div class="social-item"><div class="social-icon" aria-hidden="true">${icon}</div><span>${label}</span></div>`).join('')}
      </div>
    </footer>
  </div>
`

document.querySelectorAll('.faq-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item')
    const isOpen = item.classList.toggle('is-open')
    button.setAttribute('aria-expanded', String(isOpen))
    button.textContent = isOpen ? '↓' : '→'
  })
})

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault())
})
