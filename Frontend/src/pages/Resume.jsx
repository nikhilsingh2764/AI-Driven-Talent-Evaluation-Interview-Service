import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Bar, Card, Spinner, Tags, List, downloadBlob, fmtDate, useLoad } from "../components/ui.jsx";

const MAX = 5 * 1024 * 1024;

export default function Resume() {
  const resume = useLoad(() => api.getResume().catch((e) => (e.status === 404 ? null : Promise.reject(e))));
  const analysis = useLoad(() => api.getAnalysis().catch((e) => (e.status === 404 ? null : Promise.reject(e))));
  const fileInput = useRef(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ kind: "error", text: "" });

  const say = (kind, text) => setMsg({ kind, text });

  const act = async (name, fn, okText) => {
    setBusy(name);
    say("error", "");
    try {
      await fn();
      if (okText) say("success", okText);
    } catch (e) {
      say("error", e.message);
    } finally {
      setBusy("");
    }
  };

  const pick = (mode) => () => {
    const file = fileInput.current?.files?.[0];
    if (!file) return say("error", "Choose a PDF file first.");
    if (file.size > MAX) return say("error", "File is larger than 5 MB.");
    return act(mode, async () => {
      if (mode === "upload") await api.uploadResume(file);
      else await api.replaceResume(file);
      fileInput.current.value = "";
      resume.reload();
      analysis.reload();
    }, mode === "upload" ? "Resume uploaded. Now analyse it." : "Resume replaced. Run the analysis again.");
  };

  if (resume.loading) return <Spinner />;
  if (resume.error) return <Alert>{resume.error.message}</Alert>;
  const r = resume.data;
  const a = analysis.data;

  return (
    <>
      <div className="page-head"><div><h1>Resume</h1><p className="muted">One PDF per account, up to 5 MB.</p></div></div>
      <Alert kind={msg.kind}>{msg.text}</Alert>

      <Card title={r ? "Your resume" : "Upload your resume"}>
        {r && (
          <div className="stack" style={{ marginBottom: "1rem" }}>
            <div><strong>{r.fileName}</strong> <span className="muted small">uploaded {fmtDate(r.createdAt)} · {r.textLength.toLocaleString()} characters read</span></div>
            <div className="row">
              <button className="btn btn-small btn-ghost" onClick={() => act("view", async () => { const b = await api.resumeFile(); window.open(URL.createObjectURL(b), "_blank"); })} disabled={busy === "view"}>View PDF</button>
              <button className="btn btn-small btn-ghost" onClick={() => act("dl", async () => downloadBlob(await api.resumeFile(), r.fileName))}>Download</button>
              <button className="btn btn-small btn-danger" disabled={busy === "delete"} onClick={() => window.confirm("Delete your resume and its analysis?") && act("delete", async () => { await api.deleteResume(); resume.reload(); analysis.reload(); }, "Resume deleted.")}>Delete</button>
            </div>
          </div>
        )}
        <div className="row">
          <input ref={fileInput} type="file" accept="application/pdf,.pdf" style={{ maxWidth: 340 }} aria-label="Resume PDF" />
          {r
            ? <button className="btn" disabled={busy === "replace"} onClick={pick("replace")}>{busy === "replace" ? "Replacing..." : "Replace"}</button>
            : <button className="btn" disabled={busy === "upload"} onClick={pick("upload")}>{busy === "upload" ? "Uploading..." : "Upload"}</button>}
        </div>
      </Card>

      {r && (
        <Card title="AI analysis" actions={<button className="btn" disabled={busy === "analyze"} onClick={() => act("analyze", async () => { await api.analyzeResume(); analysis.reload(); }, "Analysis complete.")}>{busy === "analyze" ? "Analysing..." : a ? "Analyse again" : "Analyse resume"}</button>}>
          {busy === "analyze" && <Spinner label="The AI is reading your resume (this can take up to a minute)..." />}
          {!a && busy !== "analyze" && <p className="muted">Not analysed yet.</p>}
          {a && busy !== "analyze" && (
            <div className="stack">
              <p style={{ margin: 0 }}>{a.summary}</p>
              <Bar label="ATS score" value={a.atsScore} />
              <div className="grid grid-2">
                <div><h3>Technical skills</h3><Tags items={a.technicalSkills} /></div>
                <div><h3>Soft skills</h3><Tags items={a.softSkills} /></div>
                <div><h3>Strengths</h3><List items={a.strengths} /></div>
                <div><h3>Weaknesses</h3><List items={a.weaknesses} /></div>
                <div><h3>Missing skills</h3><Tags items={a.missingSkills} /></div>
                <div><h3>Recommended roles</h3><Tags items={a.recommendedRoles} /></div>
              </div>
              <div><h3>Improvement suggestions</h3><List items={a.improvementSuggestions} /></div>
              <p className="small muted" style={{ margin: 0 }}>Analysed {fmtDate(a.updatedAt)}. Next: <Link to="/interviews">create a mock interview</Link>.</p>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
