'use client'

import { Countdown } from './Countdown'
import { RSVPForm } from './RSVPForm'
import { MusicPlayer } from './MusicPlayer'
import { GalleryView } from './GalleryView'
import { ScrollReveal } from './ScrollReveal'
import { Guestbook } from './Guestbook'
import { MiniCalendar } from './MiniCalendar'
import { optimizedImg, responsiveImg } from '@/lib/img'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReceptionData {
  partyType?: string; date?: string; time?: string; timeFormat?: string
  showArrivalTime?: boolean; arrivalTime?: string
  showStartTime?: boolean; startTime?: string
  showCountdown?: boolean; address?: string; showMap?: boolean
}
interface EventItem { id?: string; type?: string; name?: string; date?: string; time?: string; address?: string }
interface FamilyData { title?: string; fatherName?: string; motherName?: string; address?: string }
interface BankAccount { id?: string; bankName?: string; accountNumber?: string; accountHolder?: string; qrCodeUrl?: string }
interface DressCodeData { enabled?: boolean; instructions?: string; visible?: boolean }
interface RSVPConfig {
  enabled: boolean; displayMode?: string; guestMode?: string; guestLimit?: number
  questions?: Array<{ id: string; text: string; type: 'text'|'select'|'number'; options: string[] }>
}
export interface WeddingData {
  id: string; slug: string; groomName: string; brideName: string
  groomShort?: string|null; brideShort?: string|null; groomTitle: string; brideTitle: string
  displayOrder: string; coverPhotoUrl?: string|null; galleryUrls: string[]; galleryStyle: string
  groomFamily?: unknown|null; brideFamily?: unknown|null; announcement?: string|null
  events: unknown[]; reception?: unknown|null; rsvpConfig?: unknown|null; dressCode?: unknown|null
  guestbook: boolean; bankAccounts: unknown[]; thankYouMsg?: string|null; bgMusicUrl?: string|null
  settings?: unknown|null; createdAt: string; updatedAt: string
}
export interface GuestData {
  id: string; name: string; slug: string; greeting: string
  message?: string|null; group?: string|null; rsvpStatus: string
  rsvpCount?: number|null; answeredAt?: string|null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDateVi(d: string) {
  if (!d) return { dow:'', day:'', month:'', year:'' }
  try {
    const dt = new Date(d.includes('T') ? d : d+'T00:00:00')
    const dows = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
    const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
    return { dow: dows[dt.getDay()].toUpperCase(), day: dt.getDate().toString().padStart(2,'0'), month: months[dt.getMonth()].toUpperCase(), year: dt.getFullYear().toString() }
  } catch { return { dow:'', day:'', month:'', year:d } }
}
function fmtTime(t: string, fmt?: string) {
  if (!t) return ''
  const [hStr,mStr] = t.split(':'); const h=parseInt(hStr??'0'); const m=parseInt(mStr??'0'); const mm=m.toString().padStart(2,'0')
  if (fmt==='am_pm') return `${h%12||12}:${mm} ${h>=12?'CH':'SA'}`
  const periods=[{l:'sáng',f:5,t:11},{l:'trưa',f:11,t:13},{l:'chiều',f:13,t:18},{l:'tối',f:18,t:24},{l:'đêm',f:0,t:5}]
  const p=periods.find(x=>h>=x.f&&h<x.t)??{l:'sáng'}; const h12=h%12===0?12:h%12
  return m>0?`${h12} giờ ${mm} ${p.l}`:`${h12} giờ ${p.l}`
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Mali:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Montserrat:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box}

/* ── Palette ── */
/* bg: #fdf8f4  gold: #c9a96e  pink: #e8a0a8  green: #5a7a5a  text: #3d2b1f */

/* ── Root ── */
.wc {
  font-family:'Montserrat',sans-serif;
  background:#fdf8f4;
  color:#3d2b1f;
  min-height:100vh;
  overflow-x:hidden;
  position:relative;
}
.wc-inner { max-width:480px; margin:0 auto; }

/* ── Fonts ── */
.f-script  { font-family:'Great Vibes',cursive; }
.f-serif   { font-family:'Cormorant Garamond',Georgia,serif; }

/* ── Animations ── */
@keyframes wcFadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes wcFloat    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
@keyframes wcFloatR   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
@keyframes wcSpin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes wcBloom    { 0%{opacity:0;transform:scale(0) rotate(-20deg)} 60%{transform:scale(1.1) rotate(5deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
@keyframes wcLeafIn   { 0%{opacity:0;transform:translateX(-40px) rotate(-15deg)} 100%{opacity:1;transform:translateX(0) rotate(0deg)} }
@keyframes wcLeafInR  { 0%{opacity:0;transform:translateX(40px) rotate(15deg)} 100%{opacity:1;transform:translateX(0) rotate(0deg)} }
@keyframes wcPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
@keyframes wcGoldLine { from{width:0;opacity:0} to{width:100%;opacity:1} }

/* ── Floating flowers (fixed, decorative) ── */
.wc-flower-fixed {
  position:fixed; pointer-events:none; z-index:0;
  opacity:0.12; font-size:80px;
}
.wc-flower-fixed.fl-tl { top:-20px; left:-20px; animation:wcFloat 8s ease-in-out infinite; }
.wc-flower-fixed.fl-tr { top:-20px; right:-20px; animation:wcFloatR 9s ease-in-out infinite; transform:scaleX(-1); }
.wc-flower-fixed.fl-bl { bottom:30%; left:-20px; animation:wcFloat 10s ease-in-out infinite 2s; }
.wc-flower-fixed.fl-br { bottom:30%; right:-20px; animation:wcFloatR 11s ease-in-out infinite 1s; transform:scaleX(-1); }

/* ── Cover ── */
.wc-cover {
  position:relative; width:100%; height:100svh; max-height:680px;
  overflow:hidden;
  background:linear-gradient(160deg,#fdf0ea,#fde8e8,#fdf8f4);
}
.wc-cover-img { width:100%;height:100%;object-fit:cover;display:block; }
.wc-cover-overlay {
  position:absolute;inset:0;
  background:linear-gradient(to bottom,
    rgba(253,248,244,.1) 0%,
    rgba(253,248,244,.05) 40%,
    rgba(45,20,10,.55) 75%,
    rgba(45,20,10,.75) 100%);
}

/* Cover flower decorations */
.wc-cover-flower {
  position:absolute; pointer-events:none;
  animation:wcBloom 1.2s cubic-bezier(.34,1.4,.64,1) both;
}
.wc-cover-flower.cf-tl { top:-30px; left:-30px; font-size:160px; opacity:.35; animation-delay:.3s; filter:hue-rotate(-10deg); }
.wc-cover-flower.cf-tr { top:-20px; right:-20px; font-size:130px; opacity:.3; animation-delay:.5s; transform:scaleX(-1); }
.wc-cover-flower.cf-bl { bottom:120px; left:-20px; font-size:110px; opacity:.25; animation-delay:.7s; }
.wc-cover-flower.cf-br { bottom:100px; right:-20px; font-size:120px; opacity:.25; animation-delay:.6s; transform:scaleX(-1); }

/* Cover leaves */
.wc-cover-leaf {
  position:absolute; pointer-events:none; font-size:60px; opacity:.3;
}
.wc-cover-leaf.cl-1 { top:40px; left:80px; animation:wcLeafIn .8s ease .8s both; transform-origin:bottom center; }
.wc-cover-leaf.cl-2 { top:60px; right:70px; animation:wcLeafInR .8s ease .9s both; }
.wc-cover-leaf.cl-3 { bottom:150px; left:30px; animation:wcLeafIn .8s ease 1s both; }

.wc-cover-content {
  position:absolute;bottom:0;left:0;right:0;
  text-align:center;padding:0 24px 40px;
}

/* Gold geometric frame (CSS-drawn) */
.wc-geo-frame {
  position:absolute;inset:0;pointer-events:none;
}
.wc-geo-frame svg { width:100%;height:100%; }

/* Cover text */
.wc-cover-please {
  font-family:'Montserrat',sans-serif;
  font-size:10px;color:rgba(255,255,255,.7);
  letter-spacing:4px;text-transform:uppercase;
  margin:0 0 4px;
  animation:wcFadeUp .8s ease .4s both;
}
.wc-cover-name {
  font-family:'Great Vibes',cursive;
  font-size:clamp(50px,14vw,68px);
  color:#fff;
  line-height:1.1;margin:0;
  text-shadow:0 2px 20px rgba(0,0,0,.4),0 0 40px rgba(201,169,110,.3);
  animation:wcFadeUp .8s ease both;
}
.wc-cover-amp {
  font-family:'Cormorant Garamond',serif;
  font-size:20px;color:rgba(255,220,180,.8);
  letter-spacing:4px;margin:4px 0;
  animation:wcFadeUp .8s ease .2s both;
}
.wc-cover-date {
  display:inline-flex;align-items:center;gap:8px;
  margin-top:14px;
  background:rgba(201,169,110,.2);
  backdrop-filter:blur(8px);
  border:1px solid rgba(201,169,110,.4);
  color:#f5e5c0;
  border-radius:50px;padding:7px 22px;
  font-family:'Montserrat',sans-serif;
  font-size:12px;letter-spacing:2px;
  animation:wcFadeUp .8s ease .5s both;
}

/* ── Gold line divider ── */
.wc-gold-line {
  display:flex;align-items:center;gap:10px;
  margin:0 auto 20px;max-width:240px;
}
.wc-gold-line::before,.wc-gold-line::after {
  content:'';flex:1;height:1px;
  background:linear-gradient(to right,transparent,#c9a96e,transparent);
  animation:wcGoldLine .8s ease both;
}
.wc-gold-line span { font-size:12px;color:#c9a96e;letter-spacing:3px; }

/* ── Section ── */
.wc-sec {
  margin:0 12px 16px;
  border-radius:16px;
  overflow:visible;
  position:relative;
}

/* Section with flower decoration */
.wc-sec-inner {
  background:#fff;
  border-radius:16px;
  border:1px solid rgba(201,169,110,.2);
  box-shadow:0 4px 24px rgba(61,43,31,.07),0 1px 4px rgba(0,0,0,.04);
  overflow:hidden;
  position:relative;
}

/* Section title */
.wc-sec-title {
  text-align:center;
  padding:16px 20px 0;
  position:relative;
}
.wc-sec-title-text {
  font-family:'Montserrat',sans-serif;
  font-size:10px;font-weight:600;
  letter-spacing:3.5px;text-transform:uppercase;
  color:#c9a96e;
  display:inline-flex;align-items:center;gap:8px;
}
.wc-sec-title-text::before,.wc-sec-title-text::after {
  content:'';display:inline-block;width:24px;height:1px;
  background:linear-gradient(to right,transparent,#c9a96e);
}
.wc-sec-title-text::after {
  background:linear-gradient(to left,transparent,#c9a96e);
}

/* Section body */
.wc-sec-body { padding:16px 18px 20px; }

/* Section corner flowers */
.wc-sec-flower-tr {
  position:absolute;top:-20px;right:-15px;
  font-size:70px;opacity:.18;pointer-events:none;
  transform:rotate(20deg);
  z-index:0;
}
.wc-sec-flower-bl {
  position:absolute;bottom:-20px;left:-15px;
  font-size:60px;opacity:.15;pointer-events:none;
  transform:rotate(-15deg) scaleX(-1);
  z-index:0;
}

/* ── Greeting ── */
.wc-greeting {
  text-align:center;
  padding:28px 20px 20px;
  background:#fff;
  margin:0 12px 16px;
  border-radius:16px;
  border:1px solid rgba(201,169,110,.2);
  box-shadow:0 4px 24px rgba(61,43,31,.07);
  position:relative;
  overflow:hidden;
}
.wc-greeting::before {
  content:'🌸';
  position:absolute;top:-10px;right:-10px;
  font-size:80px;opacity:.1;
  pointer-events:none;
}
.wc-greeting::after {
  content:'🌸';
  position:absolute;bottom:-10px;left:-10px;
  font-size:70px;opacity:.1;
  pointer-events:none;transform:scaleX(-1);
}
.wc-greeting-invite {
  font-family:'Montserrat',sans-serif;
  font-size:10px;letter-spacing:3px;text-transform:uppercase;
  color:#c9a96e;margin:0 0 8px;
}
.wc-greeting-name {
  font-family:'Cormorant Garamond',serif;
  font-size:22px;font-style:italic;
  color:#3d2b1f;margin:0 0 6px;font-weight:400;
}
.wc-greeting-msg {
  font-family:'Cormorant Garamond',serif;
  font-size:14px;font-style:italic;
  color:#8a6a5a;line-height:1.7;margin:0;
}

/* ── Announcement ── */
.wc-announce {
  text-align:center;
  padding:24px 24px;
  background:linear-gradient(135deg,#fffaf7,#fef5ee);
  margin:0 12px 16px;
  border-radius:16px;
  border:1px solid rgba(201,169,110,.15);
  position:relative;overflow:hidden;
}
.wc-announce::before { content:'"';position:absolute;top:8px;left:14px;font-size:48px;color:rgba(201,169,110,.2);font-family:Georgia,serif;line-height:1; }
.wc-announce p {
  font-family:'Cormorant Garamond',serif;
  font-size:16px;font-style:italic;
  color:#5d3a28;line-height:1.9;margin:0;white-space:pre-line;
}

/* ── Family ── */
.wc-fam { display:grid;grid-template-columns:1fr 1px 1fr; }
.wc-fam-col { text-align:center;padding:4px 12px 0; }
.wc-fam-title { font-size:9px;color:#c9a96e;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px; }
.wc-fam-name { font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:#3d2b1f;line-height:1.4;margin:0 0 2px; }
.wc-fam-addr { font-size:11px;color:#9a7a6a;line-height:1.6;margin:6px 0 0; }
.wc-fam-div { background:rgba(201,169,110,.25); }

/* ── Couple ── */
.wc-couple {
  text-align:center;
  padding:28px 20px;
  background:#fff;
  margin:0 12px 16px;
  border-radius:16px;
  border:1px solid rgba(201,169,110,.2);
  box-shadow:0 4px 24px rgba(61,43,31,.07);
  position:relative;overflow:hidden;
}
.wc-couple-flower-l {
  position:absolute;left:-20px;top:50%;transform:translateY(-50%);
  font-size:100px;opacity:.12;pointer-events:none;
  animation:wcFloat 6s ease-in-out infinite;
}
.wc-couple-flower-r {
  position:absolute;right:-20px;top:50%;transform:translateY(-50%) scaleX(-1);
  font-size:100px;opacity:.12;pointer-events:none;
  animation:wcFloatR 7s ease-in-out infinite;
}
.wc-couple-name {
  font-family:'Great Vibes',cursive;
  font-size:clamp(34px,9vw,44px);
  color:#9c1647;line-height:1.2;margin:0;
  text-shadow:0 2px 8px rgba(156,22,71,.1);
}
.wc-couple-role {
  font-size:9px;color:#c9a96e;letter-spacing:3px;
  text-transform:uppercase;margin:3px 0 12px;
  font-family:'Montserrat',sans-serif;
}
.wc-couple-amp {
  font-family:'Cormorant Garamond',serif;
  font-size:32px;color:rgba(201,169,110,.5);
  margin:2px 0;display:block;font-style:italic;
}

/* ── Event card ── */
.wc-event {
  border:1px solid rgba(201,169,110,.2);
  border-radius:12px;padding:14px 16px;
  margin-bottom:10px;background:#fffaf7;
}
.wc-event:last-child{margin-bottom:0}
.wc-event-name {
  font-family:'Cormorant Garamond',serif;
  font-size:18px;font-weight:700;color:#9c1647;margin:0 0 8px;
}
.wc-chip {
  display:inline-flex;align-items:center;gap:4px;
  font-size:11px;color:#7a5a4a;
  background:rgba(201,169,110,.1);border-radius:20px;
  padding:4px 10px;margin:2px;
}

/* ── Reception ── */
.wc-rec { text-align:center;padding:8px 0 16px; }
.wc-rec-time {
  font-family:'Mali',Georgia,serif;
  font-size:56px;font-weight:700;color:#9c1647;
  line-height:1;margin:0 0 14px;letter-spacing:1px;
}
.wc-rec-date-row {
  display:flex;align-items:stretch;
  justify-content:center;margin-bottom:8px;
}
.wc-rec-dow,.wc-rec-month {
  font-size:10px;font-weight:700;color:#8a6a5a;
  letter-spacing:2px;padding:8px 12px;
  border:1px solid rgba(201,169,110,.3);background:#fffaf7;
  font-family:'Montserrat',sans-serif;
}
.wc-rec-dow { border-radius:8px 0 0 8px;border-right:none; }
.wc-rec-month { border-radius:0 8px 8px 0;border-left:none; }
.wc-rec-day {
  font-family:'Mali',Georgia,serif;
  font-size:64px;font-weight:700;color:#fff;
  background:linear-gradient(135deg,#c9a96e,#a07840);
  padding:2px 16px;line-height:1;letter-spacing:-1px;
}
.wc-rec-year { font-size:13px;color:#9a7a6a;letter-spacing:2px;margin-top:6px;font-family:'Mali',sans-serif; }
.wc-rec-rows { margin-top:12px;border-top:1px solid rgba(201,169,110,.2);padding-top:12px; }
.wc-rec-row { display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:13px; }
.wc-rec-lbl { color:#9a7a6a;font-size:12px; }
.wc-rec-val { font-weight:600;color:#9c1647;font-family:'Mali',sans-serif; }
.wc-rec-addr { font-size:13px;color:#5d3a28;line-height:1.7;margin:12px 0 0;text-align:center; }
.wc-map-btn {
  display:inline-flex;align-items:center;gap:6px;margin-top:12px;
  background:linear-gradient(135deg,#c9a96e,#a07840);color:#fff;
  border:none;border-radius:50px;padding:10px 24px;
  font-size:12px;font-weight:600;cursor:pointer;
  text-decoration:none;letter-spacing:1px;transition:opacity .2s;
  font-family:'Montserrat',sans-serif;
}
.wc-map-btn:hover{opacity:.85}

/* ── Bank ── */
.wc-bank {
  border-radius:16px;overflow:hidden;
  box-shadow:0 4px 20px rgba(201,169,110,.15);
  margin-bottom:14px;
}
.wc-bank:last-child{margin-bottom:0}
.wc-bank-head {
  background:linear-gradient(135deg,#c9a96e,#a07840);
  padding:14px 18px;display:flex;
  align-items:center;justify-content:space-between;
  position:relative;overflow:hidden;
}
.wc-bank-head::after {
  content:'';position:absolute;top:-20px;right:-20px;
  width:80px;height:80px;border-radius:50%;
  background:rgba(255,255,255,.1);
}
.wc-bank-name { font-size:11px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase; }
.wc-bank-icon { font-size:22px; }
.wc-bank-body { background:#fff;padding:16px 18px; }
.wc-bank-lbl { font-size:9px;color:#9a7a6a;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px; }
.wc-bank-num { font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#3d2b1f;letter-spacing:3px;margin:0 0 10px; }
.wc-bank-holder { display:flex;align-items:center;gap:10px; }
.wc-bank-avatar {
  width:32px;height:32px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#c9a96e,#a07840);
  display:flex;align-items:center;justify-content:center;font-size:14px;
}
.wc-bank-holder-name { font-size:13px;font-weight:600;color:#3d2b1f;text-transform:uppercase;letter-spacing:.5px; }
.wc-bank-qr { margin-top:14px;text-align:center; }
.wc-bank-qr-lbl { font-size:10px;color:#9a7a6a;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px; }
.wc-bank-qr img { max-width:160px;width:100%;border-radius:8px;border:1px solid rgba(201,169,110,.2);display:inline-block; }

/* ── RSVP ── */
.wc-rsvp-inner {
  background:linear-gradient(135deg,#fffaf7,#fef5ee);
  border-radius:14px;padding:20px 16px;
}

/* ── Guestbook ── */
.wc-guestbook-empty { text-align:center;padding:16px 0;color:#9a7a6a;font-size:13px;font-style:italic; }

/* ── Thanks ── */
.wc-thanks p {
  font-family:'Cormorant Garamond',serif;
  font-size:16px;font-style:italic;color:#5d3a28;
  line-height:1.8;margin:0;text-align:center;
}

/* ── Footer ── */
.wc-footer {
  text-align:center;padding:40px 20px 80px;
  position:relative;overflow:hidden;
  background:linear-gradient(to bottom,transparent,rgba(201,169,110,.08));
}
.wc-footer-flower-l {
  position:absolute;left:-20px;bottom:0;
  font-size:140px;opacity:.12;pointer-events:none;
  animation:wcFloat 8s ease-in-out infinite;
}
.wc-footer-flower-r {
  position:absolute;right:-20px;bottom:0;
  font-size:140px;opacity:.12;pointer-events:none;
  transform:scaleX(-1);
  animation:wcFloatR 9s ease-in-out infinite;
}
.wc-footer-ring { font-size:32px;display:inline-block;animation:wcPulse 3s ease-in-out infinite;margin-bottom:12px; }
.wc-footer-names {
  font-family:'Great Vibes',cursive;
  font-size:clamp(32px,10vw,44px);
  color:#9c1647;margin:0 0 6px;
  text-shadow:0 2px 8px rgba(156,22,71,.15);
}
.wc-footer-sub {
  font-family:'Cormorant Garamond',serif;
  font-size:13px;color:#c9a96e;letter-spacing:3px;
  text-transform:uppercase;font-style:italic;
}
.wc-footer-attr { font-size:10px;color:#c9a96e;opacity:.5;margin-top:20px;letter-spacing:1px; }

/* ── Music btn ── */
@keyframes wcMusicGlow {
  0%,100%{box-shadow:0 4px 14px rgba(201,169,110,.4)}
  50%{box-shadow:0 4px 28px rgba(201,169,110,.8)}
}
.wc-music-btn {
  position:fixed;bottom:24px;right:24px;z-index:9999;
  width:46px;height:46px;border-radius:50%;border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;
  background:linear-gradient(135deg,#c9a96e,#a07840);color:#fff;
}
.wc-music-btn.playing{animation:wcMusicGlow 1.5s ease infinite}

/* ── Dress code ── */
.wc-dress { text-align:center;padding:8px 0; }
.wc-dress p { font-size:14px;color:#5d3a28;line-height:1.7;margin:0; }

/* ── Mobile ── */
@media(max-width:390px){
  .wc-sec-body{padding:14px 12px}
  .wc-rec-day{font-size:48px}
  .wc-bank-num{font-size:18px}
  .g-carousel-item.pos-0{width:200px;height:290px}
  .g-carousel-item.pos-n1,.g-carousel-item.pos-1{width:140px;height:210px}
}
`

// ─── Flower decorations ───────────────────────────────────────────────────────
function FloatingFlowers() {
  return null // removed per user request
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Sec({ title, children, flowerL = '🌸', flowerR = '🌺' }: {
  title: string; children: React.ReactNode; flowerL?: string; flowerR?: string
}) {
  return (
    <div className="wc-sec">
      <div className="wc-sec-inner">
        <div className="wc-sec-flower-tr">{flowerR}</div>
        <div className="wc-sec-flower-bl">{flowerL}</div>
        <div className="wc-sec-title">
          <span className="wc-sec-title-text">{title}</span>
        </div>
        <div className="wc-sec-body">{children}</div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WeddingCard({ wedding, guest }: { wedding: WeddingData; guest: GuestData }) {
  const reception  = (wedding.reception  as ReceptionData|null) ?? null
  const events     = (wedding.events     as EventItem[])        ?? []
  const rsvpConfig = (wedding.rsvpConfig as RSVPConfig|null)    ?? null
  const dressCode  = (wedding.dressCode  as DressCodeData|null) ?? null
  const groomFam   = (wedding.groomFamily as FamilyData|null)   ?? null
  const brideFam   = (wedding.brideFamily as FamilyData|null)   ?? null
  const banks      = (wedding.bankAccounts as BankAccount[])    ?? []

  const groom = wedding.groomShort || wedding.groomName
  const bride = wedding.brideShort || wedding.brideName
  const isGroomFirst = wedding.displayOrder !== 'bride_first'
  const left  = isGroomFirst ? groom : bride
  const right = isGroomFirst ? bride : groom
  const leftTitle  = isGroomFirst ? wedding.groomTitle : wedding.brideTitle
  const rightTitle = isGroomFirst ? wedding.brideTitle : wedding.groomTitle
  const recDate = reception?.date ? reception.date+'T'+(reception.time??'00:00')+':00' : null
  const submitted = guest.rsvpStatus !== 'pending' || !!guest.answeredAt
  const dateParts = reception?.date ? fmtDateVi(reception.date) : null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {wedding.bgMusicUrl && <MusicPlayer
        musicUrl={wedding.bgMusicUrl}
        groomName={wedding.groomShort || wedding.groomName}
        brideName={wedding.brideShort || wedding.brideName}
        weddingDate={reception?.date ? (() => {
          try {
            const d = new Date(reception.date + 'T00:00:00')
            const dows = ['CN','T2','T3','T4','T5','T6','T7']
            return `${dows[d.getDay()]}, ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
          } catch { return reception.date }
        })() : undefined}
      />}

      <div className="wc">
        <FloatingFlowers />
        <div className="wc-inner">

          {/* ── 1. COVER ── */}
          <div className="wc-cover">
            {wedding.coverPhotoUrl
              ? <img {...responsiveImg(wedding.coverPhotoUrl, [640, 828, 1080, 1200, 1920], 90)} sizes="(max-width: 480px) 100vw, 480px" alt="Cover" className="wc-cover-img" fetchPriority="high" /> // eslint-disable-line @next/next/no-img-element
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(160deg,#fde8e8,#f9d0d8,#f5b8c4)'}} />
            }
            <div className="wc-cover-overlay" />

            {/* Gold geometric frame SVG */}
            <div className="wc-geo-frame">
              <svg viewBox="0 0 360 600" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="180,20 340,100 340,500 180,580 20,500 20,100" stroke="rgba(201,169,110,0.35)" strokeWidth="1" fill="none"/>
                <polygon points="180,35 325,108 325,492 180,565 35,492 35,108" stroke="rgba(201,169,110,0.2)" strokeWidth="0.5" fill="none"/>
              </svg>
            </div>

            <div className="wc-cover-content">
              <p className="wc-cover-name f-script">{left}</p>
              <p className="wc-cover-amp">&amp;</p>
              <p className="wc-cover-name f-script">{right}</p>
              {reception?.date && (
                <div style={{marginTop:14}}>
                  <span className="wc-cover-date">
                    💍 &nbsp; {dateParts?.dow}, {dateParts?.day} {dateParts?.month} {dateParts?.year}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. GREETING ── */}
          <ScrollReveal direction="up" delay={0}>
            <div className="wc-greeting">
              <p className="wc-greeting-invite">trân trọng kính mời</p>
              <p className="wc-greeting-name f-serif">
                <em>{guest.greeting},</em><br/><strong>{guest.name}</strong>
              </p>
              {guest.message && <p className="wc-greeting-msg">"{guest.message}"</p>}
            </div>
          </ScrollReveal>

          {/* ── 3. THÔNG TIN GIA ĐÌNH ── */}
          {(groomFam || brideFam) && (
            <ScrollReveal direction="left">
              <Sec title="THÔNG TIN GIA ĐÌNH" flowerL="🌿" flowerR="🍃">
                <div className="wc-fam">
                  <div className="wc-fam-col">
                    <p className="wc-fam-title">{groomFam?.title ?? 'Nhà Trai'}</p>
                    {groomFam?.fatherName && <p className="wc-fam-name f-serif">{groomFam.fatherName}</p>}
                    {groomFam?.motherName && <p className="wc-fam-name f-serif">{groomFam.motherName}</p>}
                    {groomFam?.address && <p className="wc-fam-addr">{groomFam.address}</p>}
                  </div>
                  <div className="wc-fam-div" />
                  <div className="wc-fam-col">
                    <p className="wc-fam-title">{brideFam?.title ?? 'Nhà Gái'}</p>
                    {brideFam?.fatherName && <p className="wc-fam-name f-serif">{brideFam.fatherName}</p>}
                    {brideFam?.motherName && <p className="wc-fam-name f-serif">{brideFam.motherName}</p>}
                    {brideFam?.address && <p className="wc-fam-addr">{brideFam.address}</p>}
                  </div>
                </div>
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 4. ANNOUNCEMENT ── */}
          {wedding.announcement && (
            <ScrollReveal direction="up">
              <div className="wc-announce">
                <p>{wedding.announcement}</p>
              </div>
            </ScrollReveal>
          )}

          {/* ── 5. TÊN ĐÔI ── */}
          <ScrollReveal direction="fade">
            <div className="wc-couple">
              <div className="wc-couple-flower-l">🌸</div>
              <div className="wc-couple-flower-r">🌺</div>
              <div className="wc-gold-line"><span>✦</span></div>
              <p className="wc-couple-name f-script">{left}</p>
              <p className="wc-couple-role">{leftTitle}</p>
              <span className="wc-couple-amp f-serif">&amp;</span>
              <p className="wc-couple-name f-script">{right}</p>
              <p className="wc-couple-role">{rightTitle}</p>
              <div className="wc-gold-line" style={{marginTop:16,marginBottom:0}}><span>✦</span></div>
            </div>
          </ScrollReveal>

          {/* ── 6. LỄ ── */}
          {events.length > 0 && (
            <ScrollReveal direction="right">
              <Sec title="THÔNG TIN LỄ CƯỚI" flowerL="🌸" flowerR="🌼">
                {events.map((ev, i) => (
                  <div key={ev.id??i} className="wc-event">
                    <p className="wc-event-name f-serif">{ev.name||ev.type}</p>
                    <div>
                      {ev.date && <span className="wc-chip">📅 {fmtDateVi(ev.date).dow}, {fmtDateVi(ev.date).day}</span>}
                      {ev.time && <span className="wc-chip">🕐 {fmtTime(ev.time)}</span>}
                      {ev.address && <span className="wc-chip">📍 {ev.address}</span>}
                    </div>
                  </div>
                ))}
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 7. ALBUM ── */}
          {wedding.galleryUrls.length > 0 && (
            <ScrollReveal direction="up">
              <Sec title="ALBUM ẢNH CƯỚI" flowerL="🌺" flowerR="🌸">
                <GalleryView urls={wedding.galleryUrls} style={wedding.galleryStyle} />
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 8. TIỆC CƯỚI ── */}
          {reception?.date && (
            <ScrollReveal direction="left">
              <Sec title="THÔNG TIN TIỆC CƯỚI" flowerL="🌼" flowerR="🌺">
                <div className="wc-rec">
                  {/* Label trước giờ */}
                  {reception.time && (
                    <p style={{
                      fontFamily:"'Montserrat',sans-serif",
                      fontSize:11,letterSpacing:2,textTransform:'uppercase',
                      color:'#9a7a6a',margin:'0 0 6px',
                    }}>
                      Hôn lễ sẽ được cử hành vào lúc:
                    </p>
                  )}
                  {reception.time && <p className="wc-rec-time">{reception.time}</p>}
                  {dateParts && (
                    <div className="wc-rec-date-row">
                      <span className="wc-rec-dow">{dateParts.dow}</span>
                      <span className="wc-rec-day">{dateParts.day}</span>
                      <span className="wc-rec-month">{dateParts.month}</span>
                    </div>
                  )}
                  <p className="wc-rec-year">{dateParts?.year}</p>

                  {(reception.showArrivalTime||reception.showStartTime) && (
                    <div className="wc-rec-rows">
                      {reception.showArrivalTime&&reception.arrivalTime&&(
                        <div className="wc-rec-row"><span className="wc-rec-lbl">Đón khách</span><span className="wc-rec-val">{fmtTime(reception.arrivalTime)}</span></div>
                      )}
                      {reception.showStartTime&&reception.startTime&&(
                        <div className="wc-rec-row"><span className="wc-rec-lbl">Khai tiệc</span><span className="wc-rec-val">{fmtTime(reception.startTime)}</span></div>
                      )}
                    </div>
                  )}

                  {/* Calendar trước địa chỉ */}
                  <MiniCalendar dateStr={reception.date} />

                  {reception.address && (
                    <>
                      <p className="wc-rec-addr">📍 {reception.address}</p>
                      {reception.showMap && (
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reception.address)}`}
                          target="_blank" rel="noopener noreferrer" className="wc-map-btn">
                          🗺️ Xem chỉ đường
                        </a>
                      )}
                    </>
                  )}
                </div>
                {reception.showMap && reception.address && (
                  <div style={{marginTop:16,borderRadius:12,overflow:'hidden',border:'1px solid rgba(201,169,110,.2)'}}>
                    <iframe title="Bản đồ"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(reception.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      style={{width:'100%',height:160,border:'none',display:'block'}}
                      loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 9. ĐẾM NGƯỢC ── */}
          {reception?.showCountdown && recDate && (
            <ScrollReveal direction="up">
              <Sec title="CÙNG ĐẾM NGƯỢC" flowerL="🌸" flowerR="🌼">
                <Countdown targetDate={recDate} />
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 10. RSVP ── */}
          {rsvpConfig?.enabled && (
            <ScrollReveal direction="right">
              <Sec title="XÁC NHẬN THAM DỰ" flowerL="🌺" flowerR="🌸">
                <div className="wc-rsvp-inner">
                  <RSVPForm weddingSlug={wedding.slug} guestSlug={guest.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rsvpConfig={rsvpConfig as any} isSubmitted={submitted} />
                </div>
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 11. DRESS CODE ── */}
          {(dressCode?.enabled||dressCode?.visible) && (
            <ScrollReveal direction="left">
              <Sec title="DRESS CODE" flowerL="🌿" flowerR="🍃">
                <div className="wc-dress">
                  {dressCode.instructions && <p>{dressCode.instructions}</p>}
                </div>
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 12. HỘP QUÀ ── */}
          {banks.length > 0 && (
            <ScrollReveal direction="up">
              <Sec title="HỘP QUÀ MỪNG" flowerL="🌸" flowerR="🌺">
                {banks.map((b, i) => (
                  <div key={b.id??i} className="wc-bank">
                    <div className="wc-bank-head">
                      <span className="wc-bank-name">{b.bankName}</span>
                      <span className="wc-bank-icon">💳</span>
                    </div>
                    <div className="wc-bank-body">
                      <p className="wc-bank-lbl">Số tài khoản</p>
                      <p className="wc-bank-num">{b.accountNumber}</p>
                      <div className="wc-bank-holder">
                        <div className="wc-bank-avatar">👤</div>
                        <p className="wc-bank-holder-name">{b.accountHolder}</p>
                      </div>
                      {b.qrCodeUrl && (
                        <div style={{marginTop:14,textAlign:'center'}}>
                          <p style={{fontSize:10,color:'#9a7a6a',letterSpacing:2,textTransform:'uppercase',margin:'0 0 8px'}}>QR Chuyển khoản</p>
                          <img src={optimizedImg(b.qrCodeUrl, 640, 90)} alt="QR Code" decoding="async" style={{maxWidth:160,width:'100%',borderRadius:8,border:'1px solid rgba(201,169,110,.2)',display:'inline-block'}} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 13. SỔ LƯU BÚT ── */}
          {wedding.guestbook && (
            <ScrollReveal direction="right">
              <Sec title="SỔ LƯU BÚT" flowerL="🌼" flowerR="🌸">
                <Guestbook weddingSlug={wedding.slug} guestName={guest.name} />
              </Sec>
            </ScrollReveal>
          )}

          {/* ── 14. LỜI CẢM ƠN ── */}
          {wedding.thankYouMsg && (
            <ScrollReveal direction="up">
              <Sec title="LỜI CẢM ƠN" flowerL="🌺" flowerR="🌼">
                <div className="wc-thanks"><p>{wedding.thankYouMsg}</p></div>
              </Sec>
            </ScrollReveal>
          )}

          {/* ── FOOTER ── */}
          <ScrollReveal direction="fade">
            <div className="wc-footer">
              <div className="wc-footer-flower-l">🌸</div>
              <div className="wc-footer-flower-r">🌺</div>
              <div className="wc-footer-ring">💍</div>
              <div className="wc-gold-line" style={{marginBottom:12}}><span>✦</span></div>
              <p className="wc-footer-names f-script">{left}</p>
              <p className="f-cormorant" style={{fontSize:22,color:'rgba(201,169,110,.5)',margin:'0 0 2px',fontStyle:'italic'}}>&amp;</p>
              <p className="wc-footer-names f-script">{right}</p>
              <p className="wc-footer-sub f-serif">Forever &amp; Always</p>
              <div className="wc-gold-line" style={{marginTop:16,marginBottom:0}}><span>✦</span></div>
              <p className="wc-footer-attr">♡ Thiệp cưới điện tử</p>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </>
  )
}
