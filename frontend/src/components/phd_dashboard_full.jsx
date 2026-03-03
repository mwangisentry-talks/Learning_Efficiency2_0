import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PolarRadiusAxis
} from "recharts";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api/v1";

const PILLAR_CHOICES = [
  { value: "AI_FORENSICS", label: "AI Forensics" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "LEGAL_FRAMEWORK", label: "Legal & Forensic Framework" },
  { value: "ML_ADVERSARIAL", label: "Adversarial Machine Learning" },
  { value: "ATTRIBUTION", label: "AI Attack Attribution" },
  { value: "TOOLS_METHODS", label: "Tools & Methodology" },
];

const SESSION_TYPES = [
  { value: "PAPER", label: "Reading a Paper", icon: "📄" },
  { value: "CODING", label: "Coding / Lab Work", icon: "💻" },
  { value: "WRITING", label: "Writing / Documentation", icon: "✍️" },
  { value: "SEMINAR", label: "Seminar / Lecture", icon: "🎓" },
  { value: "REVIEW", label: "Review / Revision", icon: "🔁" },
  { value: "EXPERIMENT", label: "Experiment / Research", icon: "🧪" },
];

const OUTPUT_TYPES = [
  { value: "NOTES", label: "Notes", icon: "📝" },
  { value: "DRAFT", label: "Draft Paragraph", icon: "📃" },
  { value: "CODE", label: "Code / Script", icon: "⌨️" },
  { value: "HYPOTHESIS", label: "Hypothesis", icon: "💡" },
  { value: "DIAGRAM", label: "Diagram / Model", icon: "🗺️" },
  { value: "NONE", label: "No Output", icon: "—" },
];

const STATUS_CHOICES = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const RATING_COLOR = {
  Excellent: "#00ffa3",
  Good: "#4af0ff",
  Average: "#ffd166",
  "Needs Work": "#ff6b6b",
  "N/A": "#555",
};

const TYPE_ICON = { PAPER: "📄", CODING: "💻", WRITING: "✍️", SEMINAR: "🎓", REVIEW: "🔁", EXPERIMENT: "🧪" };
const OUTPUT_ICON = { NOTES: "📝", DRAFT: "📃", CODE: "⌨️", HYPOTHESIS: "💡", DIAGRAM: "🗺️", NONE: "—" };

// ─── API LAYER ────────────────────────────────────────────────────────────────
const api = {
  get: async (path) => {
    const r = await fetch(`${API_BASE}${path}`);
    if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
    return r.json();
  },
  post: async (path, body) => {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(JSON.stringify(err));
    }
    return r.json();
  },
  patch: async (path, body) => {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`PATCH ${path} failed: ${r.status}`);
    return r.json();
  },
  delete: async (path) => {
    const r = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    if (!r.ok) throw new Error(`DELETE ${path} failed: ${r.status}`);
  },
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #050a10;
    --bg2: #090f18;
    --bg3: #0d1520;
    --border: #1a2a3a;
    --border2: #2a4060;
    --text: #c8d8e8;
    --text2: #8abadc;
    --text3: #4a6a8a;
    --green: #00ffa3;
    --cyan: #4af0ff;
    --yellow: #ffd166;
    --red: #ff6b6b;
    --mono: 'Share Tech Mono', monospace;
    --sans: 'Rajdhani', sans-serif;
  }
  body { background: var(--bg); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .scan {
    position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden;
  }
  .scan::after {
    content:'';position:absolute;left:0;right:0;height:2px;
    background:linear-gradient(transparent,rgba(0,255,163,0.04),transparent);
    animation:scanline 8s linear infinite;
  }
  .grid-bg {
    background-image:
      linear-gradient(rgba(0,255,163,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,163,0.02) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .card {
    background:var(--bg3);border:1px solid var(--border);border-radius:2px;
    transition:border-color 0.2s,box-shadow 0.2s;
  }
  .card:hover { border-color:var(--border2); }
  .card-glow:hover { box-shadow:0 0 20px rgba(74,240,255,0.05); }
  .tab-btn {
    background:none;border:none;cursor:pointer;
    padding:12px 22px;font-family:var(--mono);font-size:10px;
    letter-spacing:3px;transition:all 0.2s;border-bottom:1px solid transparent;
  }
  .tab-active { color:var(--green);border-bottom-color:var(--green); }
  .tab-inactive { color:var(--text3); }
  .tab-inactive:hover { color:var(--text2); }
  .btn {
    font-family:var(--mono);font-size:10px;letter-spacing:2px;
    padding:10px 20px;border-radius:2px;cursor:pointer;
    transition:all 0.2s;border:1px solid;
  }
  .btn-primary {
    background:rgba(0,255,163,0.1);border-color:var(--green);color:var(--green);
  }
  .btn-primary:hover { background:rgba(0,255,163,0.2);box-shadow:0 0 12px rgba(0,255,163,0.2); }
  .btn-primary:disabled { opacity:0.4;cursor:not-allowed; }
  .btn-danger {
    background:rgba(255,107,107,0.1);border-color:var(--red);color:var(--red);
  }
  .btn-danger:hover { background:rgba(255,107,107,0.2); }
  .btn-ghost {
    background:none;border-color:var(--border2);color:var(--text2);
  }
  .btn-ghost:hover { border-color:var(--cyan);color:var(--cyan); }
  .input {
    background:var(--bg2);border:1px solid var(--border);border-radius:2px;
    color:var(--text);font-family:var(--mono);font-size:11px;
    padding:10px 12px;width:100%;outline:none;
    transition:border-color 0.2s;
  }
  .input:focus { border-color:var(--cyan);box-shadow:0 0 8px rgba(74,240,255,0.1); }
  .input::placeholder { color:var(--text3); }
  .select {
    background:var(--bg2);border:1px solid var(--border);border-radius:2px;
    color:var(--text);font-family:var(--mono);font-size:11px;
    padding:10px 12px;width:100%;outline:none;cursor:pointer;
    transition:border-color 0.2s;appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a6a8a'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 12px center;
    padding-right:32px;
  }
  .select:focus { border-color:var(--cyan); }
  .label { font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:3px;margin-bottom:6px;display:block; }
  .session-row {
    background:var(--bg3);border:1px solid var(--border);border-radius:2px;
    padding:16px 20px;cursor:pointer;transition:all 0.2s;margin-bottom:8px;
  }
  .session-row:hover { border-color:var(--border2);background:#111d2e; }
  .badge {
    display:inline-block;padding:2px 8px;border-radius:2px;
    font-family:var(--mono);font-size:9px;letter-spacing:2px;
  }
  .modal-overlay {
    position:fixed;inset:0;background:rgba(5,10,16,0.85);z-index:200;
    display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(4px);animation:fadeUp 0.2s ease;
  }
  .modal {
    background:var(--bg3);border:1px solid var(--border2);border-radius:2px;
    width:min(640px,90vw);max-height:85vh;overflow-y:auto;
    animation:fadeUp 0.3s ease;box-shadow:0 0 40px rgba(74,240,255,0.1);
  }
  .modal::-webkit-scrollbar { width:4px; }
  .modal::-webkit-scrollbar-track { background:var(--bg2); }
  .modal::-webkit-scrollbar-thumb { background:var(--border2);border-radius:2px; }
  .spinner {
    width:16px;height:16px;border:2px solid var(--border);
    border-top-color:var(--green);border-radius:50%;
    animation:spin 0.8s linear infinite;display:inline-block;
  }
  .toast {
    position:fixed;bottom:32px;right:32px;z-index:300;
    background:var(--bg3);border:1px solid var(--green);
    padding:12px 20px;border-radius:2px;font-family:var(--mono);
    font-size:10px;color:var(--green);letter-spacing:2px;
    animation:slideIn 0.3s ease;box-shadow:0 0 20px rgba(0,255,163,0.2);
  }
  .toast-error { border-color:var(--red);color:var(--red);box-shadow:0 0 20px rgba(255,107,107,0.2); }
  .gap-row {
    display:flex;align-items:flex-start;gap:12px;
    padding:10px 0;border-bottom:1px solid #0f1e2e;
  }
  .dot { width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--bg2); }
  ::-webkit-scrollbar-thumb { background:var(--border2);border-radius:2px; }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type === "error" ? "toast-error" : ""}`}>{msg}</div>;
}

// ─── LOADER ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "40px", justifyContent: "center" }}>
      <div className="spinner" />
      <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", letterSpacing: "3px" }}>LOADING...</span>
    </div>
  );
}

// ─── NEW SESSION MODAL ────────────────────────────────────────────────────────
function NewSessionModal({ pillars, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", pillar: "", session_type: "PAPER",
    time_spent: "", concept_links: "", knowledge_gaps: "",
    research_questions: "", output_type: "NONE", output_notes: "",
    recurring_gap: false, gap_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const { time_spent: ts, concept_links: cl, knowledge_gaps: kg, research_questions: rq } = form;
    if (ts && cl && kg && rq && +kg > 0 && +rq > 0) {
      const eff = (+ts * +cl) / (+kg * +rq);
      const max = +ts * +cl;
      setPreview({ eff: eff.toFixed(2), max: max.toFixed(2), pct: ((eff / max) * 100).toFixed(1) });
    } else setPreview(null);
  }, [form.time_spent, form.concept_links, form.knowledge_gaps, form.research_questions]);

  const submit = async () => {
    if (!form.title || !form.time_spent || !form.concept_links || !form.knowledge_gaps || !form.research_questions) {
      setError("FILL ALL REQUIRED FIELDS"); return;
    }
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        pillar: form.pillar || null,
        time_spent: +form.time_spent,
        concept_links: +form.concept_links,
        knowledge_gaps: +form.knowledge_gaps,
        research_questions: +form.research_questions,
      };
      const record = await api.post("/records/", payload);
      onSave(record);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "4px" }}>NEW RECORD</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "18px", color: "var(--text)", fontWeight: 600 }}>Log Learning Session</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "6px 12px" }}>✕</button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Live preview */}
          {preview && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--green)", borderRadius: "2px", padding: "12px 16px", marginBottom: "20px", display: "flex", gap: "24px" }}>
              <div>
                <div className="label">EFFICIENCY SCORE</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "22px", color: "var(--green)", fontWeight: "bold" }}>{preview.eff}</div>
              </div>
              <div>
                <div className="label">MAX POSSIBLE</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "22px", color: "var(--cyan)" }}>{preview.max}</div>
              </div>
              <div>
                <div className="label">% OF MAX</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "22px", color: "var(--yellow)" }}>{preview.pct}%</div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: "16px" }}>
            {/* Title */}
            <div>
              <label className="label">SESSION TITLE *</label>
              <input className="input" placeholder="e.g. LLM Fingerprinting Methods" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>

            {/* Pillar + Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="label">RESEARCH PILLAR</label>
                <select className="select" value={form.pillar} onChange={e => set("pillar", e.target.value)}>
                  <option value="">— Select Pillar —</option>
                  {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">SESSION TYPE *</label>
                <select className="select" value={form.session_type} onChange={e => set("session_type", e.target.value)}>
                  {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "2px", padding: "16px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "12px" }}>EFFICIENCY VARIABLES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                {[
                  { key: "time_spent", label: "TIME SPENT (h)", color: "var(--green)", placeholder: "e.g. 2.5" },
                  { key: "concept_links", label: "CONCEPT LINKS", color: "var(--cyan)", placeholder: "e.g. 5" },
                  { key: "knowledge_gaps", label: "KNOWLEDGE GAPS", color: "var(--red)", placeholder: "e.g. 3" },
                  { key: "research_questions", label: "RESEARCH Qs", color: "var(--yellow)", placeholder: "e.g. 2" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label" style={{ color: f.color }}>{f.label} *</label>
                    <input className="input" type="number" min="0" step="0.5"
                      placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Output */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
              <div>
                <label className="label">OUTPUT TYPE</label>
                <select className="select" value={form.output_type} onChange={e => set("output_type", e.target.value)}>
                  {OUTPUT_TYPES.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">OUTPUT NOTES</label>
                <input className="input" placeholder="Brief description of what was produced..." value={form.output_notes} onChange={e => set("output_notes", e.target.value)} />
              </div>
            </div>

            {/* Recurring gap */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "2px" }}>
              <input type="checkbox" id="rec" checked={form.recurring_gap} onChange={e => set("recurring_gap", e.target.checked)}
                style={{ marginTop: "2px", accentColor: "var(--red)", cursor: "pointer" }} />
              <div style={{ flex: 1 }}>
                <label htmlFor="rec" style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text2)", letterSpacing: "2px", cursor: "pointer" }}>
                  RECURRING KNOWLEDGE GAP
                </label>
                {form.recurring_gap && (
                  <textarea className="input" rows={2} placeholder="Describe the recurring gap..."
                    value={form.gap_description} onChange={e => set("gap_description", e.target.value)}
                    style={{ marginTop: "8px", resize: "vertical" }} />
                )}
              </div>
            </div>

            {error && (
              <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--red)", padding: "10px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "2px", letterSpacing: "1px" }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px" }}>
              <button className="btn btn-ghost" onClick={onClose}>CANCEL</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? <span className="spinner" /> : "LOG SESSION"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEW GAP MODAL ─────────────────────────────────────────────────────────────
function NewGapModal({ pillars, sessions, onClose, onSave }) {
  const [form, setForm] = useState({ gap: "", pillar: "", sessions: [], status: "OPEN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.gap) { setError("GAP DESCRIPTION REQUIRED"); return; }
    setLoading(true);
    try {
      const record = await api.post("/gaps/", { ...form, pillar: form.pillar || null });
      onSave(record);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: "min(480px,90vw)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: "18px", color: "var(--text)", fontWeight: 600 }}>Track Knowledge Gap</div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "6px 12px" }}>✕</button>
        </div>
        <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
          <div>
            <label className="label">GAP DESCRIPTION *</label>
            <textarea className="input" rows={3} placeholder="What don't you understand yet?" value={form.gap} onChange={e => set("gap", e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="label">PILLAR</label>
              <select className="select" value={form.pillar} onChange={e => set("pillar", e.target.value)}>
                <option value="">— Select —</option>
                {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">STATUS</label>
              <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUS_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          {error && <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--red)", padding: "10px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "2px" }}>⚠ {error}</div>}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>CANCEL</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <span className="spinner" /> : "TRACK GAP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESOLVE GAP MODAL ────────────────────────────────────────────────────────
function ResolveModal({ gap, onClose, onResolved }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post(`/gaps/${gap.id}/resolve/`, { resolution_notes: notes });
      onResolved(gap.id);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: "min(440px,90vw)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--green)", letterSpacing: "3px", marginBottom: "4px" }}>RESOLVE GAP</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: "16px", color: "var(--text)", fontWeight: 600 }}>{gap.gap}</div>
        </div>
        <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
          <div>
            <label className="label">RESOLUTION NOTES</label>
            <textarea className="input" rows={4} placeholder="How did you resolve this gap? What did you learn?" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>CANCEL</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <span className="spinner" /> : "MARK RESOLVED ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function PhDDashboard() {
  const [tab, setTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  // Data state
  const [dashboard, setDashboard] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [trend, setTrend] = useState([]);

  // UI state
  const [loading, setLoading] = useState({ dashboard: true, sessions: true, gaps: true, pillars: true });
  const [modal, setModal] = useState(null); // "session" | "gap" | {type:"resolve",gap}
  const [expandedSession, setExpandedSession] = useState(null);
  const [gapFilter, setGapFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState({ pillar: "", type: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
  };

  const setLoad = (k, v) => setLoading(l => ({ ...l, [k]: v }));

  // Fetchers
  const fetchDashboard = useCallback(async () => {
    try {
      const d = await api.get("/dashboard/summary/");
      setDashboard(d);
    } catch { showToast("Dashboard load failed", "error"); }
    finally { setLoad("dashboard", false); }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      let url = "/records/?";
      if (sessionFilter.pillar) url += `pillar=${sessionFilter.pillar}&`;
      if (sessionFilter.type) url += `session_type=${sessionFilter.type}`;
      const d = await api.get(url);
      setSessions(Array.isArray(d) ? d : d.results || []);
      // Build trend from sessions
      const sorted = [...(Array.isArray(d) ? d : d.results || [])].reverse().slice(-10);
      setTrend(sorted.map((s, i) => ({ session: `S${i + 1}`, efficiency: s.learning_efficiency || 0, title: s.title })));
    } catch { showToast("Sessions load failed", "error"); }
    finally { setLoad("sessions", false); }
  }, [sessionFilter]);

  const fetchGaps = useCallback(async () => {
    try {
      let url = "/gaps/";
      if (gapFilter !== "ALL") url += `?status=${gapFilter}`;
      const d = await api.get(url);
      setGaps(Array.isArray(d) ? d : d.results || []);
    } catch { showToast("Gaps load failed", "error"); }
    finally { setLoad("gaps", false); }
  }, [gapFilter]);

  const fetchPillars = useCallback(async () => {
    try {
      const d = await api.get("/pillars/");
      setPillars(Array.isArray(d) ? d : d.results || []);
    } catch { } finally { setLoad("pillars", false); }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    fetchSessions();
    fetchGaps();
    fetchPillars();
  }, []);

  useEffect(() => { fetchSessions(); }, [sessionFilter]);
  useEffect(() => { fetchGaps(); }, [gapFilter]);

  // Handlers
  const onSessionSaved = (record) => {
    setModal(null);
    setSessions(s => [record, ...s]);
    fetchDashboard();
    showToast("SESSION LOGGED SUCCESSFULLY");
  };

  const onGapSaved = (gap) => {
    setModal(null);
    setGaps(g => [gap, ...g]);
    fetchDashboard();
    showToast("GAP TRACKED SUCCESSFULLY");
  };

  const onGapResolved = (id) => {
    setModal(null);
    setGaps(g => g.map(gap => gap.id === id ? { ...gap, status: "RESOLVED" } : gap));
    fetchDashboard();
    showToast("GAP RESOLVED ✓");
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this session?")) return;
    try {
      await api.delete(`/records/${id}/`);
      setSessions(s => s.filter(x => x.id !== id));
      fetchDashboard();
      showToast("SESSION DELETED");
    } catch { showToast("Delete failed", "error"); }
  };

  // Radar data from pillars
  const radarData = pillars.map(p => ({
    subject: p.name?.replace("_", " ").split(" ").slice(0, 2).join(" ") || p.id,
    score: Math.min(100, (p.total_sessions || 0) * 15 + (p.average_efficiency || 0) * 2),
  }));

  const pillarBar = pillars.map(p => ({
    name: p.name?.replace(/_/g, " ") || p.id,
    sessions: p.total_sessions || 0,
  }));

  return (
    <>
      <style>{CSS}</style>
      <div className="scan" />

      <div className="grid-bg" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* ── HEADER ── */}
        <div style={{ borderBottom: "1px solid var(--border)", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(90deg, var(--bg) 0%, var(--bg2) 100%)", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--green)", letterSpacing: "4px", marginBottom: "4px" }}>
              PHD RESEARCH SYSTEM // AI & CYBER FORENSICS
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "24px", fontWeight: 700, color: "#e8f4ff", letterSpacing: "2px" }}>
              LEARNING INTELLIGENCE TRACKER
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>SYSTEM STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)" }}>ACTIVE</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setModal("session")}>+ LOG SESSION</button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 40px", background: "var(--bg)" }}>
          {["overview", "sessions", "gaps", "analytics"].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "32px 40px" }}>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {loading.dashboard ? <Loader /> : dashboard ? (
                <>
                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[
                      { label: "TOTAL SESSIONS", value: dashboard.total_sessions, color: "var(--cyan)" },
                      { label: "HOURS INVESTED", value: `${dashboard.total_hours}h`, color: "var(--green)" },
                      { label: "AVG EFFICIENCY", value: dashboard.average_efficiency, color: "var(--yellow)" },
                      { label: "PEAK EFFICIENCY", value: dashboard.highest_efficiency, color: "var(--red)" },
                    ].map((kpi, i) => (
                      <div key={i} className="card card-glow" style={{ padding: "22px 24px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "10px" }}>{kpi.label}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "30px", fontWeight: "bold", color: kpi.color }}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[
                      { label: "OPEN GAPS", value: dashboard.open_gaps, color: "var(--red)" },
                      { label: "RESOLVED GAPS", value: dashboard.resolved_gaps, color: "var(--green)" },
                      { label: "SESSIONS W/ OUTPUT", value: dashboard.sessions_with_output, color: "var(--cyan)" },
                    ].map((item, i) => (
                      <div key={i} className="card" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px" }}>{item.label}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "24px", fontWeight: "bold", color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div className="card" style={{ padding: "20px 24px" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>EFFICIENCY TREND</div>
                      {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={trend}>
                            <XAxis dataKey="session" stroke="var(--border)" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} />
                            <YAxis stroke="var(--border)" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} />
                            <Tooltip contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)", fontSize: "11px", fontFamily: "var(--mono)" }} />
                            <Line type="monotone" dataKey="efficiency" stroke="var(--green)" strokeWidth={2} dot={{ fill: "var(--green)", r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", padding: "40px", textAlign: "center" }}>NO DATA YET</div>}
                    </div>

                    <div className="card" style={{ padding: "20px 24px" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>KNOWLEDGE COVERAGE</div>
                      {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "var(--mono)" }} />
                            <PolarRadiusAxis tick={false} axisLine={false} />
                            <Radar dataKey="score" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.12} strokeWidth={1.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", padding: "40px", textAlign: "center" }}>NO PILLARS YET</div>}
                    </div>
                  </div>

                  {/* Pillar bar */}
                  {pillarBar.length > 0 && (
                    <div className="card" style={{ padding: "20px 24px" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>SESSIONS BY RESEARCH PILLAR</div>
                      <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={pillarBar} layout="vertical">
                          <XAxis type="number" stroke="var(--border)" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} />
                          <YAxis dataKey="name" type="category" width={150} tick={{ fill: "var(--text2)", fontSize: 10, fontFamily: "var(--mono)" }} stroke="var(--border)" />
                          <Tooltip contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)", fontSize: "11px", fontFamily: "var(--mono)" }} />
                          <Bar dataKey="sessions" fill="var(--cyan)" fillOpacity={0.7} radius={[0, 2, 2, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent sessions */}
                  {dashboard.recent_sessions?.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>RECENT SESSIONS</div>
                      {dashboard.recent_sessions.slice(0, 3).map(s => (
                        <div key={s.id} className="session-row">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                                {TYPE_ICON[s.session_type]} {s.title}
                              </div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>
                                {s.pillar_name} · {s.session_type} · {new Date(s.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: "var(--mono)", fontSize: "20px", fontWeight: "bold", color: RATING_COLOR[s.efficiency_rating] }}>
                                {s.learning_efficiency?.toFixed(2)}
                              </div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: RATING_COLOR[s.efficiency_rating], letterSpacing: "2px" }}>
                                {s.efficiency_rating?.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", padding: "40px", textAlign: "center" }}>CONNECT YOUR DJANGO API TO SEE DATA</div>}
            </div>
          )}

          {/* SESSIONS */}
          {tab === "sessions" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Filters + actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <select className="select" style={{ width: "160px" }} value={sessionFilter.pillar}
                    onChange={e => setSessionFilter(f => ({ ...f, pillar: e.target.value }))}>
                    <option value="">All Pillars</option>
                    {PILLAR_CHOICES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <select className="select" style={{ width: "140px" }} value={sessionFilter.type}
                    onChange={e => setSessionFilter(f => ({ ...f, type: e.target.value }))}>
                    <option value="">All Types</option>
                    {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.value}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>
                    {sessions.length} RECORDS
                  </span>
                  <button className="btn btn-primary" onClick={() => setModal("session")}>+ NEW SESSION</button>
                </div>
              </div>

              {loading.sessions ? <Loader /> : sessions.length === 0 ? (
                <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", padding: "60px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "2px" }}>
                  NO SESSIONS FOUND — LOG YOUR FIRST SESSION
                </div>
              ) : sessions.map(s => (
                <div key={s.id} className="session-row" onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "14px" }}>{TYPE_ICON[s.session_type]}</span>
                        <span style={{ fontFamily: "var(--sans)", fontSize: "15px", color: "var(--text)", fontWeight: 500 }}>{s.title}</span>
                        {s.produced_output && (
                          <span className="badge" style={{ background: "rgba(74,240,255,0.1)", border: "1px solid rgba(74,240,255,0.3)", color: "var(--cyan)" }}>
                            {OUTPUT_ICON[s.output_type]} OUTPUT
                          </span>
                        )}
                        {s.recurring_gap && (
                          <span className="badge" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "var(--red)" }}>
                            ⚠ RECURRING GAP
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>
                        {s.pillar_name || "NO PILLAR"} · {s.session_type} · {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "20px", fontWeight: "bold", color: RATING_COLOR[s.efficiency_rating] }}>
                          {s.learning_efficiency?.toFixed(2) ?? "—"}
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: RATING_COLOR[s.efficiency_rating], letterSpacing: "2px" }}>
                          {s.efficiency_rating?.toUpperCase()}
                        </div>
                      </div>
                      <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: "9px" }}
                        onClick={e => deleteSession(s.id, e)}>✕</button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: "10px", height: "2px", background: "var(--border)", borderRadius: "1px" }}>
                    <div style={{
                      height: "100%", borderRadius: "1px",
                      width: `${s.efficiency_percentage || 0}%`,
                      background: RATING_COLOR[s.efficiency_rating],
                      boxShadow: `0 0 6px ${RATING_COLOR[s.efficiency_rating]}`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>

                  {/* Expanded */}
                  {expandedSession === s.id && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", animation: "fadeUp 0.3s ease" }}>
                      {[
                        { label: "TIME SPENT", value: `${s.time_spent}h`, color: "var(--green)" },
                        { label: "CONCEPT LINKS", value: s.concept_links, color: "var(--cyan)" },
                        { label: "KNOWLEDGE GAPS", value: s.knowledge_gaps, color: "var(--red)" },
                        { label: "RESEARCH Qs", value: s.research_questions, color: "var(--yellow)" },
                        { label: "MAX EFFICIENCY", value: s.max_efficiency?.toFixed(2), color: "var(--text2)" },
                        { label: "% OF MAX", value: `${s.efficiency_percentage}%`, color: "var(--text2)" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--text3)", letterSpacing: "2px", marginBottom: "4px" }}>{item.label}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "16px", color: item.color }}>{item.value}</div>
                        </div>
                      ))}
                      {s.output_notes && (
                        <div style={{ gridColumn: "1 / -1", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--text3)", letterSpacing: "2px", marginBottom: "4px" }}>OUTPUT NOTES</div>
                          <div style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "var(--text2)" }}>{s.output_notes}</div>
                        </div>
                      )}
                      {s.gap_description && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--red)", letterSpacing: "2px", marginBottom: "4px" }}>GAP DESCRIPTION</div>
                          <div style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "var(--text2)" }}>{s.gap_description}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* GAPS */}
          {tab === "gaps" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(f => (
                    <button key={f} className="btn" style={{
                      padding: "6px 14px", fontSize: "9px",
                      background: gapFilter === f ? "rgba(74,240,255,0.15)" : "none",
                      borderColor: gapFilter === f ? "var(--cyan)" : "var(--border)",
                      color: gapFilter === f ? "var(--cyan)" : "var(--text3)",
                    }} onClick={() => setGapFilter(f)}>{f.replace("_", " ")}</button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => setModal("gap")}>+ TRACK GAP</button>
              </div>

              {loading.gaps ? <Loader /> : gaps.length === 0 ? (
                <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", padding: "60px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "2px" }}>
                  NO GAPS FOUND
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {gaps.map(g => {
                    const col = g.status === "RESOLVED" ? "var(--green)" : g.status === "IN_PROGRESS" ? "var(--yellow)" : "var(--red)";
                    return (
                      <div key={g.id} className="card" style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                            <div className="dot" style={{ background: col, boxShadow: `0 0 6px ${col}`, marginTop: "5px" }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--text)", marginBottom: "6px", fontWeight: 500 }}>{g.gap}</div>
                              <div style={{ display: "flex", gap: "16px", fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>
                                <span>{g.pillar_name || "NO PILLAR"}</span>
                                <span>{g.session_count} SESSIONS</span>
                                {g.resolved_at && <span>RESOLVED {new Date(g.resolved_at).toLocaleDateString()}</span>}
                              </div>
                              {g.resolution_notes && (
                                <div style={{ marginTop: "8px", fontFamily: "var(--sans)", fontSize: "12px", color: "var(--green)", background: "rgba(0,255,163,0.05)", padding: "8px 10px", borderLeft: "2px solid var(--green)" }}>
                                  {g.resolution_notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                            <span className="badge" style={{ background: `${col}18`, border: `1px solid ${col}44`, color: col }}>
                              {g.status_display || g.status}
                            </span>
                            {g.status !== "RESOLVED" && (
                              <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "9px" }}
                                onClick={() => setModal({ type: "resolve", gap: g })}>RESOLVE</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                {/* Session types */}
                <div className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>SESSION TYPE BREAKDOWN</div>
                  {dashboard ? Object.entries(dashboard.sessions_by_type || {}).map(([type, count], i) => {
                    const max = Math.max(...Object.values(dashboard.sessions_by_type));
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "14px", width: "20px" }}>{TYPE_ICON[type] || "•"}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text2)", width: "80px", letterSpacing: "1px" }}>{type}</span>
                        <div style={{ flex: 1, height: "4px", background: "var(--border)", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: "var(--cyan)", borderRadius: "2px", transition: "width 0.8s ease" }} />
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--cyan)", width: "16px", textAlign: "right" }}>{count}</span>
                      </div>
                    );
                  }) : <Loader />}
                </div>

                {/* Formula reference */}
                <div className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>EFFICIENCY FORMULA</div>
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "2px", padding: "16px", marginBottom: "16px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--cyan)", lineHeight: "2.2" }}>
                      <div style={{ color: "var(--text3)" }}># Learning Efficiency</div>
                      <div>LE = <span style={{ color: "var(--green)" }}>(Ts × Cl)</span> / <span style={{ color: "var(--red)" }}>(Kg × Rq)</span></div>
                      <div style={{ marginTop: "8px", color: "var(--text3)" }}># Max Efficiency</div>
                      <div>MAX = <span style={{ color: "var(--green)" }}>(Ts × Cl)</span> / <span style={{ color: "var(--red)" }}>(1 × 1)</span></div>
                    </div>
                  </div>
                  {[
                    { abbr: "Ts", label: "Time Spent (hours)", color: "var(--green)" },
                    { abbr: "Cl", label: "Concept Links made", color: "var(--cyan)" },
                    { abbr: "Kg", label: "Knowledge Gaps remaining", color: "var(--red)" },
                    { abbr: "Rq", label: "Research Questions open", color: "var(--yellow)" },
                  ].map((v, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #0f1e2e" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: v.color }}>{v.abbr}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text2)", letterSpacing: "1px" }}>{v.label}</span>
                    </div>
                  ))}
                </div>

                {/* Top sessions */}
                <div className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>TOP 5 SESSIONS</div>
                  {sessions.length === 0 ? <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)" }}>NO DATA</div> :
                    [...sessions].sort((a, b) => (b.learning_efficiency || 0) - (a.learning_efficiency || 0)).slice(0, 5).map((s, i) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f1e2e" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)", width: "16px" }}>#{i + 1}</span>
                          <span style={{ fontFamily: "var(--sans)", fontSize: "12px", color: "var(--text2)" }}>{s.title.slice(0, 30)}{s.title.length > 30 ? "..." : ""}</span>
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: RATING_COLOR[s.efficiency_rating], fontWeight: "bold" }}>
                          {s.learning_efficiency?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Pillar stats */}
                <div className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "3px", marginBottom: "16px" }}>PILLAR STATS</div>
                  {pillars.length === 0 ? <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text3)" }}>NO PILLARS CONFIGURED</div> :
                    pillars.map((p, i) => (
                      <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #0f1e2e" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "var(--sans)", fontSize: "12px", color: "var(--text2)" }}>{p.name?.replace(/_/g, " ")}</span>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)" }}>{p.total_sessions} SESSIONS</span>
                            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--yellow)" }}>AVG {p.average_efficiency || 0}</span>
                            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--red)" }}>{p.open_gaps} GAPS</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 40px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text3)", letterSpacing: "2px" }}>
          <span>LEARNING INTELLIGENCE TRACKER v2.0</span>
          <span>API: {API_BASE}</span>
          <span>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</span>
        </div>
      </div>

      {/* Modals */}
      {modal === "session" && (
        <NewSessionModal pillars={pillars} onClose={() => setModal(null)} onSave={onSessionSaved} />
      )}
      {modal === "gap" && (
        <NewGapModal pillars={pillars} sessions={sessions} onClose={() => setModal(null)} onSave={onGapSaved} />
      )}
      {modal?.type === "resolve" && (
        <ResolveModal gap={modal.gap} onClose={() => setModal(null)} onResolved={onGapResolved} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
