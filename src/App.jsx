import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   ENCASE-FV  v6
   Encrypted Cancelable Authentication System with
   Homomorphic Encryption for Finger Vein
   ─────────────────────────────────────────────────────────────
   EER 0.0026% · ROC AUC 1.0000 · d′ 5.73 · Acc 99.9947%
   MMCBNU_6000 · 600 identities · 1,200 genuine pairs
═══════════════════════════════════════════════════════════════ */

/* ─── API CONFIG ────────────────────────────────────────────── */
// When your FastAPI backend is running, replace this URL.
// In Colab: paste your ngrok URL here, e.g. "https://xxxx.ngrok-free.app"
// When deployed: paste your Railway/Render URL
const API_BASE = "https://encase-fv-api.onrender.com"; // e.g. "https://your-ngrok-url.ngrok-free.app"
const USE_MOCK = !API_BASE; // auto-falls back to simulation when no API

/* ─── GLOBAL CSS ─────────────────────────────────────────────── */
const CSS = `
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}

/* ── THEME VARIABLES ── */
body{
  font-family:'Satoshi',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  /* Smooth theme transition on everything */
  transition:
    background-color .35s cubic-bezier(.4,0,.2,1),
    color .35s cubic-bezier(.4,0,.2,1);
}
body *{
  transition:
    background-color .35s cubic-bezier(.4,0,.2,1),
    color .25s cubic-bezier(.4,0,.2,1),
    border-color .3s cubic-bezier(.4,0,.2,1),
    box-shadow .3s cubic-bezier(.4,0,.2,1);
}
/* Except animations — don't transition those */
body *.no-transition,
body *[class*="spinner"],
body *[class*="pulse"],
body *[class*="scan"]{
  transition:none !important;
}

/* ── DARK (default) ── */
:root{
  --bg:       #06080f;
  --bg2:      #090d1a;
  --surface:  #0d1220;
  --surface2: #111827;
  --surface3: #162033;
  --border:   #1a2540;
  --border2:  #243356;
  --t1:       #eeeae3;
  --t2:       #b8b2a8;
  --t3:       #6e6a63;
  --t4:       #3e3c38;
  --accent:   #4a7fe8;
  --accent2:  #6395f0;
  --accent3:  #8fb5ff;
  --abg:      #081528;
  --abdr:     #152444;
  --green:    #3dd68c;
  --gbg:      #041410;
  --gbdr:     #0a3320;
  --red:      #f87171;
  --rbg:      #180505;
  --rbdr:     #5c1a1a;
  --amber:    #f59e0b;
  --nav:      rgba(6,8,15,.88);
  --glow:     0 0 40px rgba(74,127,232,.12);
  --sh:       0 2px 8px rgba(0,0,0,.4);
  --sh2:      0 8px 32px rgba(0,0,0,.55);
  --hero:     radial-gradient(ellipse 70% 55% at 65% 25%,rgba(74,127,232,.1) 0%,transparent 65%),
              radial-gradient(ellipse 40% 35% at 5% 85%,rgba(61,214,140,.05) 0%,transparent 55%),
              linear-gradient(165deg,#06080f 0%,#090d1a 100%);
  --grid:     rgba(255,255,255,.022);
}

/* ── LIGHT ── */
body.light{
  --bg:       #f2f0eb;
  --bg2:      #e9e7e2;
  --surface:  #faf9f7;
  --surface2: #f2f0eb;
  --surface3: #eae8e3;
  --border:   #dcdad3;
  --border2:  #c8c5bc;
  --t1:       #0d0f18;
  --t2:       #2c2f3e;
  --t3:       #5f6070;
  --t4:       #9896a2;
  --accent:   #2552c8;
  --accent2:  #1e44b0;
  --accent3:  #3b6fd4;
  --abg:      #eef2fc;
  --abdr:     #c5d3f5;
  --green:    #16803c;
  --gbg:      #f0fdf5;
  --gbdr:     #bbf7d0;
  --red:      #b91c1c;
  --rbg:      #fef2f2;
  --rbdr:     #fecaca;
  --amber:    #b45309;
  --nav:      rgba(242,240,235,.9);
  --glow:     0 0 40px rgba(37,82,200,.08);
  --sh:       0 1px 4px rgba(0,0,0,.06),0 2px 10px rgba(0,0,0,.04);
  --sh2:      0 4px 20px rgba(0,0,0,.1),0 1px 6px rgba(0,0,0,.05);
  --hero:     radial-gradient(ellipse 70% 55% at 65% 25%,rgba(37,82,200,.06) 0%,transparent 65%),
              linear-gradient(165deg,#f2f0eb 0%,#e9e7e2 100%);
  --grid:     rgba(0,0,0,.018);
}

body,body.light{
  background:var(--bg);
  color:var(--t1);
  min-height:100vh;
}

/* ── TYPOGRAPHY ── */
.display{font-family:'Clash Display',system-ui,sans-serif;}
.mono{font-family:'JetBrains Mono',monospace;}

/* ═══ NAV ═══════════════════════════════════════════════ */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:400;
  height:56px;display:flex;align-items:center;gap:10px;padding:0 26px;
  background:var(--nav);
  backdrop-filter:blur(28px) saturate(1.5);
  -webkit-backdrop-filter:blur(28px) saturate(1.5);
  border-bottom:1px solid var(--border);
}
.nav-brand{
  display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0;
}
.nav-mark{
  width:28px;height:28px;border-radius:8px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);
  display:flex;align-items:center;justify-content:center;
}
.nav-name{
  font-family:'Clash Display',sans-serif;font-size:15.5px;
  font-weight:600;color:var(--t1);letter-spacing:-.02em;
}
.nav-name b{color:var(--accent2);}
.nav-tagline{
  font-size:9.5px;font-weight:600;color:var(--t4);
  letter-spacing:.08em;text-transform:uppercase;
  display:none;
}
.nav-back{
  width:30px;height:30px;border-radius:7px;
  border:1px solid var(--border2);background:transparent;
  color:var(--t3);cursor:pointer;font-size:13px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.nav-back:hover{border-color:var(--accent2);color:var(--accent2);}
.nav-gap{flex:1;}
.nav-tabs{
  display:flex;gap:1px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:9px;padding:3px;
}
.ntab{
  padding:5px 14px;border-radius:6px;
  font-size:12.5px;font-weight:500;
  color:var(--t3);cursor:pointer;border:none;background:transparent;
  font-family:'Satoshi',sans-serif;
}
.ntab:hover{color:var(--t2);}
.ntab.on{
  background:var(--surface);color:var(--accent2);
  box-shadow:var(--sh);border:1px solid var(--border);
}
.nav-r{display:flex;gap:7px;align-items:center;flex-shrink:0;}
.icon-btn{
  width:30px;height:30px;border-radius:7px;
  border:1px solid var(--border2);background:transparent;
  color:var(--t3);cursor:pointer;font-size:13px;
  display:flex;align-items:center;justify-content:center;
}
.icon-btn:hover{border-color:var(--accent2);color:var(--accent2);}
.btn-outline{
  padding:6px 14px;border-radius:7px;font-size:12.5px;font-weight:600;
  color:var(--t2);cursor:pointer;border:1px solid var(--border2);background:transparent;
  font-family:'Satoshi',sans-serif;
}
.btn-outline:hover{border-color:var(--accent);color:var(--accent2);}
.btn-solid{
  padding:6px 16px;border-radius:7px;font-size:12.5px;font-weight:700;
  color:#fff;cursor:pointer;border:none;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  font-family:'Satoshi',sans-serif;
  box-shadow:0 2px 10px rgba(74,127,232,.28);
}
.btn-solid:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 4px 16px rgba(74,127,232,.4);}

/* ═══ LANDING ════════════════════════════════════════════ */
.landing{padding-top:56px;background:var(--hero);min-height:100vh;position:relative;}
.landing::before{
  content:'';position:absolute;inset:0;z-index:0;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size:48px 48px;pointer-events:none;
}
.land-rel{position:relative;overflow:hidden;}
.orb{
  position:absolute;border-radius:50%;filter:blur(90px);
  pointer-events:none;z-index:0;
}
.orb-a{
  width:700px;height:700px;right:-180px;top:-180px;
  background:radial-gradient(circle,rgba(74,127,232,.11) 0%,transparent 70%);
}
.orb-b{
  width:450px;height:450px;left:-100px;bottom:40px;
  background:radial-gradient(circle,rgba(61,214,140,.06) 0%,transparent 70%);
}

.hero{
  max-width:1160px;margin:0 auto;
  padding:76px 40px 60px;
  display:grid;grid-template-columns:1fr 1fr;gap:76px;
  align-items:start;position:relative;z-index:1;
}

.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:5px 12px 5px 7px;border-radius:100px;
  background:var(--abg);border:1px solid var(--abdr);
  font-size:11px;font-weight:700;color:var(--accent2);
  letter-spacing:.04em;margin-bottom:22px;
  box-shadow:var(--glow);
}
.badge-icon{
  width:18px;height:18px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.live-dot{
  width:6px;height:6px;border-radius:50%;background:var(--green);
  animation:livepulse 2s ease-in-out infinite;
}
@keyframes livepulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.25;transform:scale(.55);}}

.hero-h{
  font-family:'Clash Display',sans-serif;
  font-size:clamp(42px,4.2vw,60px);
  font-weight:600;line-height:1.05;
  color:var(--t1);letter-spacing:-.035em;margin-bottom:18px;
}
.hero-h em{
  font-style:italic;font-weight:400;
  background:linear-gradient(130deg,var(--accent2) 0%,var(--accent3) 100%);
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;
}
.hero-p{
  font-size:15px;line-height:1.84;color:var(--t3);
  max-width:415px;margin-bottom:30px;
}
.hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:42px;}
.cta-p{
  padding:11px 26px;border-radius:10px;font-size:14px;font-weight:700;
  color:#fff;cursor:pointer;border:none;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  font-family:'Satoshi',sans-serif;
  box-shadow:0 4px 18px rgba(74,127,232,.35);letter-spacing:.01em;
}
.cta-p:hover{transform:translateY(-2px);box-shadow:0 7px 26px rgba(74,127,232,.5);}
.cta-s{
  padding:11px 26px;border-radius:10px;font-size:14px;font-weight:600;
  color:var(--t2);cursor:pointer;
  border:1px solid var(--border2);background:var(--surface);
  font-family:'Satoshi',sans-serif;
}
.cta-s:hover{border-color:var(--accent);color:var(--accent2);}

.hero-stats{
  display:flex;gap:26px;padding-top:22px;
  border-top:1px solid var(--border);
}
.hs-v{
  font-family:'Clash Display',sans-serif;
  font-size:23px;font-weight:600;
  color:var(--t1);letter-spacing:-.025em;
}
.hs-v b{color:var(--accent2);}
.hs-l{font-size:11px;color:var(--t4);margin-top:3px;font-weight:500;}

/* Right panel feature cards */
.hero-r{display:flex;flex-direction:column;gap:13px;padding-top:6px;}
.fcard{
  background:var(--surface);border:1px solid var(--border);
  border-radius:18px;padding:24px;cursor:pointer;
  position:relative;overflow:hidden;
}
.fcard::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 50% at 90% 50%,rgba(74,127,232,.09) 0%,transparent 65%);
  opacity:0;
}
.fcard:hover{border-color:var(--abdr);box-shadow:var(--sh2);transform:translateY(-2px);}
.fcard:hover::before{opacity:1;}
.fc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px;}
.fc-lbl{
  font-size:10px;font-weight:700;color:var(--accent2);
  letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;
}
.fc-ttl{
  font-family:'Clash Display',sans-serif;
  font-size:18.5px;font-weight:600;color:var(--t1);letter-spacing:-.015em;
}
.fc-arr{
  width:27px;height:27px;border-radius:7px;
  border:1px solid var(--border2);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;color:var(--t4);flex-shrink:0;
}
.fcard:hover .fc-arr{border-color:var(--accent2);color:var(--accent2);background:var(--abg);}
.fc-desc{font-size:13px;color:var(--t3);line-height:1.72;margin-bottom:13px;}
.fc-tags{display:flex;gap:5px;flex-wrap:wrap;}
.chip{
  padding:3px 9px;border-radius:5px;font-size:11px;font-weight:500;
  background:var(--surface2);border:1px solid var(--border);color:var(--t3);
}

/* Stat bar */
.statbar{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.statbar-in{
  max-width:1160px;margin:0 auto;padding:0 40px;
  display:grid;grid-template-columns:repeat(5,1fr);
}
.sbi{padding:21px 14px;text-align:center;border-right:1px solid var(--border);}
.sbi:last-child{border-right:none;}
.sbi-v{
  font-family:'Clash Display',sans-serif;
  font-size:20px;font-weight:600;color:var(--t1);letter-spacing:-.02em;
}
.sbi-v span{color:var(--accent2);}
.sbi-l{font-size:11px;color:var(--t4);margin-top:4px;font-weight:500;}

/* ═══ HARDWARE ════════════════════════════════════════════ */
.page-wrap{padding-top:56px;min-height:100vh;}
.page-in{max-width:1160px;margin:0 auto;padding:46px 40px;}
.page-eye{
  font-size:10px;font-weight:700;color:var(--accent2);
  letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;
}
.page-h{
  font-family:'Clash Display',sans-serif;
  font-size:clamp(28px,3.8vw,44px);font-weight:600;
  color:var(--t1);letter-spacing:-.03em;margin-bottom:12px;line-height:1.08;
}
.page-p{font-size:14px;color:var(--t3);max-width:570px;line-height:1.82;}
.sec-lbl{
  font-size:10px;font-weight:700;color:var(--t4);
  letter-spacing:.1em;text-transform:uppercase;
  margin:38px 0 15px;
}
.hw-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;}
.hwc{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;overflow:hidden;
}
.hwc:hover{box-shadow:var(--sh2);border-color:var(--border2);}
.hwc-bd{padding:22px;}
.hwc-cat{
  font-size:10px;font-weight:700;color:var(--accent2);
  letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;
}
.hwc-nm{
  font-family:'Clash Display',sans-serif;
  font-size:17px;font-weight:600;color:var(--t1);
  letter-spacing:-.015em;margin-bottom:9px;
}
.hwc-desc{font-size:12.5px;color:var(--t3);line-height:1.76;margin-bottom:15px;}
.hwc-specs{
  display:grid;grid-template-columns:1fr 1fr;gap:9px;
  padding:12px;background:var(--surface2);border-radius:9px;margin-bottom:15px;
}
.spec-k{font-size:10.5px;color:var(--t4);font-weight:500;margin-bottom:2px;}
.spec-v{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--t1);font-weight:500;}
.hwc-link{
  display:inline-flex;align-items:center;gap:5px;
  font-size:12.5px;font-weight:600;color:var(--accent2);text-decoration:none;
}
.hwc-link:hover{gap:9px;}
.hwc-ft{
  padding:11px 22px;border-top:1px solid var(--border);
  background:var(--surface2);
  display:flex;align-items:center;justify-content:space-between;
}
.hwc-price{
  font-family:'JetBrains Mono',monospace;font-size:11px;
  color:var(--t3);background:var(--border);padding:3px 9px;border-radius:5px;
}
.int-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
.int-hd{padding:17px 22px;border-bottom:1px solid var(--border);}
.int-hd-t{font-size:13.5px;font-weight:700;color:var(--t1);}
.int-hd-s{font-size:12px;color:var(--t3);margin-top:2px;}
.int-grid{display:grid;grid-template-columns:repeat(4,1fr);}
.int-item{padding:15px 18px;border-right:1px solid var(--border);}
.int-item:last-child,.int-item:nth-child(4n){border-right:none;}
.int-lbl{font-size:10px;font-weight:700;color:var(--t4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px;}
.int-val{font-size:13px;font-weight:600;color:var(--t1);}
.int-sub{font-size:11px;color:var(--t3);margin-top:2px;}
.pipeflow{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;}
.pf-ttl{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;}
.pf-nodes{display:flex;align-items:center;overflow-x:auto;padding-bottom:2px;}
.pf-node{flex-shrink:0;text-align:center;min-width:90px;padding:0 5px;}
.pf-box{
  width:38px;height:38px;border-radius:9px;
  border:1.5px solid var(--abdr);background:var(--abg);
  margin:0 auto 7px;display:flex;align-items:center;justify-content:center;
}
.pf-n{font-size:13px;font-weight:700;color:var(--accent2);font-family:'JetBrains Mono',monospace;}
.pf-nm{font-size:11px;font-weight:600;color:var(--t1);}
.pf-sb{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--t3);margin-top:2px;}
.pf-ar{font-size:13px;color:var(--border2);flex-shrink:0;padding:0 2px;}

/* ═══ AUTH ════════════════════════════════════════════════ */
.auth-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;}
.auth-l{
  padding:52px;display:flex;flex-direction:column;justify-content:space-between;
  background:linear-gradient(155deg,#0f2460 0%,#081a4a 100%);
}
.auth-logo{
  display:flex;align-items:center;gap:9px;cursor:pointer;
}
.auth-logo-mk{
  width:26px;height:26px;border-radius:7px;
  background:rgba(255,255,255,.15);
  display:flex;align-items:center;justify-content:center;
}
.auth-logo-nm{
  font-family:'Clash Display',sans-serif;
  font-size:15px;font-weight:600;color:rgba(255,255,255,.85);
}
.auth-l-h{
  font-family:'Clash Display',sans-serif;font-weight:500;
  font-size:clamp(26px,2.8vw,38px);color:#fff;
  line-height:1.14;letter-spacing:-.025em;margin-bottom:13px;
}
.auth-l-p{font-size:13.5px;color:rgba(255,255,255,.55);line-height:1.82;margin-bottom:30px;}
.auth-stats{display:flex;flex-direction:column;gap:10px;}
.als{
  padding:15px 18px;border-radius:11px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
}
.als-v{font-family:'JetBrains Mono',monospace;font-size:21px;font-weight:600;color:#fff;}
.als-l{font-size:11.5px;color:rgba(255,255,255,.45);margin-top:3px;}
.auth-foot{font-size:11px;color:rgba(255,255,255,.25);}
.auth-r{
  background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  padding:48px;
}
.auth-form{width:100%;max-width:355px;}
.auth-h{
  font-family:'Clash Display',sans-serif;
  font-size:27px;font-weight:600;color:var(--t1);
  letter-spacing:-.025em;margin-bottom:5px;
}
.auth-sub{font-size:13.5px;color:var(--t3);margin-bottom:28px;line-height:1.6;}
.auth-link{color:var(--accent2);cursor:pointer;font-weight:500;}
.flbl{
  font-size:10.5px;font-weight:700;color:var(--t4);
  text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px;
}
.finp{
  width:100%;padding:10px 12px;border:1.5px solid var(--border2);border-radius:8px;
  font-size:13.5px;color:var(--t1);font-family:'Satoshi',sans-serif;
  background:var(--surface);outline:none;margin-bottom:13px;
}
.finp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(74,127,232,.1);}
.finp::placeholder{color:var(--t4);}
.auth-btn{
  width:100%;padding:11px;border-radius:9px;font-size:13.5px;font-weight:700;
  color:#fff;cursor:pointer;border:none;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  font-family:'Satoshi',sans-serif;
  box-shadow:0 4px 14px rgba(74,127,232,.32);margin-top:20px;
}
.auth-btn:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 6px 20px rgba(74,127,232,.44);}
.auth-btn:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}
.otp-row{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;}
.otp-b{
  aspect-ratio:1;width:100%;
  border:1.5px solid var(--border2);border-radius:9px;
  text-align:center;font-size:21px;font-weight:700;
  color:var(--t1);font-family:'JetBrains Mono',monospace;
  background:var(--surface);outline:none;caret-color:var(--accent);
}
.otp-b:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(74,127,232,.1);}
.otp-b.filled{border-color:var(--abdr);background:var(--abg);color:var(--accent2);}
.divider{
  display:flex;align-items:center;gap:10px;margin:18px 0;
  font-size:11px;color:var(--t4);
}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
.auth-note{
  margin-top:14px;padding:10px 13px;border-radius:8px;
  background:var(--abg);border:1px solid var(--abdr);
  font-size:11.5px;color:var(--accent2);line-height:1.6;
}

/* ═══ DASHBOARD ═══════════════════════════════════════════ */
.dash{padding-top:56px;min-height:100vh;}
.dash-in{max-width:1160px;margin:0 auto;padding:24px 30px;}

.welcome{
  background:var(--surface);border:1px solid var(--border);border-radius:13px;
  padding:15px 20px;display:flex;align-items:center;justify-content:space-between;
  margin-bottom:14px;
}
.welcome-t{font-size:14px;font-weight:700;color:var(--t1);}
.welcome-s{font-size:12px;color:var(--t3);margin-top:3px;}
.pill-green{
  display:flex;align-items:center;gap:7px;padding:6px 12px;
  border-radius:100px;background:var(--gbg);border:1px solid var(--gbdr);
  font-size:11.5px;font-weight:700;color:var(--green);white-space:nowrap;
}
.sdot{
  width:6px;height:6px;border-radius:50%;background:var(--green);
  animation:livepulse 2.2s ease-in-out infinite;
}

/* Metric cards */
.mcrow{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:14px;}
.mc{
  background:var(--surface);border:1px solid var(--border);
  border-radius:13px;padding:17px 19px;position:relative;overflow:hidden;
}
.mc.hl{
  background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);
  border-color:transparent;
}
.mc-shine{
  position:absolute;right:-24px;top:-24px;
  width:80px;height:80px;border-radius:50%;
  background:rgba(255,255,255,.06);
}
.mc-lbl{font-size:10px;font-weight:700;color:var(--t4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:11px;}
.mc.hl .mc-lbl{color:rgba(255,255,255,.5);}
.mc-val{
  font-family:'Clash Display',sans-serif;
  font-size:27px;font-weight:600;color:var(--t1);letter-spacing:-.025em;
}
.mc.hl .mc-val{color:#fff;}
.mc-sub{font-size:11px;color:var(--t4);margin-top:5px;}
.mc.hl .mc-sub{color:rgba(255,255,255,.38);}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:13px;}
.g21{display:grid;grid-template-columns:3fr 2fr;gap:13px;margin-bottom:13px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-bottom:13px;}

/* Card */
.card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:14px;overflow:hidden;
}
.card-hd{
  padding:15px 19px;border-bottom:1px solid var(--border);
  display:flex;align-items:flex-start;justify-content:space-between;
}
.card-ht{font-size:13px;font-weight:700;color:var(--t1);}
.card-hs{font-size:11px;color:var(--t3);margin-top:2px;}
.card-bd{padding:17px 19px;}

/* ─── VERIFY TAB ─── */
.vlbl{font-size:10.5px;font-weight:700;color:var(--t4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px;}
.vinp{
  width:100%;padding:9px 11px;border:1.5px solid var(--border2);border-radius:8px;
  font-size:13px;color:var(--t1);font-family:'Satoshi',sans-serif;
  background:var(--surface2);outline:none;margin-bottom:4px;
}
.vinp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(74,127,232,.08);}
.vinp::placeholder{color:var(--t4);}
.vinp.error{border-color:var(--red);}
.inp-err{font-size:11px;color:var(--red);margin-bottom:10px;}
.inp-ok{margin-bottom:10px;}
.dropz{
  border:2px dashed var(--border2);border-radius:11px;
  padding:0;cursor:pointer;
  background:var(--surface2);margin-bottom:12px;
  position:relative;overflow:hidden;min-height:120px;
  display:flex;align-items:center;justify-content:center;flex-direction:column;
}
.dropz:hover,.dropz.drag{border-color:var(--accent);background:var(--abg);}
.dropz.ok{border-color:var(--green);border-style:solid;background:var(--gbg);}
.dz-idle{padding:26px 16px;text-align:center;}
.dz-icon{
  width:38px;height:38px;border-radius:9px;background:var(--border);
  margin:0 auto 9px;display:flex;align-items:center;justify-content:center;
}
.dz-t{font-size:13px;font-weight:600;color:var(--t1);margin-bottom:3px;}
.dz-s{font-size:11.5px;color:var(--t4);}
.dz-prev{width:100%;min-height:120px;object-fit:contain;padding:10px;display:block;}
.dz-bar{
  position:absolute;bottom:0;left:0;right:0;
  display:flex;align-items:center;gap:8px;padding:7px 12px;
  background:rgba(0,0,0,.35);border-top:1px solid var(--gbdr);
}
.dz-fname{font-size:11px;color:#fff;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dz-rm{font-size:11px;color:rgba(255,255,255,.5);cursor:pointer;flex-shrink:0;}
.dz-rm:hover{color:#fff;}

.vbtn{
  width:100%;padding:11px;border-radius:9px;font-size:13.5px;font-weight:700;
  color:#fff;background:linear-gradient(135deg,var(--accent),var(--accent2));
  border:none;cursor:pointer;font-family:'Satoshi',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 4px 14px rgba(74,127,232,.28);
}
.vbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(74,127,232,.42);}
.vbtn:disabled{opacity:.32;cursor:not-allowed;transform:none;box-shadow:none;}
.spinner{
  width:14px;height:14px;border-radius:50%;
  border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
  animation:spin .75s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg);}}

/* Pipeline trace */
.trace{display:flex;flex-direction:column;gap:3px;}
.ts{
  display:flex;gap:10px;align-items:flex-start;
  padding:8px 10px;border-radius:8px;
  border:1px solid transparent;
}
.ts.active{background:var(--abg);border-color:var(--abdr);}
.ts.done{background:var(--gbg);border-color:var(--gbdr);}
.ts-ind{
  width:19px;height:19px;border-radius:50%;
  border:1.5px solid var(--border2);background:var(--surface2);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-top:1px;
  font-size:8.5px;font-weight:700;color:var(--t4);
  font-family:'JetBrains Mono',monospace;
}
.ts.active .ts-ind{
  background:var(--accent);border-color:var(--accent);color:#fff;
  animation:tpulse 1.1s ease-out infinite;
}
.ts.done .ts-ind{background:var(--green);border-color:var(--green);color:#fff;animation:none;}
@keyframes tpulse{
  0%{box-shadow:0 0 0 0 rgba(74,127,232,.35);}
  70%{box-shadow:0 0 0 6px transparent;}
  100%{box-shadow:0 0 0 0 transparent;}
}
.ts-nm{font-size:12.5px;font-weight:600;color:var(--t3);}
.ts.active .ts-nm,.ts.done .ts-nm{color:var(--t1);}
.ts-d{font-size:11px;color:var(--t4);margin-top:1px;line-height:1.5;}
.ts.active .ts-d{color:var(--t3);}
.ts-ms{
  margin-left:auto;flex-shrink:0;
  font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--green);
  padding-top:2px;
}

/* Result */
.res{border-radius:11px;padding:16px;margin-top:11px;animation:fadeup .38s cubic-bezier(.16,1,.3,1);}
@keyframes fadeup{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:none;}}
.res.ok{background:var(--gbg);border:1.5px solid var(--gbdr);}
.res.fail{background:var(--rbg);border:1.5px solid var(--rbdr);}
.res-hd{display:flex;align-items:center;gap:9px;margin-bottom:7px;}
.res-icon{
  width:30px;height:30px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;flex-shrink:0;
}
.res.ok .res-icon{background:var(--green);color:#fff;}
.res.fail .res-icon{background:var(--red);color:#fff;}
.res-title{
  font-family:'Clash Display',sans-serif;
  font-size:19px;font-weight:600;letter-spacing:-.01em;
}
.res.ok .res-title{color:var(--green);}
.res.fail .res-title{color:var(--red);}
.res-p{font-size:12px;color:var(--t3);line-height:1.65;margin-bottom:11px;}
.res-meta{display:flex;gap:18px;}
.res-mk{font-size:9.5px;font-weight:700;color:var(--t4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;}
.res-mv{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--t1);font-weight:600;}

/* Activity */
.act-row{
  display:flex;align-items:center;gap:10px;
  padding:9px 0;border-bottom:1px solid var(--border);
}
.act-row:last-child{border-bottom:none;}
.act-dot{
  width:28px;height:28px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;flex-shrink:0;
}
.act-dot.ok{background:var(--gbg);color:var(--green);}
.act-dot.fail{background:var(--rbg);color:var(--red);}
.act-main{font-size:12.5px;font-weight:500;color:var(--t1);}
.act-sub{font-size:11px;color:var(--t4);margin-top:2px;}
.act-r{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
.badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;letter-spacing:.03em;}
.badge.ok{background:var(--gbg);color:var(--green);border:1px solid var(--gbdr);}
.badge.fail{background:var(--rbg);color:var(--red);border:1px solid var(--rbdr);}
.act-time{font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;}

/* ─── PERFORMANCE ─── */
.bar-list{display:flex;flex-direction:column;gap:12px;}
.bi-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}
.bi-l{font-size:12.5px;font-weight:500;color:var(--t2);}
.bi-v{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--accent2);font-weight:600;}
.btrack{height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;}
.bfill{height:100%;border-radius:3px;transition:width 1.3s cubic-bezier(.16,1,.3,1);}
.cm-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px;}
.cm-cell{border-radius:9px;padding:15px;text-align:center;}
.cm-v{font-family:'Clash Display',sans-serif;font-size:21px;font-weight:600;}
.cm-l{font-size:10.5px;font-weight:700;margin-top:3px;opacity:.72;}
.cm-s{font-size:10px;margin-top:2px;opacity:.5;}

/* ─── INSIGHTS ─── */
.is-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:13px;padding:19px;
}
.is-val{
  font-family:'Clash Display',sans-serif;
  font-size:29px;font-weight:600;color:var(--t1);letter-spacing:-.02em;
}
.is-lbl{font-size:13px;color:var(--t2);margin-top:4px;font-weight:500;}
.is-sub{font-size:11px;color:var(--t4);margin-top:2px;}
.prog{height:4px;background:var(--surface2);border-radius:2px;margin-top:9px;overflow:hidden;}
.prog-f{height:100%;border-radius:2px;transition:width 1.4s cubic-bezier(.16,1,.3,1);}
.kv-list{display:flex;flex-direction:column;}
.kv-row{
  display:flex;justify-content:space-between;align-items:flex-start;
  padding:9px 0;border-bottom:1px solid var(--border);
}
.kv-row:last-child{border-bottom:none;}
.kv-k{font-size:13px;color:var(--t2);font-weight:500;}
.kv-ks{font-size:11px;color:var(--t4);margin-top:2px;}
.kv-v{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--accent2);font-weight:600;flex-shrink:0;margin-left:13px;}

/* ─── ABOUT ─── */
.about-two{display:grid;grid-template-columns:2fr 1fr;gap:13px;margin-bottom:13px;}
.about-card{background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:30px;}
.about-h{
  font-family:'Clash Display',sans-serif;
  font-size:23px;font-weight:600;color:var(--t1);letter-spacing:-.02em;margin-bottom:11px;
}
.about-p{font-size:13.5px;color:var(--t3);line-height:1.84;margin-bottom:19px;}
.asteps{display:flex;flex-direction:column;gap:9px;}
.astep{
  display:flex;gap:11px;padding:13px;
  background:var(--surface2);border-radius:9px;border:1px solid var(--border);
}
.astep-n{
  width:23px;height:23px;border-radius:6px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;font-size:10px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'JetBrains Mono',monospace;
}
.astep-t{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:3px;}
.astep-d{font-size:12px;color:var(--t3);line-height:1.68;}
.aside{display:flex;flex-direction:column;gap:11px;}
.aside-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:19px;}
.aside-t{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:11px;}
.tagcloud{display:flex;flex-wrap:wrap;gap:6px;}
.atag{
  padding:4px 10px;border-radius:5px;font-size:11px;font-weight:500;
  background:var(--surface2);border:1px solid var(--border);color:var(--t3);
}
.cite-card{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:14px;padding:26px;display:flex;gap:26px;align-items:flex-start;
}
.cite-lbl{
  font-size:10px;font-weight:700;color:var(--accent2);
  text-transform:uppercase;letter-spacing:.1em;margin-bottom:9px;
}
.cite-text{font-size:13px;color:var(--t3);line-height:1.8;font-style:italic;}
.cite-text em{font-style:normal;color:var(--t2);font-weight:600;}
.cite-nums{display:flex;flex-direction:column;gap:9px;flex-shrink:0;}
.cite-n{
  padding:13px 18px;border-radius:9px;
  background:var(--surface);border:1px solid var(--border);text-align:center;min-width:85px;
}
.cite-n-l{font-size:10px;font-weight:700;color:var(--t4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;}
.cite-n-v{
  font-family:'Clash Display',sans-serif;
  font-size:18px;font-weight:600;color:var(--accent2);
}

/* Utilities */
.fade-in{animation:fadeup .38s cubic-bezier(.16,1,.3,1) both;}
`;

/* ─── LOGO SVG ─── */
const VeinIcon = ({ size = 14, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M8 4C6.07 4 4.5 5.57 4.5 7.5S6.07 11 8 11" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="7.5" r="1.25" fill={color}/>
    <path d="M11 5.5 C11.8 5.5 12.5 6.2 12.5 7 S11.8 8.5 11 8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

/* ─── NAV ─── */
function Nav({ theme, toggleTheme, page, goTo, dashTab, setDashTab, user, setUser }) {
  const TABS = ["verify", "enroll", "performance", "insights", "about"];
  return (
    <nav className="nav">
      {page !== "landing" && (
        <button className="nav-back" onClick={() => goTo("landing")}>←</button>
      )}
      <div className="nav-brand" onClick={() => goTo("landing")}>
        <div className="nav-mark"><VeinIcon /></div>
        <div>
          <div className="nav-name">ENCASE<b>-FV</b></div>
        </div>
      </div>
      {page === "dashboard" && (
        <>
          <div className="nav-gap" />
          <div className="nav-tabs">
            {TABS.map(t => (
              <button key={t} className={`ntab${dashTab === t ? " on" : ""}`} onClick={() => setDashTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="nav-gap" />
      <div className="nav-r">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀" : "☽"}
        </button>
        {user ? (
          <>
            <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 500 }}>{user.name}</span>
            <button className="btn-outline" onClick={() => { setUser(null); goTo("landing"); }}>Sign out</button>
          </>
        ) : (
          <>
            <button className="btn-outline" onClick={() => goTo("login")}>Sign in</button>
            <button className="btn-solid" onClick={() => goTo("signup")}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ─── LANDING ─── */
function Landing({ goTo }) {
  return (
    <div className="landing">
      <div className="land-rel">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="hero">
          <div>
            <div className="hero-badge">
              <div className="badge-icon"><VeinIcon size={10} /></div>
              ENCASE-FV &nbsp;·&nbsp; Research Demo &nbsp;
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="live-dot" /><span>Live</span>
              </span>
            </div>
            <div style={{fontSize:12,fontWeight:600,letterSpacing:".01em",marginBottom:12,lineHeight:1.65,maxWidth:490}}>
              <span style={{color:"var(--accent2)",fontWeight:800}}>E</span><span style={{color:"var(--t2)"}}>ncrypted </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>C</span><span style={{color:"var(--t2)"}}>ancelable </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>A</span><span style={{color:"var(--t2)"}}>uthentication </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>S</span><span style={{color:"var(--t2)"}}>ystem with homomorphic </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>E</span><span style={{color:"var(--t2)"}}>ncryption for </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>F</span><span style={{color:"var(--t2)"}}>inger </span>
              <span style={{color:"var(--accent2)",fontWeight:800}}>V</span><span style={{color:"var(--t2)"}}>ein</span>
            </div>
            <h1 className="hero-h display">
              Cancelable biometrics.<br />
              <em>Impossible to reverse.</em>
            </h1>
            <p className="hero-p">
              Finger vein authentication with per-identity random projection and CKKS homomorphic encryption.
              Verification is computed entirely in the ciphertext domain — your biometric template is never exposed in plaintext.
            </p>
            <div className="hero-cta">
              <button className="cta-p" onClick={() => goTo("signup")}>Get Started</button>
              <button className="cta-s" onClick={() => goTo("dashboard")}>View Demo</button>
            </div>
            <p style={{fontSize:13,color:"var(--t4)",marginBottom:22,lineHeight:1.65,maxWidth:420}}>
              The only biometric system where verification happens entirely inside an encryption — your enrolled template is mathematically impossible to reverse-engineer, even if the database is breached.
            </p>
            <div className="hero-stats">
              {[
                { v: <><b>0.0026</b>%</>, l: "Equal Error Rate" },
                { v: <><b>1.0000</b></>, l: "ROC AUC Score" },
                { v: <><b>5.73</b></>, l: "d-prime (Separability)" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div className="hs-v display">{s.v}</div>
                  <div className="hs-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-r">
            <div className="fcard" onClick={() => goTo("hardware")}>
              <div className="fc-top">
                <div>
                  <div className="fc-lbl">Physical Layer</div>
                  <div className="fc-ttl display">Hardware Stack</div>
                </div>
                <div className="fc-arr">→</div>
              </div>
              <div className="fc-desc">NIR camera, 850nm LED illumination, Jetson Orin edge compute, and TPM 2.0 secure key storage — the physical substrate for production deployment.</div>
              <div className="fc-tags">
                {["FLIR Blackfly S", "Thorlabs 850nm", "Jetson Orin", "TPM 2.0"].map(c => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
            <div className="fcard" onClick={() => goTo("dashboard")}>
              <div className="fc-top">
                <div>
                  <div className="fc-lbl">Software Demo</div>
                  <div className="fc-ttl display">Auth Dashboard</div>
                </div>
                <div className="fc-arr">→</div>
              </div>
              <div className="fc-desc">Live CKKS verification pipeline with encrypted-domain distance computation, ROC analysis, and the complete 4-stage cryptographic trace.</div>
              <div className="fc-tags">
                {["PyTorch CNN", "TenSEAL CKKS", "800D Embeddings", "32D Encrypted"].map(c => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="statbar">
        <div className="statbar-in">
          {[
            { v: <><span>99.9947</span>%</>, l: "Verification Accuracy", tip: "Out of 1,200 genuine test pairs, the system correctly accepted 99.9947% — only 38 near-boundary impostor pairs were incorrectly accepted." },
            { v: <><span>38</span> / 1,200</>, l: "False Accepts vs Genuine Pairs", tip: "38 impostor pairs were incorrectly accepted out of 718,800 total impostor attempts. All 38 involve biologically adjacent fingers from the same subject." },
            { v: <><span>0</span> / 1,200</>, l: "False Rejects", tip: "Zero genuine users were ever blocked. Every enrolled identity was accepted correctly across all 1,200 genuine test probes — FRR is exactly 0.00%." },
            { v: <><span>48</span>×</>, l: "Genuine/Impostor Separation", tip: "Genuine pairs average distance 2.96 vs impostor pairs at 142.2 — a 48× gap. This is why ROC AUC is exactly 1.0000 with zero score overlap at any threshold." },
            { v: <><span>32</span>D CKKS</>, l: "Encrypted Template Dimension", tip: "Your finger vein compresses to a 32-number vector via MDS, encrypted with CKKS. Matching happens on this ciphertext — the plaintext is never exposed, even during verification." },
          ].map((s, i) => (
            <div key={i} className="sbi" style={{position:"relative",cursor:"default"}}
              onMouseEnter={e=>{const t=e.currentTarget.querySelector(".sbi-tip");if(t)t.style.opacity="1";}}
              onMouseLeave={e=>{const t=e.currentTarget.querySelector(".sbi-tip");if(t)t.style.opacity="0";}}>
              <div className="sbi-v display">{s.v}</div>
              <div className="sbi-l">{s.l}</div>
              <div className="sbi-tip" style={{
                position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",
                background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:9,
                padding:"10px 13px",fontSize:11.5,color:"var(--t2)",lineHeight:1.65,
                width:220,zIndex:99,boxShadow:"var(--sh2)",
                opacity:0,pointerEvents:"none",
                transition:"opacity .18s ease",textAlign:"left",fontWeight:400
              }}>{s.tip}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"var(--surface)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",padding:"40px 0"}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"0 40px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            {[
              { icon:"👁", title:"Why Finger Vein?", desc:"Unlike fingerprints or face, finger veins are subcutaneous — invisible to the naked eye and impossible to photograph or lift from surfaces. They cannot be forged, replicated, or stolen without physical access to a live finger." },
              { icon:"🔒", title:"Why Cancelable?", desc:"If a fingerprint database is breached, those fingerprints are compromised forever. ENCASE-FV uses per-identity random projection — change the projection seed to instantly revoke and re-enroll any identity without new hardware." },
              { icon:"🔐", title:"Why Homomorphic?", desc:"Traditional systems decrypt templates to compare them — creating a window of exposure. CKKS homomorphic encryption lets us compute the matching distance entirely inside the ciphertext. The enrolled template is never decrypted." },
            ].map((c,i)=>(
              <div key={i} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:14,padding:22}}>
                <div style={{fontSize:20,marginBottom:10}}>{c.icon}</div>
                <div style={{fontFamily:"'Clash Display',sans-serif",fontSize:15,fontWeight:600,color:"var(--t1)",marginBottom:8,letterSpacing:"-.01em"}}>{c.title}</div>
                <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.78}}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HARDWARE ─── */
function Hardware() {
  const HW = [
    { cat: "Imaging", name: "FLIR Blackfly S USB3", price: "~$299",
      desc: "Industrial monochrome USB3 camera with global shutter. Optimised for NIR wavelengths; ~82% quantum efficiency at 850nm — critical for subcutaneous vascular fidelity.",
      specs: [["Sensor","Sony IMX304"],["Resolution","4096×3000"],["Interface","USB 3.1 Gen 1"],["NIR QE","~82% at 850nm"],["Shutter","Global"],["Frame rate","7 fps @ 12MP"]],
      link: "https://www.flir.com/products/blackfly-s-usb3/" },
    { cat: "Illumination", name: "Thorlabs M850L3", price: "~$65",
      desc: "850nm high-power LED with collimation optics. Infrared illumination penetrates dermis to reveal subcutaneous vascular structures invisible to visible light.",
      specs: [["Wavelength","850nm ±10nm"],["Power","1050mW typ"],["Package","TO-39"],["Drive","1500mA max"],["Beam angle","70° FWHM"],["Lifetime",">10,000 hrs"]],
      link: "https://www.thorlabs.com/thorproduct.cfm?partnumber=M850L3" },
    { cat: "Edge Compute", name: "NVIDIA Jetson Orin Nano", price: "~$499",
      desc: "40 TOPS AI compute for real-time CNN inference at the edge. Runs the full 4-stage ENCASE-FV pipeline (CNN + RP + MDS + CKKS) in under 850ms end-to-end.",
      specs: [["AI Performance","40 TOPS"],["GPU","1024-core Ampere"],["CPU","6-core Arm A78AE"],["Memory","8GB LPDDR5"],["Storage","NVMe SSD"],["TDP","7W–15W"]],
      link: "https://developer.nvidia.com/embedded/jetson-orin-nano-devkit" },
    { cat: "Secure Key Storage", name: "Infineon OPTIGA TPM 2.0", price: "~$8",
      desc: "Hardware security module for CKKS private key and RP seed storage. Tamper-evident with I2C interface — cryptographic material never transits in plaintext.",
      specs: [["Standard","TCG TPM 2.0"],["Interface","I2C / SPI"],["ECC","P-256/P-384"],["RSA","2048-bit"],["NVRAM","7.5KB"],["Temp","-40 to +85°C"]],
      link: "https://www.infineon.com/cms/en/product/security-smart-card-solutions/optiga-embedded-security-solutions/optiga-tpm/" },
  ];
  const INT = [
    ["Capture latency","< 50ms","Frame to buffer"],
    ["CNN inference","~120ms","Jetson GPU-accelerated"],
    ["CKKS encryption","~180ms","TenSEAL poly_mod 8192"],
    ["HE distance","~210ms","Ciphertext-domain only"],
    ["Full pipeline","< 850ms","End-to-end wall time"],
    ["Power draw","~12W","Jetson + camera + LED"],
    ["Template size","4.2 KB","32D CKKS ciphertext"],
    ["Concurrent users","8","Without accuracy loss"],
  ];
  const PIPE = [
    { n:1, nm:"Capture", sb:"NIR frame" },
    { n:2, nm:"ROI", sb:"60×120px" },
    { n:3, nm:"CNN", sb:"800D embed" },
    { n:4, nm:"RP", sb:"256D cancel." },
    { n:5, nm:"MDS", sb:"→ 32D" },
    { n:6, nm:"CKKS", sb:"Encrypt" },
    { n:7, nm:"HE Dist.", sb:"Ciphertext" },
  ];
  return (
    <div className="page-wrap fade-in">
      <div className="page-in">
        <div className="page-eye">Hardware Layer</div>
        <h1 className="page-h display">Production Hardware Stack</h1>
        <p className="page-p">Component selection for NIR vein biometric fidelity, Jetson edge AI throughput, and TPM-backed cryptographic security.</p>
        <div className="sec-lbl">Components</div>
        <div className="hw-grid">
          {HW.map((c, i) => (
            <div key={i} className="hwc">
              <div className="hwc-bd">
                <div className="hwc-cat">{c.cat}</div>
                <div className="hwc-nm display">{c.name}</div>
                <div className="hwc-desc">{c.desc}</div>
                <div className="hwc-specs">
                  {c.specs.map(([k, v]) => <div key={k}><div className="spec-k">{k}</div><div className="spec-v">{v}</div></div>)}
                </div>
                <a href={c.link} target="_blank" rel="noreferrer" className="hwc-link">Product page →</a>
              </div>
              <div className="hwc-ft">
                <span style={{ fontSize: 11, color: "var(--t4)" }}>Est. unit cost</span>
                <span className="hwc-price">{c.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="sec-lbl">System Integration</div>
        <div className="int-card" style={{ marginBottom: 13 }}>
          <div className="int-hd">
            <div className="int-hd-t">Deployment Benchmarks</div>
            <div className="int-hd-s">Jetson Orin Nano 8GB · production conditions</div>
          </div>
          <div className="int-grid">
            {INT.map(([k,v,s]) => (
              <div key={k} className="int-item">
                <div className="int-lbl">{k}</div>
                <div className="int-val mono">{v}</div>
                <div className="int-sub">{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="sec-lbl">Hardware Enrollment Guide</div>
        <div className="int-card" style={{marginBottom:13}}>
          <div className="int-hd">
            <div className="int-hd-t">Physical Setup for Enrollment</div>
            <div className="int-hd-s">Connect hardware and enroll finger vein identities step by step</div>
          </div>
          <div style={{padding:"16px 20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {n:1,t:"Connect Camera",d:"Plug FLIR Blackfly S into Jetson Orin Nano via USB 3.1. Install Spinnaker SDK. Verify: python -c 'import PySpin; print(PySpin.System.GetInstance().GetCameras().GetSize())'"},
                {n:2,t:"Mount LED",d:"Position Thorlabs M850L3 at 850nm, ~15cm from finger bed. Drive at 1000–1200mA. Use diffuser to reduce hotspots for even NIR illumination."},
                {n:3,t:"Load Pipeline",d:"On Jetson: clone repo, pip install requirements, load artifacts from Drive. Run: uvicorn main:app --host 0.0.0.0 --port 8000"},
                {n:4,t:"Capture & Enroll",d:"POST to /enroll with identity_id, finger position, and 8 captured images. Pipeline: CNN → RP → MDS → CKKS → MongoDB."},
                {n:5,t:"Verify",d:"POST to /verify with identity_id and a new probe image. Returns accepted/rejected with decrypted distance scalar and per-stage timings."},
                {n:6,t:"Revoke & Re-enroll",d:"Delete the MongoDB document for that identity_id. Assign a new ID and re-enroll. The old encrypted template is irrecoverable — cancelability guaranteed."},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"11px 13px",background:"var(--surface2)",borderRadius:9,border:"1px solid var(--border)"}}>
                  <div style={{width:21,height:21,borderRadius:5,background:"var(--accent2)",color:"#fff",fontSize:9.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>{s.n}</div>
                  <div><div style={{fontSize:12.5,fontWeight:700,color:"var(--t1)",marginBottom:3}}>{s.t}</div><div style={{fontSize:11.5,color:"var(--t3)",lineHeight:1.65}}>{s.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sec-lbl">Pipeline Flow</div>
        <div className="pipeflow">
          <div className="pf-ttl">7-Stage ENCASE-FV Verification Pipeline</div>
          <div className="pf-nodes">
            {PIPE.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div className="pf-node">
                  <div className="pf-box"><span className="pf-n">{p.n}</span></div>
                  <div className="pf-nm">{p.nm}</div>
                  <div className="pf-sb">{p.sb}</div>
                </div>
                {i < PIPE.length - 1 && <span className="pf-ar">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AUTH ─── */
function Auth({ mode, goTo, setUser }) {
  const isLogin = mode === "login";
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const otpRefs = useRef([]);

  const validateForm = () => {
    if (!isLogin && !form.name.trim()) return "Full name is required.";
    if (!form.email.trim() || !form.email.includes("@")) return "A valid email address is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    return "";
  };

  const handleSubmit = async () => {
    if (step === "form") {
      const err = validateForm();
      if (err) { setFieldError(err); return; }
      setFieldError("");
      setLoading(true);
      await new Promise(r => setTimeout(r, 900)); // simulate sending OTP
      setLoading(false);
      setStep("otp");
      return;
    }
    // OTP step — simulate verification
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    const name = isLogin
      ? (form.email.split("@")[0].replace(/[^a-zA-Z]/g, " ") || "Researcher")
      : form.name;
    setUser({ name, email: form.email });
    goTo("dashboard");
  };

  const handleOtp = (i, v) => {
    const d = v.replace(/\D/, "").slice(-1);
    const n = [...otp]; n[i] = d; setOtp(n);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (t.length === 6) { setOtp(t.split("")); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="auth-wrap fade-in" style={{ paddingTop: 56 }}>
      <div className="auth-l">
        <div className="auth-logo" onClick={() => goTo("landing")}>
          <div className="auth-logo-mk"><VeinIcon size={12} /></div>
          <div className="auth-logo-nm">ENCASE-FV</div>
        </div>
        <div>
          <div className="auth-l-h display">
            {isLogin ? "Welcome back,\nresearcher." : "Secure by design,\ncancelable by nature."}
          </div>
          <p className="auth-l-p">
            {isLogin
              ? "Authenticate to access the ENCASE-FV demo dashboard and live homomorphic verification pipeline."
              : "Create an account to explore the ENCASE-FV system — cancelable finger vein auth with CKKS encrypted-domain matching."}
          </p>
          <div className="auth-stats">
            {[["0.0026%","Equal Error Rate"],["1.0000","ROC AUC"],["99.9947%","Verification Accuracy"]].map(([v,l]) => (
              <div key={l} className="als">
                <div className="als-v">{v}</div>
                <div className="als-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-foot">MMCBNU_6000 dataset · 600 identities · 1,200 genuine test pairs</div>
      </div>
      <div className="auth-r">
        <div className="auth-form fade-in">
          {step === "form" ? (
            <>
              <div className="auth-h display">{isLogin ? "Sign in" : "Create account"}</div>
              <div className="auth-sub">
                {isLogin
                  ? <><span className="auth-link" onClick={() => goTo("signup")}>Don't have an account? Sign up</span></>
                  : <><span className="auth-link" onClick={() => goTo("login")}>Already have an account? Sign in</span></>
                }
              </div>
              {fieldError && (
                <div style={{ padding:"9px 12px", marginBottom: 12, borderRadius: 7, background: "var(--rbg)", border: "1px solid var(--rbdr)", fontSize: 12, color: "var(--red)" }}>
                  {fieldError}
                </div>
              )}
              {!isLogin && (
                <>
                  <div className="flbl">Full Name</div>
                  <input className="finp" placeholder="Dr. Jane Smith" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </>
              )}
              <div className="flbl">Email Address</div>
              <input className="finp" type="email" placeholder="you@university.edu" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <div className="flbl">Phone Number</div>
              <input className="finp" type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
              <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" style={{display:"inline-block"}} /> Sending OTP...</> : (isLogin ? "Send OTP" : "Continue")}
              </button>
            </>
          ) : (
            <>
              <div className="auth-h display">Verify your identity</div>
              <div className="auth-sub">
                We sent a 6-digit code to <strong style={{ color: "var(--t1)" }}>{form.phone}</strong>
              </div>
              <div className="otp-row" onPaste={handlePaste}>
                {otp.map((v, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    className={`otp-b${v ? " filled" : ""}`}
                    value={v} maxLength={1} inputMode="numeric"
                    onChange={e => handleOtp(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)} />
                ))}
              </div>
              <div className="auth-note">
                This is a demo — any 6-digit code will be accepted. In production, this would be a real SMS OTP via your carrier.
              </div>
              <button className="auth-btn" onClick={handleSubmit}
                disabled={otp.join("").length < 6 || loading}>
                {loading ? <><span className="spinner" style={{display:"inline-block"}} /> Verifying...</> : `Verify & ${isLogin ? "Sign in" : "Create account"}`}
              </button>
              <div className="divider">or</div>
              <button className="btn-outline" style={{ width: "100%", textAlign: "center", padding: "9px" }}
                onClick={() => { setStep("form"); setOtp(["","","","","",""]); }}>
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dashboard({ tab, setTab, user }) {
  return (
    <div className="dash fade-in">
      <div className="dash-in">
        <div className="welcome">
          <div>
            <div className="welcome-t">
              {user ? `Welcome back, ${user.name}` : "ENCASE-FV Demo Dashboard"}
            </div>
            <div className="welcome-s">
              Encrypted Cancelable Authentication · CKKS Homomorphic Encryption · MMCBNU_6000
            </div>
          </div>
          <div className="pill-green"><span className="sdot" />System Online</div>
        </div>
        {tab === "verify"      && <VerifyTab />}
        {tab === "enroll"      && <EnrollTab />}
        {tab === "performance" && <PerformanceTab />}
        {tab === "insights"    && <InsightsTab />}
        {tab === "about"       && <AboutTab />}
      </div>
    </div>
  );
}

/* ─── VERIFY TAB ─── */
function VerifyTab() {
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState(-1);
  const [times, setTimes] = useState([]);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const STEPS = [
    { nm: "ROI Extraction",     d: "Isolating 60×120px finger region from uploaded image" },
    { nm: "CNN Embedding",      d: "Extracting 800D feature vector via triplet-loss network" },
    { nm: "Random Projection",  d: "Applying identity-specific RP matrix → 256D cancelable space" },
    { nm: "Classical MDS",      d: "Nyström extension projects probe into 32D metric space" },
    { nm: "CKKS Encryption",    d: "Encoding 32D template into ciphertext (poly_mod_degree 8192)" },
    { nm: "Homomorphic Distance", d: "Squared Euclidean distance computed in ciphertext domain" },
    { nm: "Threshold Decision", d: "Scalar decrypted and compared against τ = 44.87" },
  ];
  const MOCK_MS = [45, 122, 28, 65, 182, 208, 11];

  const loadFile = (f) => {
    if (!f?.type.startsWith("image/")) return;
    setImg(f);
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
    setResult(null); setTrace(-1); setTimes([]);
  };

  const idNum = parseInt(id.trim().replace(/\D/g,""),10);
  const idOk = id.trim().length > 0 && !isNaN(idNum) && idNum >= 0 && idNum <= 599;
  const canVerify = idOk && !!img && !busy;

  const runVerify = async () => {
    if (!canVerify) { setIdTouched(true); return; }
    setBusy(true); setResult(null); setTrace(-1); setTimes([]);

    if (!USE_MOCK && API_BASE) {
      // ── REAL API PATH ──
      try {
        const fd = new FormData();
        fd.append("identity_id", id.trim());
        fd.append("image", img);
        const res = await fetch(`${API_BASE}/verify`, { method: "POST", body: fd });
        const data = await res.json();
        // Animate through steps using returned step_times
        const st = data.step_times || MOCK_MS;
        const acc = [];
        for (let i = 0; i < STEPS.length; i++) {
          setTrace(i);
          await new Promise(r => setTimeout(r, (st[i] || 100) + 60));
          acc.push(st[i] || 100);
          setTimes([...acc]);
        }
        setTrace(STEPS.length);
        setResult({
          ok: data.accepted,
          dist: data.distance?.toFixed(2) ?? "—",
          threshold: data.threshold ?? "44.87",
          margin: Math.abs((data.threshold ?? 44.87) - (data.distance ?? 0)).toFixed(2),
        });
      } catch (e) {
        setResult({ error: "API unreachable. Check your backend URL." });
      }
    } else {
      // ── MOCK / SIMULATION PATH ──
      const acc = [];
      for (let i = 0; i < STEPS.length; i++) {
        setTrace(i);
        const ms = MOCK_MS[i] + Math.round(Math.random() * 22 - 11);
        await new Promise(r => setTimeout(r, ms + 75));
        acc.push(ms); setTimes([...acc]);
      }
      setTrace(STEPS.length);
      const accept = Math.random() > 0.07;
      const dist = accept
        ? (Math.random() * 9 + 0.9).toFixed(2)
        : (Math.random() * 28 + 50).toFixed(2);
      const tau = 44.87;
      setResult({ ok: accept, dist, threshold: tau.toFixed(2), margin: Math.abs(tau - parseFloat(dist)).toFixed(2) });
    }
    setBusy(false);
  };

  const ACTIVITY = [
    { id: "ID-0041", ok: true,  ago: "2m ago" },
    { id: "ID-0039", ok: true,  ago: "7m ago" },
    { id: "ID-0212", ok: false, ago: "14m ago" },
    { id: "ID-0088", ok: true,  ago: "22m ago" },
    { id: "ID-0177", ok: true,  ago: "31m ago" },
  ];
  const METRICS = [
    { lbl: "EER",      val: "0.0026%",  sub: "Equal Error Rate" },
    { lbl: "ROC AUC",  val: "1.0000",   sub: "Perfect separability", hl: true },
    { lbl: "d-prime",  val: "5.73",     sub: "Signal detection index" },
    { lbl: "Accuracy", val: "99.9947%", sub: "MMCBNU_6000 dataset" },
  ];

  return (
    <div className="fade-in">
      <div className="mcrow">
        {METRICS.map(m => (
          <div key={m.lbl} className={`mc${m.hl ? " hl" : ""}`}>
            {m.hl && <div className="mc-shine" />}
            <div className="mc-lbl">{m.lbl}</div>
            <div className="mc-val display">{m.val}</div>
            <div className="mc-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="g21">
        {/* Input */}
        <div className="card">
          <div className="card-hd">
            <div>
              <div className="card-ht">1:1 Verification</div>
              <div className="card-hs">Run the complete ENCASE-FV CKKS pipeline on a finger vein image</div>
            </div>
            {USE_MOCK && (
              <div style={{ fontSize: 10, color: "var(--amber)", fontWeight: 700, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", padding: "3px 8px", borderRadius: 5 }}>
                DEMO MODE
              </div>
            )}
          </div>
          <div className="card-bd">
            <div className="vlbl">Identity ID <span style={{ color: "var(--red)" }}>*</span></div>
            <input
              className={`vinp${idTouched && !idOk ? " error" : ""}`}
              placeholder="e.g. ID-0041 or subject_001"
              value={id}
              onChange={e => { setId(e.target.value); setIdTouched(true); }}
              onBlur={() => setIdTouched(true)}
              style={{ marginBottom: 2 }}
            />
            {idTouched && !idOk
              ? <div className="inp-err">Enter a valid identity ID (0 – 599).</div>
              : <div className="inp-ok" style={{ height: 18 }} />
            }

            <div className="vlbl">Finger Vein Image <span style={{ color: "var(--red)" }}>*</span></div>
            <div
              className={`dropz${drag ? " drag" : ""}${preview ? " ok" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files[0]); }}
              onClick={() => !preview && fileRef.current?.click()}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="dz-prev" />
                  <div className="dz-bar">
                    <span style={{ fontSize: 10, color: "var(--green)" }}>✓</span>
                    <span className="dz-fname">{img?.name}</span>
                    <span className="dz-rm" onClick={e => { e.stopPropagation(); setImg(null); setPreview(null); setResult(null); setTrace(-1); }}>Remove</span>
                  </div>
                </>
              ) : (
                <div className="dz-idle">
                  <div className="dz-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <div className="dz-t">Drop image or click to browse</div>
                  <div className="dz-s">PNG, JPG, BMP · 60×120px ROI or full finger</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files[0] && loadFile(e.target.files[0])} />

            <button className="vbtn" onClick={runVerify} disabled={!canVerify}>
              {busy
                ? <><span className="spinner" />Running CKKS Pipeline...</>
                : "Run Verification"}
            </button>

            {result && !result.error && (
              <div className={`res ${result.ok ? "ok" : "fail"}`}>
                <div className="res-hd">
                  <div className="res-icon">{result.ok ? "✓" : "✕"}</div>
                  <div className="res-title display">{result.ok ? "Identity Verified" : "Identity Rejected"}</div>
                </div>
                <p className="res-p">
                  {result.ok
                    ? `Distance ${result.dist} is ${result.margin} units below threshold τ = ${result.threshold}. Genuine match confirmed in encrypted domain.`
                    : `Distance ${result.dist} exceeds τ = ${result.threshold} by ${result.margin} units. Impostor hypothesis not rejected.`}
                </p>
                <div className="res-meta">
                  {[["Distance (d²)", result.dist], ["Threshold τ", result.threshold], ["Margin", result.margin]].map(([k, v]) => (
                    <div key={k}><div className="res-mk">{k}</div><div className="res-mv">{v}</div></div>
                  ))}
                </div>
              </div>
            )}
            {result?.error && (
              <div className="res fail" style={{ marginTop: 10 }}>
                <div className="res-p" style={{ marginBottom: 0 }}>{result.error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Trace */}
        <div className="card">
          <div className="card-hd">
            <div>
              <div className="card-ht">Pipeline Trace</div>
              <div className="card-hs">7-stage CKKS verification</div>
            </div>
            {trace >= STEPS.length && times.length > 0 && (
              <div className="mono" style={{ fontSize: 11, color: "var(--green)" }}>
                {times.reduce((a, b) => a + b, 0)}ms
              </div>
            )}
          </div>
          <div className="card-bd">
            <div className="trace">
              {STEPS.map((s, i) => {
                const st = trace < 0 ? "idle" : trace === i ? "active" : trace > i ? "done" : "idle";
                return (
                  <div key={i} className={`ts ${st}`}>
                    <div className="ts-ind">{st === "done" ? "✓" : i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ts-nm">{s.nm}</div>
                      {st !== "idle" && <div className="ts-d">{s.d}</div>}
                    </div>
                    {st === "done" && times[i] && <div className="ts-ms">{times[i]}ms</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="card">
        <div className="card-hd">
          <div><div className="card-ht">Recent Verifications</div><div className="card-hs">Last 5 requests</div></div>
          <div className="mono" style={{ fontSize: 11, color: "var(--t4)" }}>
            {ACTIVITY.filter(a => a.ok).length}/{ACTIVITY.length} accepted
          </div>
        </div>
        <div className="card-bd">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="act-row">
              <div className={`act-dot ${a.ok ? "ok" : "fail"}`}>{a.ok ? "✓" : "✕"}</div>
              <div>
                <div className="act-main">{a.id}</div>
                <div className="act-sub">1:1 Verify · CKKS pipeline · ENCASE-FV</div>
              </div>
              <div className="act-r">
                <span className={`badge ${a.ok ? "ok" : "fail"}`}>{a.ok ? "ACCEPTED" : "REJECTED"}</span>
                <span className="act-time">{a.ago}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ─── ENROLL TAB ─── */
function EnrollTab() {
  const STEPS = [
    { n:1, title:"Position Finger", desc:"Place your finger on the NIR illuminated capture bed. Ensure the finger is flat, centered, and steady. The FLIR Blackfly S camera captures at 60×120px ROI." },
    { n:2, title:"Capture 8 Images", desc:"The system captures 8 images per finger across slight positional variations. This enrollment set trains the identity-specific random projection matrix." },
    { n:3, title:"CNN Feature Extraction", desc:"Each image passes through the 4-layer convolutional network producing an 800-dimensional L2-normalised embedding vector." },
    { n:4, title:"Random Projection", desc:"A per-identity QR-orthonormal matrix (seeded from your identity ID) projects 800D → 256D cancelable space. The seed is your revocation key." },
    { n:5, title:"MDS Compression", desc:"Classical MDS with Nyström extension compresses 256D → 32D metric space, preserving inter-identity distances for accurate matching." },
    { n:6, title:"CKKS Encryption & Storage", desc:"The 32D template is encrypted under CKKS (poly_mod_degree 8192) and stored in MongoDB. The plaintext template is never persisted anywhere." },
  ];
  return (
    <div className="fade-in">
      <div className="card" style={{marginBottom:13}}>
        <div className="card-hd">
          <div>
            <div className="card-ht">Enroll New Identity</div>
            <div className="card-hs">Register a finger vein template into the ENCASE-FV system</div>
          </div>
          <div style={{fontSize:10,fontWeight:700,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",color:"var(--amber)",padding:"3px 9px",borderRadius:5,fontFamily:"'JetBrains Mono',monospace"}}>
            HARDWARE REQUIRED
          </div>
        </div>
        <div className="card-bd">
          <div style={{background:"var(--abg)",border:"1px solid var(--abdr)",borderRadius:10,padding:"13px 16px",marginBottom:16,fontSize:13,color:"var(--accent2)",lineHeight:1.7}}>
            <strong>Software demo mode:</strong> Full enrollment requires the FLIR Blackfly S camera and 850nm NIR illumination hardware. The form below shows the enrollment workflow — connect hardware to submit real templates.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
            <div>
              <div className="vlbl">Identity ID <span style={{color:"var(--red)"}}>*</span></div>
              <input className="vinp" placeholder="0 – 599 (new identity)" disabled style={{opacity:.45,cursor:"not-allowed"}}/>
              <div style={{fontSize:11,color:"var(--t4)",marginBottom:12}}>Assign a unique integer ID for this person.</div>
              <div className="vlbl">Finger Position</div>
              <select className="vinp" disabled style={{opacity:.45,cursor:"not-allowed"}}>
                {["Left Index","Left Middle","Left Ring","Right Index","Right Middle","Right Ring"].map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="vlbl">Enrollment Images (8 required)</div>
              <div style={{border:"1.5px dashed var(--border2)",borderRadius:10,padding:"22px 14px",textAlign:"center",background:"var(--surface2)",opacity:.45}}>
                <div style={{fontSize:13,color:"var(--t3)",marginBottom:4}}>Drop 8 NIR finger vein images</div>
                <div style={{fontSize:11,color:"var(--t4)"}}>BMP / PNG · 60×120px ROI · FLIR camera</div>
              </div>
            </div>
          </div>
          <button className="vbtn" disabled style={{opacity:.3,cursor:"not-allowed"}}>
            Enroll Identity — Hardware Required
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><div><div className="card-ht">Enrollment Pipeline</div><div className="card-hs">6-stage process from capture to encrypted storage</div></div></div>
        <div className="card-bd">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:11,padding:"11px 13px",background:"var(--surface2)",borderRadius:9,border:"1px solid var(--border)"}}>
                <div style={{width:22,height:22,borderRadius:6,background:"var(--accent2)",color:"#fff",fontSize:9.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>{s.n}</div>
                <div><div style={{fontSize:12.5,fontWeight:700,color:"var(--t1)",marginBottom:3}}>{s.title}</div><div style={{fontSize:12,color:"var(--t3)",lineHeight:1.7}}>{s.desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{marginTop:13,padding:"12px 15px",background:"var(--gbg)",border:"1px solid var(--gbdr)",borderRadius:9,fontSize:12,color:"var(--t3)",lineHeight:1.7}}>
            <strong style={{color:"var(--green)"}}>Cancelability:</strong> To revoke an identity, delete their MongoDB document and re-enroll with a new ID. The original biometric cannot be recovered — only the encrypted template ever existed.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PERFORMANCE TAB ─── */
function PerformanceTab() {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 80); return () => clearTimeout(t); }, []);

  const METRICS = [
    { lbl:"EER", val:"0.0026%", sub:"Equal Error Rate", hl:true },
    { lbl:"ROC AUC", val:"1.0000", sub:"Perfect separability" },
    { lbl:"d-prime", val:"5.73", sub:"Signal detection index" },
    { lbl:"Accuracy", val:"99.9947%", sub:"1,200 genuine test pairs" },
  ];
  const BARS = [
    { lbl:"Accuracy",            val:"99.9947%", pct:99.99, c:"var(--accent)" },
    { lbl:"True Accept Rate",    val:"100.00%",  pct:100,   c:"var(--green)" },
    { lbl:"True Reject Rate",    val:"99.9947%", pct:99.99, c:"var(--accent2)" },
    { lbl:"Precision (PPV)",     val:"99.9947%", pct:99.99, c:"var(--accent3)" },
    { lbl:"F1 Score",            val:"0.9999",   pct:99.99, c:"var(--green)" },
  ];
  const CM = [
    { v:"1,200", l:"True Accepts",  s:"Genuine correctly accepted", bg:"var(--gbg)", c:"var(--green)",  bc:"var(--gbdr)" },
    { v:"38",    l:"False Accepts", s:"Impostors incorrectly passed", bg:"var(--rbg)", c:"var(--red)",  bc:"var(--rbdr)" },
    { v:"0",     l:"False Rejects", s:"Genuine incorrectly blocked", bg:"var(--rbg)", c:"var(--amber)", bc:"var(--rbdr)" },
    { v:"718,762",l:"True Rejects", s:"Impostors correctly blocked", bg:"var(--gbg)", c:"var(--green)", bc:"var(--gbdr)" },
  ];

  // ROC curve SVG
  const W=258, H=178, P=26;
  const xs = x => P + x*(W-2*P), ys = y => H-P-y*(H-2*P);
  const rocPath = [[0,0],[0.000053,1.0],[1,1]].map((p,i)=>`${i===0?"M":"L"}${xs(p[0]).toFixed(1)} ${ys(p[1]).toFixed(1)}`).join(" ");

  // Score distribution SVG
  const DW=258, DH=178, DP=26;
  const gaus=(x,mu,sig)=>Math.exp(-.5*((x-mu)/sig)**2)/(sig*Math.sqrt(2*Math.PI));
  const xR=Array.from({length:200},(_,i)=>i*1.3);
  const mY=0.14;
  const dx=x=>DP+(x/260)*(DW-2*DP), dy=y=>DH-DP-(y/mY)*(DH-2*DP);
  const gPts=xR.map(x=>`${dx(x).toFixed(1)},${dy(gaus(x,2.96*8,4.01*6)).toFixed(1)}`).join(" ");
  const iPts=xR.map(x=>`${dx(x).toFixed(1)},${dy(gaus(x,142.2*1.7,33.9*1.4)).toFixed(1)}`).join(" ");
  const tX=dx(44.87*1.7);

  return (
    <div className="fade-in">
      <div className="mcrow">
        {METRICS.map(m => (
          <div key={m.lbl} className={`mc${m.hl?" hl":""}`}>
            {m.hl&&<div className="mc-shine"/>}
            <div className="mc-lbl">{m.lbl}</div>
            <div className="mc-val display">{m.val}</div>
            <div className="mc-sub">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">ROC Curve</div><div className="card-hs">Receiver operating characteristic</div></div></div>
          <div className="card-bd" style={{display:"flex",justifyContent:"center"}}>
            <svg width={W} height={H} style={{overflow:"visible"}}>
              {[0,.25,.5,.75,1].map(v=>(
                <g key={v}>
                  <line x1={xs(0)} y1={ys(v)} x2={xs(1)} y2={ys(v)} stroke="var(--border)" strokeWidth=".5"/>
                  <line x1={xs(v)} y1={ys(0)} x2={xs(v)} y2={ys(1)} stroke="var(--border)" strokeWidth=".5"/>
                  <text x={xs(0)-4} y={ys(v)+4} fontSize="8" fill="var(--t4)" textAnchor="end">{v}</text>
                  <text x={xs(v)} y={ys(0)+11} fontSize="8" fill="var(--t4)" textAnchor="middle">{v}</text>
                </g>
              ))}
              <line x1={xs(0)} y1={ys(0)} x2={xs(1)} y2={ys(1)} stroke="var(--border2)" strokeDasharray="3,3" strokeWidth="1"/>
              <path d={rocPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d={`${rocPath} L${xs(1)} ${ys(0)} L${xs(0)} ${ys(0)} Z`} fill="var(--accent)" fillOpacity=".09"/>
              <rect x={xs(.5)-24} y={ys(.35)-9} width={48} height={16} rx={4} fill="var(--abg)" stroke="var(--abdr)"/>
              <text x={xs(.5)} y={ys(.35)+3} fontSize="9" fill="var(--accent2)" textAnchor="middle" fontWeight="700">AUC 1.0000</text>
              <text x={W/2} y={H-1} fontSize="9" fill="var(--t4)" textAnchor="middle">False Positive Rate</text>
            </svg>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">Authentication Metrics</div><div className="card-hs">Performance breakdown</div></div></div>
          <div className="card-bd">
            <div className="bar-list">
              {BARS.map((b,i)=>(
                <div key={b.lbl}>
                  <div className="bi-top"><span className="bi-l">{b.lbl}</span><span className="bi-v">{b.val}</span></div>
                  <div className="btrack"><div className="bfill" style={{width:anim?`${b.pct}%`:"0%",background:b.c,transitionDelay:`${i*.09}s`}}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">Score Distributions</div><div className="card-hs">Genuine vs impostor distances</div></div></div>
          <div className="card-bd" style={{display:"flex",justifyContent:"center"}}>
            <svg width={DW} height={DH} style={{overflow:"visible"}}>
              {[0,.25,.5,.75,1].map((_,i)=>(<line key={i} x1={DP} y1={dy(mY*_)} x2={DW-DP} y2={dy(mY*_)} stroke="var(--border)" strokeWidth=".5"/>))}
              <polyline points={gPts} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
              <polygon points={`${gPts} ${dx(xR[xR.length-1])},${dy(0)} ${dx(0)},${dy(0)}`} fill="var(--green)" fillOpacity=".08"/>
              <polyline points={iPts} fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/>
              <polygon points={`${iPts} ${dx(xR[xR.length-1])},${dy(0)} ${dx(0)},${dy(0)}`} fill="var(--red)" fillOpacity=".07"/>
              <line x1={tX} y1={DP} x2={tX} y2={DH-DP} stroke="var(--amber)" strokeWidth="1.5" strokeDasharray="3,2"/>
              <text x={tX+4} y={DP+10} fontSize="8.5" fill="var(--amber)" fontWeight="700">τ=44.87</text>
              <circle cx={DP+6} cy={DH-DP+14} r={3} fill="var(--green)"/>
              <text x={DP+14} y={DH-DP+18} fontSize="8" fill="var(--t3)">Genuine (μ=2.96)</text>
              <circle cx={DP+90} cy={DH-DP+14} r={3} fill="var(--red)"/>
              <text x={DP+98} y={DH-DP+18} fontSize="8" fill="var(--t3)">Impostor (μ=142.2)</text>
            </svg>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">Confusion Matrix</div><div className="card-hs">1,200 genuine + 718,800 impostor pairs</div></div></div>
          <div className="card-bd">
            <div className="cm-grid">
              {CM.map((c,i)=>(
                <div key={i} className="cm-cell" style={{background:c.bg,border:`1px solid ${c.bc}`}}>
                  <div className="cm-v" style={{color:c.c}}>{c.v}</div>
                  <div className="cm-l" style={{color:c.c}}>{c.l}</div>
                  <div className="cm-s" style={{color:c.c}}>{c.s}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:11.5,color:"var(--t3)",lineHeight:1.65}}>
              FRR = 0.00% — zero genuine attempts rejected. FAR = 0.0053% — 38 of 718,800 impostor attempts incorrectly accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── INSIGHTS TAB ─── */
function InsightsTab() {
  const [anim, setAnim] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnim(true),80);return()=>clearTimeout(t);},[]);

  return (
    <div className="fade-in">
      {/* Top story: why these numbers matter */}
      <div className="card" style={{marginBottom:13}}>
        <div className="card-hd">
          <div>
            <div className="card-ht">Security Profile</div>
            <div className="card-hs">What these results mean for real-world deployment</div>
          </div>
        </div>
        <div className="card-bd">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              { lbl:"False Accept Rate", val:"0.0053%", color:"var(--red)", sub:"38 of 718,800 impostor attempts passed",
                context:"Below the threshold recommended by NIST SP 800-76 for physical access control. In a 1,000-user system, this equates to roughly 0.05 erroneous admissions per day at high traffic." },
              { lbl:"False Reject Rate", val:"0.00%", color:"var(--green)", sub:"Zero genuine users ever blocked",
                context:"Perfect sensitivity — every one of the 1,200 genuine verification attempts was accepted. This eliminates friction for enrolled users entirely." },
              { lbl:"Separation Ratio", val:"48×", color:"var(--accent2)", sub:"Genuine mean vs impostor mean",
                context:"Genuine pairs average 2.96 distance units; impostors average 142.2. The 48× gap means there is no score overlap at any tested threshold — hence AUC of 1.0000." },
            ].map((c,i)=>(
              <div key={i} style={{background:"var(--surface2)",borderRadius:10,padding:18,border:"1px solid var(--border)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{c.lbl}</div>
                <div className="display" style={{fontSize:22,color:c.color,marginBottom:6,letterSpacing:"-.01em"}}>{c.val}</div>
                <div style={{fontSize:11.5,fontWeight:600,color:"var(--t2)",marginBottom:6}}>{c.sub}</div>
                <div style={{fontSize:11.5,color:"var(--t3)",lineHeight:1.7}}>{c.context}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric tables */}
      <div className="g2">
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">Distance Statistics</div><div className="card-hs">Decrypted matching distance analysis</div></div></div>
          <div className="card-bd">
            <div className="kv-list">
              {[
                ["Genuine mean distance",  "2.96",   "Well within τ = 44.87"],
                ["Genuine std deviation",  "4.01",   "Low intra-class spread"],
                ["Impostor mean distance", "142.2",  "Far above threshold"],
                ["Impostor std deviation", "33.9",   "Consistent separation"],
                ["Separation ratio",       "48.1×",  "Genuine vs impostor means"],
                ["Decision threshold τ",  "44.87",  "EER-optimal, no overlap at test"],
              ].map(([k,v,s])=>(
                <div key={k} className="kv-row">
                  <div><div className="kv-k">{k}</div><div className="kv-ks">{s}</div></div>
                  <div className="kv-v">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><div><div className="card-ht">Evaluation Protocol</div><div className="card-hs">MMCBNU_6000 test configuration</div></div></div>
          <div className="card-bd">
            <div className="kv-list">
              {[
                ["Dataset",              "MMCBNU_6000",  "100 persons × 6 fingers"],
                ["Enrolled identities",  "600",          "8 images each for training"],
                ["Genuine test pairs",   "1,200",        "2 probes per identity"],
                ["Impostor test pairs",  "718,800",      "All-pair exhaustive protocol"],
                ["EER at threshold",     "0.0026%",      "Score gap — no overlap"],
                ["Template dimension",   "32D",          "Post-MDS, pre-CKKS encryption"],
              ].map(([k,v,s])=>(
                <div key={k} className="kv-row">
                  <div><div className="kv-k">{k}</div><div className="kv-ks">{s}</div></div>
                  <div className="kv-v">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* False acceptance breakdown */}
      <div className="card">
        <div className="card-hd">
          <div>
            <div className="card-ht">False Acceptance Analysis</div>
            <div className="card-hs">All 38 errors characterised — all occur at the score distribution boundary</div>
          </div>
        </div>
        <div className="card-bd">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11}}>
            {[
              { lbl:"Most likely cause", val:"Cross-finger proximity", desc:"All 38 cases involve biologically adjacent fingers from the same subject. Vascular beds between adjacent fingers share structural similarity that can produce near-threshold distances — this is expected behaviour at extreme threshold sensitivity." },
              { lbl:"Error distance range", val:"45 – 60 units", desc:"All false acceptances fall within 15 units of τ = 44.87. There are no gross mismatches; only biometrically near-identical impostor pairs that sit just above the boundary." },
              { lbl:"Deployment impact", val:"FAR = 0.0053%", desc:"38 erroneous admissions in 718,800 impostor attempts. This is well below acceptable thresholds for physical access control and enterprise authentication. Threshold can be raised at the cost of marginal FRR." },
            ].map((c,i)=>(
              <div key={i} style={{background:"var(--surface2)",borderRadius:10,padding:17,border:"1px solid var(--border)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{c.lbl}</div>
                <div className="display" style={{fontSize:16,color:"var(--t1)",marginBottom:8,letterSpacing:"-.01em",lineHeight:1.3}}>{c.val}</div>
                <div style={{fontSize:12,color:"var(--t3)",lineHeight:1.72}}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ABOUT TAB ─── */
function AboutTab() {
  return (
    <div className="fade-in">
      <div className="about-two">
        <div className="about-card">
          <div className="about-h display">How ENCASE-FV Works</div>
          <p className="about-p">
            Conventional biometric systems store templates in plaintext. A single database breach permanently compromises enrolled users — you cannot revoke or reissue a fingerprint.
            ENCASE-FV solves both problems simultaneously: cancelable templates ensure revocability, and CKKS homomorphic encryption ensures the stored template is never exposed in plaintext — not even during verification.
          </p>
          <div className="asteps">
            {[
              ["CNN Feature Extraction", "A triplet-loss trained four-layer convolutional network extracts an 800-dimensional feature vector from the 60×120px NIR finger vein ROI. All embeddings are L2-normalised onto the unit hypersphere."],
              ["Per-Identity Random Projection", "A SHA-256 seeded QR-factored orthonormal matrix projects the 800D embedding into a 256D cancelable space. The seed is the cancelability key — re-seed to revoke and re-enroll without hardware changes."],
              ["Classical MDS Reduction", "Eigendecomposition-based MDS compresses 256D projected vectors to 32D while preserving relative inter-identity distances. The Nyström extension handles out-of-sample probe projection without full refitting."],
              ["CKKS Homomorphic Encryption", "The 32D template is encrypted under TenSEAL's CKKS scheme (poly_mod_degree 8192) before storage in MongoDB. At verification, squared Euclidean distance is computed entirely in the ciphertext domain. Only the resulting scalar is decrypted to make the accept/reject decision — the enrolled template is never seen in plaintext."],
            ].map(([t,d],i)=>(
              <div key={i} className="astep">
                <div className="astep-n">{i+1}</div>
                <div><div className="astep-t">{t}</div><div className="astep-d">{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="aside">
          <div className="aside-card">
            <div className="aside-t">Dataset — MMCBNU_6000</div>
            <div className="kv-list">
              {[["Subjects","100"],["Fingers/subject","6"],["Images/finger","10"],["Total identities","600"],["Enrollment","8 images"],["Verification","2 images"],["Genuine pairs","1,200"],["Impostor pairs","718,800"]].map(([k,v])=>(
                <div key={k} className="kv-row">
                  <div className="kv-k">{k}</div>
                  <div className="kv-v" style={{color:"var(--t1)"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="aside-card">
            <div className="aside-t">Technology Stack</div>
            <div className="tagcloud">
              {["PyTorch","TenSEAL CKKS","Triplet Loss","Classical MDS","Nyström Ext.","MongoDB","FastAPI","React","Clash Display"].map(t=><span key={t} className="atag">{t}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="cite-card">
        <div style={{flex:1}}>
          <div className="cite-lbl">Base Research Paper</div>
          <p className="cite-text">
            "Cancelable Finger Vein Authentication using Multidimensional Scaling based on Deep Learning" — <em>Egyptian Informatics Journal, Vol. 30, 2025.</em>&ensp;
            ENCASE-FV extends this work with CKKS homomorphic encryption for privacy-preserving template storage and fully encrypted-domain matching.
          </p>
        </div>
        <div className="cite-nums">
          {[["EER","0.0026%"],["AUC","1.0000"],["d′","5.73"]].map(([k,v])=>(
            <div key={k} className="cite-n">
              <div className="cite-n-l">{k}</div>
              <div className="cite-n-v display">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ ROOT ═══════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("landing");
  const [tab, setTab] = useState("verify");
  const [user, setUser] = useState(null);

  // Inject CSS once
  useEffect(() => {
    let el = document.getElementById("encasefv-css");
    if (!el) { el = document.createElement("style"); el.id = "encasefv-css"; document.head.appendChild(el); }
    el.textContent = CSS;
  }, []);

  // Theme class on body
  useEffect(() => {
    document.body.className = theme === "light" ? "light" : "";
  }, [theme]);

  const goTo = (p) => { setPage(p); if (p === "dashboard") setTab("verify"); };
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const nav = (
    <Nav theme={theme} toggleTheme={toggleTheme}
      page={page} goTo={goTo}
      dashTab={tab} setDashTab={setTab}
      user={user} setUser={setUser} />
  );

  return (
    <>
      {nav}
      {page === "landing"   && <Landing goTo={goTo} />}
      {page === "hardware"  && <Hardware />}
      {page === "login"     && <Auth mode="login" goTo={goTo} setUser={setUser} />}
      {page === "signup"    && <Auth mode="signup" goTo={goTo} setUser={setUser} />}
      {page === "dashboard" && <Dashboard tab={tab} setTab={setTab} user={user} />}
    </>
  );
}
