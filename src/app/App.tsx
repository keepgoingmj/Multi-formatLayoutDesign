import { useState } from "react";
import { Plus, X, Monitor, Smartphone, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import gsLogo from "@/imports/GS_logo_1.png";

// ─── Types ───────────────────────────────────────────────────────────────────

type Format = "landscape" | "portrait";
type CategoryMode = "work" | "life" | "etc";

interface BulletItem {
  id: string;
  text: string;
  subText: string;
  showSub: boolean;
}

interface SharedVars {
  categoryLabel: string;
  highlightText: string;
  qrUrl: string;
  qrLabel: string;
}

interface FormatVars {
  title: string;
  description: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_LANDSCAPE = { w: 1200, h: 675, scale: 0.68 };
const CANVAS_PORTRAIT  = { w: 675,  h: 1200, scale: 0.52 };

const GS_BLUE = "#0068B7";

// 리뉴얼 디자인 시스템 3색 (참조용)
const DS_BLUE  = "#4878CC"; // 1 — Sustainability
const DS_GREEN = "#43A876"; // 2 — Investors
const DS_CORAL = "#E5623A"; // 3 — Career

// 카테고리 정의
const CATEGORIES: Record<CategoryMode, { name: string }> = {
  work: { name: "업무공유" },
  life: { name: "생활안내" },
  etc:  { name: "기타"    },
};

// 테마 토큰 — 각 카테고리별 배경·텍스트·강조색
const CANVAS_THEME = {
  // 업무공유: 흰 배경, GS Blue 강조
  work: {
    bg:         "#FFFFFF",
    bgSolid:    "#FFFFFF",
    title:      "#0D1F3C",
    body:       "rgba(13,31,60,0.58)",
    accent:     GS_BLUE,
    bullet:     GS_BLUE,
    highlight:  GS_BLUE,
    divider:    `${GS_BLUE}22`,
    logoFilter: "none",
  },
  // 생활안내: GS Blue 다크, 밝은 하늘색 강조
  life: {
    bg:         "linear-gradient(155deg, #002D6B 0%, #001540 55%, #002060 100%)",
    bgSolid:    "#001540",
    title:      "#FFFFFF",
    body:       "rgba(255,255,255,0.68)",
    accent:     "#59C2FF",
    bullet:     "#59C2FF",
    highlight:  "#59C2FF",
    divider:    "rgba(255,255,255,0.12)",
    logoFilter: "brightness(0) invert(1)",
  },
  // 기타: Energy Amber 다크, 황금색 강조
  etc: {
    bg:         "linear-gradient(155deg, #1E1200 0%, #120C00 55%, #1A1000 100%)",
    bgSolid:    "#120C00",
    title:      "#FFFFFF",
    body:       "rgba(255,255,255,0.68)",
    accent:     "#F09000",
    bullet:     "#F09000",
    highlight:  "#F09000",
    divider:    "rgba(240,144,0,0.22)",
    logoFilter: "brightness(0) invert(1)",
  },
} as const;

// 초기값
const INIT_SHARED: SharedVars = {
  categoryLabel: "GS OFFICE LIFE",
  highlightText: "월요일: 1,6 / 화요일: 2,7 / 수요일: 3,8 / 목요일: 4,9 / 금요일: 5,0",
  qrUrl:         "",
  qrLabel:       "",
};

const INIT_L_VARS: FormatVars = {
  title:       "자율적 차량5부제 실시",
  description: "에너지 절감 기조에 발맞춰, GS그룹도 자율적으로 '차량 5부제'에 함께 하고자 합니다.",
};

const INIT_P_VARS: FormatVars = {
  title:       "자율적\n차량5부제\n실시",
  description: "에너지 절감 기조에 발맞춰\nGS그룹도 자율적으로 함께 합니다.",
};

const INIT_LANDSCAPE_BULLETS: BulletItem[] = [
  { id: "l1", text: "대상: 친환경차를 제외한 승용차/업무용 및 임산부/장애 동승 제외", subText: "", showSub: false },
  { id: "l2", text: "기간: ~ 정해지면 공표시행까지", subText: "", showSub: false },
  { id: "l3", text: "방식: 차량 번호 끝자리에 따라 해당 요일의 차량 운행 및 시내 주차 자제", subText: "대중교통 이용 적극 권장", showSub: true },
];


// ─── Bullet auto-sizing ───────────────────────────────────────────────────────

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
      flexShrink: 0, position: "relative", overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)",
    }}>
      <div style={{
        width: w, height: h,
        transformOrigin: "top left",
        transform: `scale(${scale})`,
        position: "absolute", top: 0, left: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Landscape Canvas ─────────────────────────────────────────────────────────

function LandscapeCanvas({ shared, fmtVars, bullets, showHighlight, showQR, catMode }: {
  shared: SharedVars; fmtVars: FormatVars; bullets: BulletItem[];
  showHighlight: boolean; showQR: boolean; catMode: CategoryMode;
}) {
  const { w, h } = CANVAS_LANDSCAPE;
  const t = CANVAS_THEME[catMode];
  const bFontSize = bulletFontSize(bullets.length, 18);

  return (
    <CanvasWrapper w={w} h={h} scale={CANVAS_LANDSCAPE.scale}>
      <div style={{ width: w, height: h, background: t.bg, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Brand label */}
        <div style={{ padding: "28px 72px 0", flexShrink: 0, textAlign: "center" }}>
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

          {/* Title — 중앙정렬 */}
          <div style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 78, fontWeight: 900, lineHeight: 1.18,
            color: t.title, marginBottom: 18,
            whiteSpace: "pre-line", letterSpacing: "-0.025em",
            textAlign: "center",
          }}>
            {fmtVars.title}
          </div>

          {/* Accent line — 중앙 */}
          <div style={{ width: 48, height: 3, background: t.accent, margin: "0 auto 12px", borderRadius: 2 }} />

          {/* Description — 중앙정렬, 강조색 통일 */}
          <div style={{
            fontSize: 20, lineHeight: 1.7, color: t.accent,
            marginBottom: 52, fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "center", whiteSpace: "pre-line",
          }}>
            {fmtVars.description}
          </div>

          {/* Bullets + QR 나란히 */}
          <div style={{ display: "flex", gap: 40, flex: 1, alignItems: "flex-start" }}>
            {/* Bullets 열 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              {bullets.map((b) => (
                <div key={b.id}>
                  <div style={{
                    fontSize: bFontSize, lineHeight: 1.6,
                    color: t.title, fontFamily: "'Noto Sans KR', sans-serif",
                  }}>
                    {b.text}
                  </div>
                  {b.showSub && b.subText && (
                    <div style={{
                      fontSize: bFontSize - 4, color: t.body, marginTop: 3,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      ({b.subText})
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* QR 코드 블록 — 본문 오른쪽 */}
            {showQR && shared.qrUrl && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>
                  <QRCodeSVG value={shared.qrUrl} size={148} />
                </div>
                {shared.qrLabel && (
                  <div style={{
                    fontSize: 13, color: t.body, textAlign: "center",
                    fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.35, maxWidth: 168,
                    wordBreak: "keep-all",
                  }}>
                    {shared.qrLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 고정 영역: 강조텍스트 → 구분선 → 로고 */}
        <div style={{ flexShrink: 0 }}>
          {showHighlight && shared.highlightText && (
            <div style={{ padding: "20px 80px 0" }}>
              <div style={{
                fontSize: 24, fontWeight: 700, color: t.highlight,
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.4, letterSpacing: "-0.01em",
                textAlign: "center",
              }}>
                {shared.highlightText}
              </div>
            </div>
          )}
          {/* 로고 — 중앙 */}
          <div style={{ padding: "20px 0 28px", display: "flex", justifyContent: "center" }}>
            <img
              src={gsLogo} alt="GS Grow Sustainably"
              style={{ height: 68, width: "auto", filter: t.logoFilter }}
            />
          </div>
        </div>
      </div>
    </CanvasWrapper>
  );
}

// ─── Portrait Canvas ──────────────────────────────────────────────────────────

function PortraitCanvas({ shared, fmtVars, bullets, showHighlight, showQR, catMode }: {
  shared: SharedVars; fmtVars: FormatVars; bullets: BulletItem[];
  showHighlight: boolean; showQR: boolean; catMode: CategoryMode;
}) {
  const { w, h } = CANVAS_PORTRAIT;
  const t = CANVAS_THEME[catMode];
  const bFontSize = bulletFontSize(bullets.length, 20);

  return (
    <CanvasWrapper w={w} h={h} scale={CANVAS_PORTRAIT.scale}>
      <div style={{ width: w, height: h, background: t.bg, display: "flex", flexDirection: "column" }}>

        {/* Brand label — 좌측정렬 */}
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

          {/* Title — 좌측정렬, 대형 */}
          <div style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 90, fontWeight: 900, lineHeight: 1.18,
            color: t.title, marginBottom: 20,
            whiteSpace: "pre-line", letterSpacing: "-0.03em",
            textAlign: "left", wordBreak: "keep-all",
            overflowWrap: "anywhere",
          }}>
            {fmtVars.title}
          </div>

          {/* Description — 좌측정렬, 강조색 통일 */}
          <div style={{
            fontSize: 24, lineHeight: 1.65, color: t.accent,
            marginBottom: 60, fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "left", whiteSpace: "pre-line",
            wordBreak: "keep-all", overflowWrap: "anywhere",
          }}>
            {fmtVars.description}
          </div>

          {/* Bullets — 24글자/줄 기준 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            {bullets.map((b) => (
              <div key={b.id} style={{
                fontSize: bFontSize, lineHeight: 1.6,
                color: t.title, fontFamily: "'Noto Sans KR', sans-serif",
                wordBreak: "keep-all", overflowWrap: "anywhere",
              }}>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 고정 영역: QR → 강조텍스트 → 로고 */}
        <div style={{ flexShrink: 0 }}>
          {/* QR 코드 — 중앙, 강조텍스트 위 */}
          {showQR && shared.qrUrl && (
            <div style={{ padding: "20px 110px 0 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>
                <QRCodeSVG value={shared.qrUrl} size={130} />
              </div>
              {shared.qrLabel && (
                <div style={{
                  fontSize: 16, color: t.body, textAlign: "center",
                  fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.4,
                }}>
                  {shared.qrLabel}
                </div>
              )}
            </div>
          )}
          {showHighlight && shared.highlightText && (
            <div style={{ padding: "20px 110px 0 56px" }}>
              <div style={{
                fontSize: 22, fontWeight: 700, color: t.highlight,
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.5, textAlign: "left",
                wordBreak: "keep-all",
              }}>
                {shared.highlightText}
              </div>
            </div>
          )}
          {/* 로고 — 중앙 */}
          <div style={{ padding: "24px 0 32px", display: "flex", justifyContent: "center" }}>
            <img
              src={gsLogo} alt="GS Grow Sustainably"
              style={{ height: 72, width: "auto", filter: t.logoFilter }}
            />
          </div>
        </div>
      </div>
    </CanvasWrapper>
  );
}

// ─── Sidebar primitives ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "rgba(247,243,236,0.3)",
      fontFamily: "'DM Mono', monospace", marginBottom: 8,
    }}>
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
      <div style={{ fontSize: 10, color: "rgba(247,243,236,0.38)", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>
        {label}
      </div>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={base} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function Toggle({ on, onToggle, color = GS_BLUE }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} style={{
      width: 36, height: 20, borderRadius: 10, border: "none",
      background: on ? color : "rgba(247,243,236,0.12)",
      cursor: "pointer", position: "relative", transition: "background 0.15s",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.15s",
      }} />
    </button>
  );
}

// ─── Bullet Editor ────────────────────────────────────────────────────────────

function BulletEditor({ bullets, onChange, portrait }: {
  bullets: BulletItem[]; onChange: (b: BulletItem[]) => void; portrait?: boolean;
}) {
  const update = (id: string, key: keyof BulletItem, val: string | boolean) =>
    onChange(bullets.map(b => b.id === id ? { ...b, [key]: val } : b));
  const remove = (id: string) => onChange(bullets.filter(b => b.id !== id));
  const add = () => onChange([...bullets, { id: `${Date.now()}`, text: "", subText: "", showSub: false }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {bullets.map((b, i) => (
        <div key={b.id} style={{
          background: "rgba(247,243,236,0.04)",
          border: "1px solid rgba(247,243,236,0.07)",
          borderRadius: 7, padding: "10px 11px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(247,243,236,0.25)", marginTop: 1, flexShrink: 0, fontFamily: "'DM Mono', monospace", minWidth: 16 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <input type="text" value={b.text} onChange={e => update(b.id, "text", e.target.value)}
              placeholder="불릿 내용"
              style={{ flex: 1, background: "transparent", border: "none", color: "#F7F3EC", fontSize: 12, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <button onClick={() => remove(b.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(247,243,236,0.22)", padding: 2, flexShrink: 0, lineHeight: 1 }}>
              <X size={11} />
            </button>
          </div>
          {!portrait && (
            <div style={{ paddingLeft: 24, marginTop: 7 }}>
              <button onClick={() => update(b.id, "showSub", !b.showSub)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: b.showSub ? "rgba(247,243,236,0.55)" : "rgba(247,243,236,0.2)", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", padding: 0, marginBottom: b.showSub ? 6 : 0 }}>
                {b.showSub ? "▾ 보조 설명" : "▸ 보조 설명"}
              </button>
              {b.showSub && (
                <input type="text" value={b.subText} onChange={e => update(b.id, "subText", e.target.value)}
                  placeholder="출처 또는 보조 설명"
                  style={{ display: "block", width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(247,243,236,0.1)", color: "rgba(247,243,236,0.45)", fontSize: 11, outline: "none", padding: "2px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={add} style={{
        background: "transparent", border: "1px dashed rgba(247,243,236,0.14)",
        borderRadius: 7, padding: "8px 0", color: "rgba(247,243,236,0.3)", cursor: "pointer",
        fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
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
  const [lBullets, setLBullets]           = useState<BulletItem[]>(INIT_LANDSCAPE_BULLETS);
  const fmtVars    = format === "landscape" ? lVars : pVars;
  const setFmtVars = format === "landscape" ? setLVars : setPVars;
  const setField   = (key: keyof SharedVars, val: string) => setShared(p => ({ ...p, [key]: val }));

  // 카테고리 테마별 강조색 (사이드바 UI용)
  const uiAccent = catMode === "etc" ? "#F09000" : catMode === "life" ? "#59C2FF" : GS_BLUE;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0D0C0A", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden", color: "#F7F3EC" }}>

      {/* ─── Left Sidebar ─── */}
      <div style={{ width: 304, height: "100vh", background: "#111009", borderRight: "1px solid rgba(247,243,236,0.07)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 15px", borderBottom: "1px solid rgba(247,243,236,0.07)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#F7F3EC", letterSpacing: "0.03em" }}>컨텐츠 편집기</div>
          <div style={{ fontSize: 10, color: "rgba(247,243,236,0.28)", marginTop: 3, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>가로 · 세로 동시 편집</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>

          {/* Format toggle */}
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
                const themeAccent = CANVAS_THEME[k].accent;
                const isActive = catMode === k;
                return (
                  <button key={k} onClick={() => setCatMode(k)} style={{
                    padding: "9px 12px", borderRadius: 6, cursor: "pointer",
                    border: isActive ? `1.5px solid ${themeAccent}` : "1px solid rgba(247,243,236,0.08)",
                    background: isActive ? `${themeAccent}18` : "transparent",
                    color: isActive ? "#fff" : "rgba(247,243,236,0.4)",
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: themeAccent }} />
                      {v.name}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: isActive ? "rgba(255,255,255,0.4)" : "rgba(247,243,236,0.2)" }}>
                      {k === "work" ? "밝음" : "어두움"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shared variables */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <SectionLabel>공유 변수</SectionLabel>
            <Field label="브랜드 라벨 (상단)" value={shared.categoryLabel} onChange={v => setField("categoryLabel", v)} placeholder="GS OFFICE LIFE" />
          </div>

          {/* Format-specific: title + description */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <SectionLabel>{format === "landscape" ? "가로형 텍스트" : "세로형 텍스트"}</SectionLabel>
            </div>
            <Field label="제목 (줄바꿈 Enter)" value={fmtVars.title} onChange={v => setFmtVars(p => ({ ...p, title: v }))} placeholder="제목 입력" multiline />
            <Field label="설명 문장 (줄바꿈 Enter)" value={fmtVars.description} onChange={v => setFmtVars(p => ({ ...p, description: v }))} placeholder="설명 입력" multiline />
          </div>

          {/* Highlight */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>강조 텍스트</SectionLabel>
              <Toggle on={showHighlight} onToggle={() => setShowHighlight(p => !p)} color={uiAccent} />
            </div>
            <Field label="강조 텍스트 (로고 위)" value={shared.highlightText} onChange={v => setField("highlightText", v)} placeholder="강조 내용 입력" multiline />
          </div>

          {/* QR Code */}
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
              개수에 따라 폰트 자동 조정 · 현재 {lBullets.length}개
            </div>
            <BulletEditor bullets={lBullets} onChange={setLBullets} />
          </div>
        </div>
      </div>

      {/* ─── Preview area ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ height: 46, borderBottom: "1px solid rgba(247,243,236,0.07)", display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: uiAccent }} />
            <span style={{ fontSize: 11, color: "rgba(247,243,236,0.42)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
              {format === "landscape" ? "1920 × 1080" : "1080 × 1920"}&nbsp;&nbsp;·&nbsp;&nbsp;{CATEGORIES[catMode].name}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "rgba(247,243,236,0.2)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
            PREVIEW
          </span>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 40, overflow: "auto",
          backgroundImage: "radial-gradient(circle, rgba(247,243,236,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}>
          {format === "landscape"
            ? <LandscapeCanvas shared={shared} fmtVars={lVars} bullets={lBullets} showHighlight={showHighlight} showQR={showQR} catMode={catMode} />
            : <PortraitCanvas  shared={shared} fmtVars={pVars} bullets={lBullets} showHighlight={showHighlight} showQR={showQR} catMode={catMode} />
          }
        </div>
      </div>
    </div>
  );
}
