import { useState, useEffect } from "react";
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PolarRadiusAxis } from "recharts";

const MOCK_DATA = {
  total_sessions: 12,
  total_hours: 47.5,
  average_efficiency: 6.4,
  highest_efficiency: 24.0,
  open_gaps: 8,
  resolved_gaps: 3,
  sessions_with_output: 7,
  sessions_by_type: { PAPER: 5, CODING: 3, WRITING: 2, SEMINAR: 1, EXPERIMENT: 1 },
  sessions_by_pillar: {
    AI_FORENSICS: 4,
    CYBER_SECURITY: 3,
    ATTRIBUTION: 2,
    LEGAL_FRAMEWORK: 2,
    ML_ADVERSARIAL: 1,
  },
  recent_sessions: [
    { id: 2, title: "AI and Security OWASP 10", session_type: "PAPER", pillar_name: "Cyber Security", learning_efficiency: 1.33, efficiency_rating: "Needs Work", efficiency_percentage: 33.3, time_spent: 1, concept_links: 4, knowledge_gaps: 3, research_questions: 1, output_type: "NOTES", produced_output: true, created_at: "2026-03-03T13:12:53Z" },
    { id: 1, title: "AI and Security OWASP 10", session_type: "PAPER", pillar_name: "Cyber Security", learning_efficiency: 8.0, efficiency_rating: "Good", efficiency_percentage: 66.6, time_spent: 6, concept_links: 4, knowledge_gaps: 3, research_questions: 1, output_type: "NOTES", produced_output: true, created_at: "2026-03-03T13:12:39Z" },
    { id: 3, title: "LLM Fingerprinting Methods", session_type: "EXPERIMENT", pillar_name: "AI Forensics", learning_efficiency: 16.0, efficiency_rating: "Excellent", efficiency_percentage: 88.9, time_spent: 4, concept_links: 8, knowledge_gaps: 2, research_questions: 1, output_type: "HYPOTHESIS", produced_output: true, created_at: "2026-03-02T09:00:00Z" },
    { id: 4, title: "Digital Attribution Chain Breakdown", session_type: "WRITING", pillar_name: "AI Attack Attribution", learning_efficiency: 12.0, efficiency_rating: "Good", efficiency_percentage: 60.0, time_spent: 3, concept_links: 6, knowledge_gaps: 1, research_questions: 1, output_type: "DRAFT", produced_output: true, created_at: "2026-03-01T14:00:00Z" },
    { id: 5, title: "Adversarial ML Attack Taxonomy", session_type: "PAPER", pillar_name: "Adversarial ML", learning_efficiency: 4.0, efficiency_rating: "Average", efficiency_percentage: 50.0, time_spent: 2, concept_links: 4, knowledge_gaps: 2, research_questions: 1, output_type: "NONE", produced_output: false, created_at: "2026-02-28T10:00:00Z" },
  ],
};

const EFFICIENCY_TREND = [
  { session: "S1", efficiency: 8.0, date: "Mar 3" },
  { session: "S2", efficiency: 1.33, date: "Mar 3" },
  { session: "S3", efficiency: 16.0, date: "Mar 2" },
  { session: "S4", efficiency: 12.0, date: "Mar 1" },
  { session: "S5", efficiency: 4.0, date: "Feb 28" },
];

const RADAR_DATA = [
  { subject: "AI Forensics", score: 80 },
  { subject: "Cyber Sec", score: 65 },
  { subject: "Attribution", score: 45 },
  { subject: "Legal", score: 30 },
  { subject: "Adversarial ML", score: 20 },
  { subject: "Tools", score: 55 },
];

const RATING_COLOR = {
  Excellent: "#00ffa3",
  Good: "#4af0ff",
  Average: "#ffd166",
  "Needs Work": "#ff6b6b",
  "N/A": "#555",
};

const TYPE_ICON = {
  PAPER: "📄",
  CODING: "💻",
  WRITING: "✍️",
  SEMINAR: "🎓",
  REVIEW: "🔁",
  EXPERIMENT: "🧪",
};

const OUTPUT_ICON = {
  NOTES: "📝",
  DRAFT: "📃",
  CODE: "⌨️",
  HYPOTHESIS: "💡",
  DIAGRAM: "🗺️",
  NONE: "—",
};

export default function PhDDashboard() {
  const [data] = useState(MOCK_DATA);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSession, setSelectedSession] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const pillarBar = Object.entries(data.sessions_by_pillar).map(([k, v]) => ({
    name: k.replace("_", " "),
    sessions: v,
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070b14",
      fontFamily: "'Courier New', monospace",
      color: "#c8d8e8",
      padding: "0",
      overflow: "hidden auto",
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,163,0.015) 2px, rgba(0,255,163,0.015) 4px)",
      }} />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a2a3a",
        padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(90deg, #070b14 0%, #0d1a2a 100%)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.6s ease",
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#00ffa3", letterSpacing: "4px", marginBottom: "4px" }}>
            PHD RESEARCH SYSTEM // AI & CYBER FORENSICS
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#e8f4ff", letterSpacing: "1px" }}>
            LEARNING INTELLIGENCE TRACKER
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#4a6a8a", letterSpacing: "2px" }}>SYSTEM STATUS</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ffa3", boxShadow: "0 0 8px #00ffa3", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "12px", color: "#00ffa3" }}>ACTIVE</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card { background: #0d1520; border: 1px solid #1a2a3a; border-radius: 4px; transition: border-color 0.2s; }
        .card:hover { border-color: #2a4a6a; }
        .tab { background: none; border: none; cursor: pointer; padding: 10px 20px; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; transition: all 0.2s; }
        .tab-active { color: #00ffa3; border-bottom: 1px solid #00ffa3; }
        .tab-inactive { color: #4a6a8a; border-bottom: 1px solid transparent; }
        .tab-inactive:hover { color: #8abadc; }
        .session-row { background: #0d1520; border: 1px solid #1a2a3a; border-radius: 4px; padding: 14px 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 8px; }
        .session-row:hover { border-color: #2a4a6a; background: #111d2e; }
      `}</style>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "0", padding: "0 40px",
        borderBottom: "1px solid #1a2a3a",
        opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.2s",
      }}>
        {["overview", "sessions", "gaps", "analytics"].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? "tab-active" : "tab-inactive"}`}
            onClick={() => setActiveTab(tab)}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px 40px", opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.3s" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "TOTAL SESSIONS", value: data.total_sessions, unit: "", accent: "#4af0ff" },
                { label: "HOURS INVESTED", value: data.total_hours, unit: "h", accent: "#00ffa3" },
                { label: "AVG EFFICIENCY", value: data.average_efficiency, unit: "", accent: "#ffd166" },
                { label: "PEAK EFFICIENCY", value: data.highest_efficiency, unit: "", accent: "#ff6b6b" },
              ].map((kpi, i) => (
                <div key={i} className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "10px" }}>{kpi.label}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: kpi.accent, fontVariantNumeric: "tabular-nums" }}>
                    {kpi.value}{kpi.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Second row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "OPEN GAPS", value: data.open_gaps, color: "#ff6b6b" },
                { label: "RESOLVED GAPS", value: data.resolved_gaps, color: "#00ffa3" },
                { label: "SESSIONS W/ OUTPUT", value: data.sessions_with_output, color: "#4af0ff" },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px" }}>{item.label}</span>
                  <span style={{ fontSize: "24px", fontWeight: "bold", color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>

              {/* Efficiency trend */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>EFFICIENCY TREND</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={[...EFFICIENCY_TREND].reverse()}>
                    <XAxis dataKey="session" stroke="#1a2a3a" tick={{ fill: "#4a6a8a", fontSize: 10 }} />
                    <YAxis stroke="#1a2a3a" tick={{ fill: "#4a6a8a", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0d1520", border: "1px solid #1a2a3a", borderRadius: "4px", color: "#c8d8e8", fontSize: "11px" }} />
                    <Line type="monotone" dataKey="efficiency" stroke="#00ffa3" strokeWidth={2} dot={{ fill: "#00ffa3", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Radar */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>KNOWLEDGE COVERAGE</div>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="#1a2a3a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#4a6a8a", fontSize: 9 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#4af0ff" fill="#4af0ff" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pillar bar */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>SESSIONS BY RESEARCH PILLAR</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={pillarBar} layout="vertical">
                  <XAxis type="number" stroke="#1a2a3a" tick={{ fill: "#4a6a8a", fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fill: "#8abadc", fontSize: 10 }} stroke="#1a2a3a" />
                  <Tooltip contentStyle={{ background: "#0d1520", border: "1px solid #1a2a3a", borderRadius: "4px", color: "#c8d8e8", fontSize: "11px" }} />
                  <Bar dataKey="sessions" fill="#4af0ff" fillOpacity={0.7} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === "sessions" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px" }}>RECENT LEARNING SESSIONS</div>
              <div style={{ fontSize: "9px", color: "#4a6a8a" }}>{data.recent_sessions.length} RECORDS</div>
            </div>

            {data.recent_sessions.map((s) => (
              <div key={s.id} className="session-row" onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px" }}>{TYPE_ICON[s.session_type]}</span>
                      <span style={{ color: "#e8f4ff", fontSize: "13px" }}>{s.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "10px", color: "#4a6a8a" }}>
                      <span>{s.pillar_name}</span>
                      <span>{s.session_type}</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: RATING_COLOR[s.efficiency_rating] }}>
                      {s.learning_efficiency?.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "9px", color: RATING_COLOR[s.efficiency_rating], letterSpacing: "2px" }}>
                      {s.efficiency_rating?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Efficiency bar */}
                <div style={{ marginTop: "10px", height: "3px", background: "#1a2a3a", borderRadius: "2px" }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    width: `${s.efficiency_percentage || 0}%`,
                    background: RATING_COLOR[s.efficiency_rating],
                    transition: "width 0.6s ease",
                    boxShadow: `0 0 6px ${RATING_COLOR[s.efficiency_rating]}`,
                  }} />
                </div>

                {/* Expanded detail */}
                {selectedSession?.id === s.id && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1a2a3a", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", animation: "fadeUp 0.3s ease" }}>
                    {[
                      { label: "TIME SPENT", value: `${s.time_spent}h` },
                      { label: "CONCEPT LINKS", value: s.concept_links },
                      { label: "KNOWLEDGE GAPS", value: s.knowledge_gaps },
                      { label: "RESEARCH Qs", value: s.research_questions },
                      { label: "OUTPUT", value: `${OUTPUT_ICON[s.output_type]} ${s.output_type}` },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: "8px", color: "#4a6a8a", letterSpacing: "2px", marginBottom: "4px" }}>{item.label}</div>
                        <div style={{ fontSize: "14px", color: "#c8d8e8" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GAPS TAB */}
        {activeTab === "gaps" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "20px" }}>KNOWLEDGE GAP TRACKER</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "OPEN", count: data.open_gaps, color: "#ff6b6b", gaps: ["LLM attribution fingerprinting methods", "Legal framework for AI-assisted crime", "Chain of custody for AI artifacts", "Adversarial prompt forensics", "Model watermarking techniques", "Evidence admissibility for AI output", "Forensic diff between AI vs human code", "Deepfake detection in legal context"] },
                { label: "RESOLVED", count: data.resolved_gaps, color: "#00ffa3", gaps: ["OWASP LLM Top 10 overview", "Basic ML attack taxonomy", "Digital forensics chain of custody"] },
              ].map((group, i) => (
                <div key={i} className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px" }}>{group.label} GAPS</span>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: group.color }}>{group.count}</span>
                  </div>
                  {group.gaps.map((gap, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: "1px solid #0f1e2e" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: group.color, marginTop: "5px", flexShrink: 0, boxShadow: `0 0 4px ${group.color}` }} />
                      <span style={{ fontSize: "11px", color: "#8abadc", lineHeight: "1.5" }}>{gap}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "20px" }}>RESEARCH ANALYTICS</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Session type breakdown */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>SESSION TYPE BREAKDOWN</div>
                {Object.entries(data.sessions_by_type).map(([type, count], i) => {
                  const max = Math.max(...Object.values(data.sessions_by_type));
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "14px", width: "20px" }}>{TYPE_ICON[type]}</span>
                      <span style={{ fontSize: "10px", color: "#8abadc", width: "80px" }}>{type}</span>
                      <div style={{ flex: 1, height: "4px", background: "#1a2a3a", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: "#4af0ff", borderRadius: "2px", transition: "width 0.8s ease" }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "#4af0ff", width: "16px", textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Formula reference */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>EFFICIENCY FORMULA</div>
                <div style={{ background: "#070b14", border: "1px solid #1a2a3a", borderRadius: "4px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#4af0ff", fontFamily: "monospace", lineHeight: "2" }}>
                    <div style={{ color: "#4a6a8a" }}># Learning Efficiency</div>
                    <div>LE = <span style={{ color: "#00ffa3" }}>(Ts × Cl)</span> / <span style={{ color: "#ff6b6b" }}>(Kg × Rq)</span></div>
                    <div style={{ marginTop: "8px", color: "#4a6a8a" }}># Max Efficiency</div>
                    <div>MAX = <span style={{ color: "#00ffa3" }}>(Ts × Cl)</span> / <span style={{ color: "#ff6b6b" }}>(1 × 1)</span></div>
                  </div>
                </div>
                {[
                  { abbr: "Ts", label: "Time Spent", color: "#00ffa3" },
                  { abbr: "Cl", label: "Concept Links", color: "#4af0ff" },
                  { abbr: "Kg", label: "Knowledge Gaps", color: "#ff6b6b" },
                  { abbr: "Rq", label: "Research Questions", color: "#ffd166" },
                ].map((v, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0f1e2e" }}>
                    <span style={{ fontSize: "12px", color: v.color, fontFamily: "monospace" }}>{v.abbr}</span>
                    <span style={{ fontSize: "10px", color: "#8abadc" }}>{v.label}</span>
                  </div>
                ))}
              </div>

              {/* PhD progress */}
              <div className="card" style={{ padding: "20px 24px", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "9px", color: "#4a6a8a", letterSpacing: "3px", marginBottom: "16px" }}>PHD RESEARCH PILLARS — COVERAGE DEPTH</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                  {RADAR_DATA.map((pillar, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", width: "60px", height: "60px", margin: "0 auto 8px" }}>
                        <svg viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="30" cy="30" r="24" fill="none" stroke="#1a2a3a" strokeWidth="4" />
                          <circle cx="30" cy="30" r="24" fill="none" stroke="#4af0ff" strokeWidth="4"
                            strokeDasharray={`${(pillar.score / 100) * 150.8} 150.8`}
                            strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#4af0ff", fontWeight: "bold" }}>
                          {pillar.score}%
                        </div>
                      </div>
                      <div style={{ fontSize: "9px", color: "#8abadc", letterSpacing: "1px" }}>{pillar.subject}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 40px", borderTop: "1px solid #1a2a3a", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#2a4a6a", letterSpacing: "2px" }}>
        <span>LEARNING INTELLIGENCE TRACKER v1.0</span>
        <span>AI & CYBER FORENSICS PHD SYSTEM</span>
        <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
      </div>
    </div>
  );
}
