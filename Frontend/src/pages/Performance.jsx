import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Bar, Card, List, Spinner, downloadBlob, fmtDate, useLoad } from "../components/ui.jsx";

export default function Performance() {
  const report = useLoad(() => api.getPerformance().catch((e) => (e.status === 404 ? null : Promise.reject(e))));
  const history = useLoad(() => api.history({ limit: 1 }));
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ kind: "error", text: "" });

  const run = async (name, fn, okText) => {
    setBusy(name);
    setMsg({ kind: "error", text: "" });
    try {
      await fn();
      if (okText) setMsg({ kind: "success", text: okText });
    } catch (e) {
      setMsg({ kind: "error", text: e.message });
    } finally {
      setBusy("");
    }
  };

  if (report.loading || history.loading) return <Spinner />;
  if (report.error) return <Alert>{report.error.message}</Alert>;
  const r = report.data;
  const totalDone = history.data?.total ?? 0;
  const outdated = r && totalDone > r.totalInterviews;

  return (
    <>
      <div className="page-head">
        <div><h1>Performance report</h1><p className="muted">Your progress across all finished interviews.</p></div>
        <div className="row">
          {r && <button className="btn btn-ghost" disabled={busy === "pdf"} onClick={() => run("pdf", async () => downloadBlob(await api.performancePdf(), "performance-report.pdf"))}>{busy === "pdf" ? "Preparing..." : "Download PDF"}</button>}
          <button className="btn" disabled={busy === "gen" || totalDone === 0} onClick={() => run("gen", async () => { await api.generatePerformance(); report.reload(); history.reload(); }, "Report is up to date.")}>
            {busy === "gen" ? "Generating..." : r ? "Refresh report" : "Generate report"}
          </button>
        </div>
      </div>

      <Alert kind={msg.kind}>{msg.text}</Alert>
      {busy === "gen" && <Spinner label="The AI is analysing your history (this can take up to a minute)..." />}
      {totalDone === 0 && <Alert kind="info">Finish at least one interview first. <Link to="/interviews">Go to interviews</Link></Alert>}
      {outdated && <Alert kind="warn">You have {totalDone - r.totalInterviews} new interview(s) since this report. Press "Refresh report".</Alert>}

      {r && (
        <>
          <div className="grid grid-2">
            <Card title="Progress">
              <Bar label="Overall" value={r.overallProgress} />
              <Bar label="Technical" value={r.technicalProgress} />
              <Bar label="Communication" value={r.communicationProgress} />
              <Bar label="Problem solving" value={r.problemSolvingProgress} />
              <Bar label="Confidence" value={r.confidenceProgress} />
              <Bar label="Interview readiness" value={r.interviewReadiness} />
            </Card>
            <Card title="Summary">
              <p style={{ marginTop: 0 }}>{r.summary || "-"}</p>
              <p><strong>Strongest:</strong> {r.strongestSkill || "-"}<br /><strong>Weakest:</strong> {r.weakestSkill || "-"}</p>
              <p className="small muted" style={{ marginBottom: 0 }}>Based on {r.totalInterviews} interview(s) · updated {fmtDate(r.updatedAt)}</p>
            </Card>
          </div>
          <div className="grid grid-2">
            <Card title="Improvement areas"><List items={r.improvementAreas} /></Card>
            <Card title="Study plan"><List items={r.studyPlan} /></Card>
          </div>
        </>
      )}
    </>
  );
}
