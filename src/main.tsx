import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import RenderView from "./app/RenderView.tsx";
import "./styles/index.css";

const params = new URLSearchParams(window.location.search);
const Root = params.has("render") ? RenderView : App;

createRoot(document.getElementById("root")!).render(<Root />);
