import { LandscapeCanvas, PortraitCanvas } from "./App";
import type { SharedVars, FormatVars, BulletItem, CategoryMode } from "./App";

interface RenderPayload {
  catMode: CategoryMode;
  shared: SharedVars;
  lVars: FormatVars;
  pVars: FormatVars;
  bullets: BulletItem[];
  showHighlight: boolean;
  showQR: boolean;
}

function decodePayload(): RenderPayload | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("data");
  if (!raw) return null;
  try {
    const json = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(json) as RenderPayload;
  } catch {
    return null;
  }
}

export default function RenderView() {
  const payload = decodePayload();
  const params = new URLSearchParams(window.location.search);
  const format = params.get("format") || "landscape";

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", color: "#900" }}>
        ?render&format=landscape|portrait&data=(base64 JSON) 형식으로 전달해주세요.
      </div>
    );
  }

  const { catMode, shared, lVars, pVars, bullets, showHighlight, showQR } = payload;

  if (format === "portrait") {
    return (
      <div style={{ width: 1080, height: 1920, overflow: "hidden" }}>
        <PortraitCanvas
          shared={shared} fmtVars={pVars} bullets={bullets}
          showHighlight={showHighlight} showQR={showQR} catMode={catMode} scale={1}
        />
      </div>
    );
  }

  return (
    <div style={{ width: 1920, height: 1080, overflow: "hidden" }}>
      <LandscapeCanvas
        shared={shared} fmtVars={lVars} bullets={bullets}
        showHighlight={showHighlight} showQR={showQR} catMode={catMode} scale={1}
      />
    </div>
  );
}
