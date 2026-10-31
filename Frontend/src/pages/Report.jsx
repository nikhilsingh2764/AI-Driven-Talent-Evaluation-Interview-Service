import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Bar, Card, List, Spinner, fmtDate, useLoad } from "../components/ui.jsx";

export default function Report() {
  const { sessionId } = useParams();
  const { state } = useLocation();
  // The server generates the report now if the earlier attempt failed
  const { data: r, error, loading, reload } = useLoad(() => api.getReport(sessionId), [sessionId]);

  if (loading) return <Spinner label="Loading your report (the AI may still be scoring it)..." />;
  if (error) return (
    <>
      <Alert>{error.message}</Alert>
      <div className="row">
        <button className="btn" onClick={reload}>Try again</button>
        {error.status === 409 && <Link className="btn btn-ghost" to={`/interview/${sessionId}`}>Back to the interview</Link>}
      </div>
    </>
  );

  return (
    <>
      <div className="page-head"><div><h1>Interview report</h1><p className="muted">Generated {fmtDate(r.createdAt)}</p></div><Link className="btn btn-ghost" to="/interviews">Interviews</Link></div>
      {state?.reportError && <Alert kind="info">The first scoring attempt failed, so the report was generated again just now.</Alert>}

      <div className="grid grid-2">
        <Card title="Overall"><div className="score-big">{r.overallScore}<span className="muted" style={{ fontSize: "1rem" }}>/100</span></div><Bar label="Interview readiness" value={r.interviewReadiness} /></Card>
        <Card title="Scores">
          <Bar label="Technical" value={r.technicalScore} />
          <Bar label="Communication" value={r.communicationScore} />
          <Bar label="Problem solving" value={r.problemSolvingScore} />
          <Bar label="Confidence" value={r.confidenceScore} />
        </Card>
      </div>
      <Card title="Feedback"><p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.feedback || "-"}</p></Card>
      <div className="grid grid-2">
        <Card title="Strengths"><List items={r.strengths} /></Card>
        <Card title="Weaknesses"><List items={r.weaknesses} /></Card>
      </div>
      <Card title="Recommendations"><List items={r.recommendations} /></Card>
    </>
  );
}
