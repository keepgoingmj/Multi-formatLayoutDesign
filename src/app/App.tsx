import { useState } from "react";
import { Plus, X, Monitor, Smartphone, QrCode, Palette } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import gsLogo from "@/imports/GS_logo_1.png";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Format = "landscape" | "portrait";
export type CategoryMode = "main" | "work" | "life" | "etc";

export interface BulletItem {
  id: string;
  text: string;
  subText: string;
  showSub: boolean;
}

export interface SharedVars {
  categoryLabel: string;
  highlightText: string;
  qrUrl: string;
  qrLabel: string;
}

export interface FormatVars {
  title: string;
  description: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_LANDSCAPE = { w: 1200, h: 675, scale: 0.68 };
const CANVAS_PORTRAIT  = { w: 675,  h: 1200, scale: 0.52 };

const GS_BLUE = "#0068B7";

// 리뉴얼 디자인 시스템 3색 (참조용)
const DS_BLUE  = "#4878CC";
const DS_GREEN = "#43A876";
const DS_CORAL = "#E5623A";

const CATEGORIES: Record<CategoryMode, { name: string }> = {
  main: { name: "메인" },
  work: { name: "업무공유" },
  life: { name: "생활안내" },
  etc:  { name: "기타" },
};

const CANVAS_THEME = {
  // 흰 바탕 + 업무공유 파란 그라데이션을 텍스트에 적용
  main: {
    bg:            "#FFFFFF",
    title:         "#091E5A",
    titleGradient: "linear-gradient(145deg, #091E5A 0%, #1040C4 48%, #1A5AFF 100%)",
    body:          "rgba(9,30,90,0.52)",
    accent:        "#1040C4",
    highlight:     "#1040C4",
    logoFilter:    "none",
  },
  // 깊고 선명한 디지털 블루 — 골드 강조색과 최적의 시인성
  work: {
    bg:         `linear-gradient(145deg, #091E5A 0%, #1040C4 48%, #1A5AFF 100%)`,
    title:      "#FFFFFF",
    body:       "rgba(255,255,255,0.72)",
    accent:     "#FFD060",
    highlight:  "#FFD060",
    logoFilter: "brightness(0) invert(1)",
  },
  // DS_GREEN (#43A876) → 진한 네이비 안으로 깊은 초록이 녹아드는 느낌
  life: {
    bg:         `linear-gradient(155deg, #001F42 0%, #001E30 45%, #072A1E 100%)`,
    title:      "#FFFFFF",
    body:       "rgba(255,255,255,0.62)",
    accent:     "#4FD99A",
    highlight:  "#4FD99A",
    logoFilter: "brightness(0) invert(1)",
  },
  // DS_CORAL (#E5623A) → 짙은 흑갈색 안으로 뜨거운 코랄이 번지는 느낌
  etc: {
    bg:         `linear-gradient(155deg, #1C0500 0%, #200A05 45%, #2A0E08 100%)`,
    title:      "#FFFFFF",
    body:       "rgba(255,255,255,0.62)",
    accent:     "#FF7B5A",
    highlight:  "#FF7B5A",
    logoFilter: "brightness(0) invert(1)",
  },
};

// ─── Initial values ───────────────────────────────────────────────────────────

const INIT_SHARED: SharedVars = {
  categoryLabel: "GS OFFICE LIFE",
  highlightText: "월요일: 1,6 / 화요일: 2,7 / 수요일: 3,8 / 목요일: 4,9 / 금요일: 5,0",
  qrUrl:  "",
  qrLabel: "",
};

const INIT_L_VARS: FormatVars = {
  title:       "자율적 차량5부제 실시",
  description: "에너지 절감 기조에 발맞춰, GS그룹도 자율적으로 '차량 5부제'에 함께 하고자 합니다.",
};

const INIT_P_VARS: FormatVars = {
  title:       "자율적\n차량5부제\n실시",
  description: "에너지 절감 기조에 발맞춰\nGS그룹도 자율적으로 함께 합니다.",
};

const INIT_BULLETS: BulletItem[] = [
  { id: "1", text: "대상: 친환경차를 제외한 승용차/업무용 및 임산부·장애 동승 제외", subText: "", showSub: false },
  { id: "2", text: "기간: 정해지면 공표 시행까지", subText: "", showSub: false },
  { id: "3", text: "방식: 차량 번호 끝자리에 따라 해당 요일 운행·시내 주차 자제", subText: "대중교통 이용 적극 권장", showSub: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bulletFontSize(count: number, base: number): number {
  if (count <= 2) return base + 6;
  if (count <= 3) return base + 3;
  if (count <= 4) return base;
  if (count <= 5) return base - 2;
  return base - 4;
}

// ─── Canvas Wrapper ───────────────────────────────────────────────────────────

function CanvasWrapper({ w, h, scale, children }: {
  w: number; h: number; scale: number; children: React.ReactNode;
}) {
  return (
    <div style={{
      width: w * scale, height: h * scale,
      flexShrink: 0, overflow: "hidden", position: "relative",
      boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)",
    }}>
      <div style={{
        width: w, height: h,
        position: "absolute", top: 0, left: 0,
        transform: `scale(${scale})`, transformOrigin: "top left",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Landscape Canvas ─────────────────────────────────────────────────────────

// ─── Work accent options ──────────────────────────────────────────────────────

const WORK_ACCENTS = [
  { label: "라임",   color: "#AEFF6E" },
  { label: "민트",   color: "#4DFFD4" },
  { label: "골드",   color: "#FFD060" },
  { label: "코랄",   color: "#FF8C69" },
  { label: "핑크",   color: "#FFB0CC" },
  { label: "화이트", color: "#FFFFFF" },
];

export function LandscapeCanvas({ shared, fmtVars, bullets, showHighlight, showQR, catMode, accentOverride, scale }: {
  shared: SharedVars; fmtVars: FormatVars; bullets: BulletItem[];
  showHighlight: boolean; showQR: boolean; catMode: CategoryMode; accentOverride?: string; scale?: number;
}) {
  const { w, h } = CANVAS_LANDSCAPE;
  const base = CANVAS_THEME[catMode];
  const t = accentOverride
    ? { ...base, accent: accentOverride, highlight: accentOverride }
    : base;
  const titleStyle: React.CSSProperties = "titleGradient" in t && t.titleGradient
    ? { background: t.titleGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
    : { color: t.title };
  const bSize = bulletFontSize(bullets.length, 18);

  return (
    <CanvasWrapper w={w} h={h} scale={scale ?? CANVAS_LANDSCAPE.scale}>
      <div style={{ width: w, height: h, background: t.bg, display: "flex", flexDirection: "column" }}>

        {/* Brand label */}
        <div style={{ padding: "32px 80px 0", textAlign: "center", flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 500, letterSpacing: "0.26em",
            textTransform: "uppercase", color: t.accent,
            fontFamily: "'DM Mono', monospace",
          }}>
            {shared.categoryLabel}
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 80px 0", overflow: "hidden" }}>

          {/* Title */}
          <div style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 78, fontWeight: 900, lineHeight: 1.18,
            marginBottom: 18,
            whiteSpace: "pre-line", letterSpacing: "-0.025em",
            textAlign: "center",
            ...titleStyle,
          }}>
            {fmtVars.title}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 20, lineHeight: 1.7, color: t.accent,
            marginBottom: 52, fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "center", whiteSpace: "pre-line",
          }}>
            {fmtVars.description}
          </div>

          {/* Bullets + QR */}
          <div style={{ display: "flex", gap: 40, flex: 1, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              {bullets.map((b) => (
                <div key={b.id}>
                  <div style={{ fontSize: bSize, lineHeight: 1.6, color: t.title, fontFamily: "'Noto Sans KR', sans-serif" }}>
                    {b.text}
                  </div>
                  {b.showSub && b.subText && (
                    <div style={{ fontSize: bSize - 4, color: t.body, marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                      ({b.subText})
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showQR && shared.qrUrl && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>
                  <QRCodeSVG value={shared.qrUrl} size={148} />
                </div>
                {shared.qrLabel && (
                  <div style={{ fontSize: 13, color: t.body, textAlign: "center", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.35, maxWidth: 168, wordBreak: "keep-all" }}>
                    {shared.qrLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: highlight + logo */}
        <div style={{ flexShrink: 0 }}>
          {showHighlight && shared.highlightText && (
            <div style={{ padding: "20px 80px 0" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: t.highlight, fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.4, letterSpacing: "-0.01em", textAlign: "center" }}>
                {shared.highlightText}
              </div>
            </div>
          )}
          <div style={{ padding: "20px 0 28px", display: "flex", justifyContent: "center" }}>
            <img src={gsLogo} alt="GS" style={{ height: 68, width: "auto", filter: t.logoFilter }} />
          </div>
        </div>

      </div>
    </CanvasWrapper>
  );
}

// ─── Portrait Canvas ──────────────────────────────────────────────────────────

export function PortraitCanvas({ shared, fmtVars, bullets, showHighlight, showQR, catMode, scale }: {
  shared: SharedVars; fmtVars: FormatVars; bullets: BulletItem[];
  showHighlight: boolean; showQR: boolean; catMode: CategoryMode; scale?: number;
}) {
  const { w, h } = CANVAS_PORTRAIT;
  const t = CANVAS_THEME[catMode];
  const bSize = bulletFontSize(bullets.length, 26);
  const titleStyle: React.CSSProperties = "titleGradient" in t && t.titleGradient
    ? { background: t.titleGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
    : { color: t.title };

  return (
    <CanvasWrapper w={w} h={h} scale={scale ?? CANVAS_PORTRAIT.scale}>
      <div style={{ width: w, height: h, background: t.bg, display: "flex", flexDirection: "column" }}>

        {/* Brand label */}
        <div style={{ padding: "40px 110px 0 56px", flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 500, letterSpacing: "0.26em",
            textTransform: "uppercase", color: t.accent,
            fontFamily: "'DM Mono', monospace",
          }}>
            {shared.categoryLabel}
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 110px 0 56px", overflow: "hidden" }}>

          {/* Title */}
          <div style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 90, fontWeight: 900, lineHeight: 1.18,
            marginBottom: 20,
            whiteSpace: "pre-line", letterSpacing: "-0.03em",
            textAlign: "left", wordBreak: "keep-all", overflowWrap: "anywhere",
            ...titleStyle,
          }}>
            {fmtVars.title}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 24, lineHeight: 1.65, color: t.accent,
            marginBottom: 60, fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "left", whiteSpace: "pre-line",
            wordBreak: "keep-all", overflowWrap: "anywhere",
          }}>
            {fmtVars.description}
          </div>

          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "center" }}>
            {bullets.map((b) => (
              <div key={b.id} style={{ fontSize: bSize, lineHeight: 1.6, color: t.title, fontFamily: "'Noto Sans KR', sans-serif", wordBreak: "keep-all", overflowWrap: "anywhere" }}>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: QR + highlight + logo */}
        <div style={{ flexShrink: 0 }}>
          {showQR && shared.qrUrl && (
            <div style={{ padding: "20px 110px 0 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>
                <QRCodeSVG value={shared.qrUrl} size={130} />
              </div>
              {shared.qrLabel && (
                <div style={{ fontSize: 16, color: t.body, textAlign: "center", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.4 }}>
                  {shared.qrLabel}
                </div>
              )}
            </div>
          )}
          {showHighlight && shared.highlightText && (
            <div style={{ padding: "20px 110px 0 56px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.highlight, fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.5, textAlign: "left", wordBreak: "keep-all" }}>
                {shared.highlightText}
              </div>
            </div>
          )}
          <div style={{ padding: "24px 0 32px", display: "flex", justifyContent: "center" }}>
            <img src={gsLogo} alt="GS" style={{ height: 72, width: "auto", filter: t.logoFilter }} />
          </div>
        </div>

      </div>
    </CanvasWrapper>
  );
}

// ─── Sidebar primitives ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(247,243,236,0.3)", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const base: React.CSSProperties = {
    width: "100%", background: "rgba(247,243,236,0.05)",
    border: "1px solid rgba(247,243,236,0.09)", borderRadius: 6,
    padding: "8px 11px", color: "#F7F3EC", fontSize: 12.5, outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5, resize: "none",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: "rgba(247,243,236,0.38)", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={base} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function Toggle({ on, onToggle, color }: { on: boolean; onToggle: () => void; color: string }) {
  return (
    <button onClick={onToggle} style={{
      width: 36, height: 20, borderRadius: 10, border: "none",
      background: on ? color : "rgba(247,243,236,0.12)",
      cursor: "pointer", position: "relative", transition: "background 0.15s", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
    </button>
  );
}

// ─── Bullet Editor ────────────────────────────────────────────────────────────

function BulletEditor({ bullets, onChange }: { bullets: BulletItem[]; onChange: (b: BulletItem[]) => void }) {
  const update = (id: string, key: keyof BulletItem, val: string | boolean) =>
    onChange(bullets.map(b => b.id === id ? { ...b, [key]: val } : b));
  const remove = (id: string) => onChange(bullets.filter(b => b.id !== id));
  const add = () => onChange([...bullets, { id: `${Date.now()}`, text: "", subText: "", showSub: false }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {bullets.map((b, i) => (
        <div key={b.id} style={{ background: "rgba(247,243,236,0.04)", border: "1px solid rgba(247,243,236,0.07)", borderRadius: 7, padding: "10px 11px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(247,243,236,0.25)", marginTop: 1, flexShrink: 0, fontFamily: "'DM Mono', monospace", minWidth: 16 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <input type="text" value={b.text} onChange={e => update(b.id, "text", e.target.value)} placeholder="불릿 내용"
              style={{ flex: 1, background: "transparent", border: "none", color: "#F7F3EC", fontSize: 12, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            <button onClick={() => remove(b.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(247,243,236,0.22)", padding: 2, flexShrink: 0 }}>
              <X size={11} />
            </button>
          </div>
          <div style={{ paddingLeft: 24, marginTop: 7 }}>
            <button onClick={() => update(b.id, "showSub", !b.showSub)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: b.showSub ? "rgba(247,243,236,0.55)" : "rgba(247,243,236,0.2)", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", padding: 0, marginBottom: b.showSub ? 6 : 0 }}>
              {b.showSub ? "▾ 보조 설명" : "▸ 보조 설명"}
            </button>
            {b.showSub && (
              <input type="text" value={b.subText} onChange={e => update(b.id, "subText", e.target.value)} placeholder="출처 또는 보조 설명"
                style={{ display: "block", width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(247,243,236,0.1)", color: "rgba(247,243,236,0.45)", fontSize: 11, outline: "none", padding: "2px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            )}
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background: "transparent", border: "1px dashed rgba(247,243,236,0.14)", borderRadius: 7, padding: "8px 0", color: "rgba(247,243,236,0.3)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Plus size={12} /> 불릿 추가
      </button>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [format, setFormat]               = useState<Format>("landscape");
  const [catMode, setCatMode]             = useState<CategoryMode>("work");
  const [shared, setShared]               = useState<SharedVars>(INIT_SHARED);
  const [showHighlight, setShowHighlight] = useState(true);
  const [showQR, setShowQR]               = useState(false);
  const [lVars, setLVars]                 = useState<FormatVars>(INIT_L_VARS);
  const [pVars, setPVars]                 = useState<FormatVars>(INIT_P_VARS);
  const [bullets, setBullets]             = useState<BulletItem[]>(INIT_BULLETS);
  const [workAccent, setWorkAccent]       = useState<string>("#FFD060");
  const [compareMode, setCompareMode]     = useState(false);

  const fmtVars    = format === "landscape" ? lVars : pVars;
  const setFmtVars = format === "landscape" ? setLVars : setPVars;
  const setField   = (key: keyof SharedVars, val: string) => setShared(p => ({ ...p, [key]: val }));

  const uiAccent    = catMode === "etc" ? DS_CORAL : catMode === "life" ? DS_GREEN : DS_BLUE;

  const activeAccent = catMode === "work" ? workAccent : undefined;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0D0C0A", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden", color: "#F7F3EC" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 304, height: "100vh", background: "#111009", borderRight: "1px solid rgba(247,243,236,0.07)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

        <div style={{ padding: "18px 20px 15px", borderBottom: "1px solid rgba(247,243,236,0.07)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em" }}>컨텐츠 편집기</div>
          <div style={{ fontSize: 10, color: "rgba(247,243,236,0.28)", marginTop: 3, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>가로 · 세로 동시 편집</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>

          {/* Format */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <SectionLabel>포맷</SectionLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {(["landscape", "portrait"] as Format[]).map(f => (
                <button key={f} onClick={() => setFormat(f)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  background: format === f ? uiAccent : "rgba(247,243,236,0.06)",
                  color: format === f ? "#fff" : "rgba(247,243,236,0.4)",
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
                }}>
                  {f === "landscape" ? <Monitor size={13} /> : <Smartphone size={13} />}
                  {f === "landscape" ? "가로" : "세로"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <SectionLabel>카테고리</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {(Object.entries(CATEGORIES) as [CategoryMode, { name: string }][]).map(([k, v]) => {
                const accent = CANVAS_THEME[k].accent;
                const active = catMode === k;
                return (
                  <button key={k} onClick={() => setCatMode(k)} style={{
                    padding: "9px 12px", borderRadius: 6, cursor: "pointer",
                    border: active ? `1.5px solid ${accent}` : "1px solid rgba(247,243,236,0.08)",
                    background: active ? `${accent}18` : "transparent",
                    color: active ? "#fff" : "rgba(247,243,236,0.4)",
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
                      {v.name}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: active ? "rgba(255,255,255,0.4)" : "rgba(247,243,236,0.2)" }}>
                      {k === "main" || k === "work" ? "밝음" : "어두움"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shared */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <SectionLabel>공유</SectionLabel>
            <Field label="브랜드 라벨" value={shared.categoryLabel} onChange={v => setField("categoryLabel", v)} placeholder="GS OFFICE LIFE" />
          </div>

          {/* Per-format */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <SectionLabel>{format === "landscape" ? "가로형 텍스트" : "세로형 텍스트"}</SectionLabel>
            <Field label="제목 (Enter = 줄바꿈)" value={fmtVars.title} onChange={v => setFmtVars(p => ({ ...p, title: v }))} placeholder="제목" multiline />
            <Field label="설명 문장 (Enter = 줄바꿈)" value={fmtVars.description} onChange={v => setFmtVars(p => ({ ...p, description: v }))} placeholder="설명" multiline />
          </div>

          {/* Highlight */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>강조 텍스트</SectionLabel>
              <Toggle on={showHighlight} onToggle={() => setShowHighlight(p => !p)} color={uiAccent} />
            </div>
            <Field label="내용" value={shared.highlightText} onChange={v => setField("highlightText", v)} placeholder="강조 내용" multiline />
          </div>

          {/* QR */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <QrCode size={13} color="rgba(247,243,236,0.4)" />
                <SectionLabel>QR 코드</SectionLabel>
              </div>
              <Toggle on={showQR} onToggle={() => setShowQR(p => !p)} color={uiAccent} />
            </div>
            {showQR && (
              <>
                <Field label="연결 URL" value={shared.qrUrl} onChange={v => setField("qrUrl", v)} placeholder="https://..." />
                <Field label="QR 설명 (선택)" value={shared.qrLabel} onChange={v => setField("qrLabel", v)} placeholder="자세히 보기 →" />
              </>
            )}
          </div>

          {/* Bullets */}
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>본문 불릿 (가로·세로 공유)</SectionLabel>
            <div style={{ fontSize: 10, color: "rgba(247,243,236,0.25)", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
              {bullets.length}개 · 개수에 따라 폰트 자동 조정
            </div>
            <BulletEditor bullets={bullets} onChange={setBullets} />
          </div>

        </div>
      </div>

      {/* ── Preview ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ height: 46, borderBottom: "1px solid rgba(247,243,236,0.07)", display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: uiAccent }} />
            <span style={{ fontSize: 11, color: "rgba(247,243,236,0.42)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
              {format === "landscape" ? "1920 × 1080" : "1080 × 1920"}&nbsp;&nbsp;·&nbsp;&nbsp;{CATEGORIES[catMode].name}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {catMode === "work" && (
            <button onClick={() => setCompareMode(p => !p)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: compareMode ? "rgba(72,120,204,0.18)" : "transparent",
              border: `1px solid ${compareMode ? DS_BLUE : "rgba(247,243,236,0.12)"}`,
              borderRadius: 6, padding: "5px 12px", cursor: "pointer",
              color: compareMode ? "#A8C4FF" : "rgba(247,243,236,0.35)",
              fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}>
              <Palette size={12} /> 강조색 비교
            </button>
          )}
          {!compareMode && <span style={{ fontSize: 10, color: "rgba(247,243,236,0.2)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginLeft: 16 }}>PREVIEW</span>}
        </div>

        {/* Compare strip */}
        {compareMode && catMode === "work" && (
          <div style={{
            borderBottom: "1px solid rgba(247,243,236,0.07)",
            background: "#0D0C0A",
            padding: "16px 20px",
            display: "flex", gap: 14, overflowX: "auto", flexShrink: 0,
          }}>
            {WORK_ACCENTS.map(({ label, color }) => {
              const active = workAccent === color;
              const MINI_SCALE = 0.26;
              const W = CANVAS_LANDSCAPE.w;
              const H = CANVAS_LANDSCAPE.h;
              return (
                <button key={color} onClick={() => setWorkAccent(color)} style={{
                  flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                }}>
                  <div style={{
                    width: W * MINI_SCALE, height: H * MINI_SCALE,
                    overflow: "hidden", position: "relative", borderRadius: 4,
                    outline: active ? `2px solid ${color}` : "2px solid transparent",
                    outlineOffset: 2, transition: "outline 0.15s",
                  }}>
                    <div style={{ width: W, height: H, position: "absolute", top: 0, left: 0, transform: `scale(${MINI_SCALE})`, transformOrigin: "top left", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <LandscapeCanvas shared={shared} fmtVars={lVars} bullets={bullets} showHighlight={showHighlight} showQR={showQR} catMode="work" accentOverride={color} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: active ? "#F7F3EC" : "rgba(247,243,236,0.38)", letterSpacing: "0.04em" }}>
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 40, overflow: "auto",
          backgroundImage: "radial-gradient(circle, rgba(247,243,236,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}>
          {format === "landscape"
            ? <LandscapeCanvas shared={shared} fmtVars={lVars} bullets={bullets} showHighlight={showHighlight} showQR={showQR} catMode={catMode} accentOverride={activeAccent} />
            : <PortraitCanvas  shared={shared} fmtVars={pVars} bullets={bullets} showHighlight={showHighlight} showQR={showQR} catMode={catMode} />
          }
        </div>

      </div>
    </div>
  );
}
