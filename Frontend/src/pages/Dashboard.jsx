import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Bar, Card, Spinner, fmtDate, useLoad } from "../components/ui.jsx";

export default function Dashboard() {
  const { data, error, loading } = useLoad(api.dashboard);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error.message}</Alert>;

  const { dashboardStats: s, progressChart, interviewHistory, resumeAnalysis, performanceReportOutdated } = data;
  const steps = [
    ["Upload your resume", "/resume", Boolean(resumeAnalysis) || undefined],
    ["Analyse the resume", "/resume", Boolean(resumeAnalysis)],
    ["Take a mock interview", "/interviews", s.totalInterviews > 0],
    ["Generate your performance report", "/performance", Boolean(progressChart)],
  ];

  return (
    <>
      <div className="page-head"><div><h1>Dashboard</h1><p className="muted">Your progress at a glance.</p></div></div>

      <div className="grid grid-4">
        <Card className="stat"><b>{s.totalInterviews}</b><span>Interviews done</span></Card>
        <Card className="stat"><b>{s.averageScore}</b><span>Average score</span></Card>
        <Card className="stat"><b>{s.overallProgress}%</b><span>Overall progress</span></Card>
        <Card className="stat"><b>{s.interviewReadiness}%</b><span>Interview readiness</span></Card>
      </div>

      {performanceReportOutdated && <Alert kind="warn">You finished new interviews since your last performance report. <Link to="/performance">Update it</Link>.</Alert>}

      <div className="grid grid-2">
        <Card title="Getting started">
          <ol className="list">
            {steps.map(([label, to, done]) => (
              <li key={label}><Link to={to}>{label}</Link> {done && <span className="badge COMPLETED">done</span>}</li>
            ))}
          </ol>
        </Card>
        <Card title="Skill progress">
          {progressChart ? (
            <>
              <Bar label="Technical" value={progressChart.technicalProgress} />
              <Bar label="Communication" value={progressChart.communicationProgress} />
              <Bar label="Problem solving" value={progressChart.problemSolvingProgress} />
              <Bar label="Confidence" value={progressChart.confidenceProgress} />
            </>
          ) : <p className="muted">No performance report yet. Finish an interview, then <Link to="/performance">generate one</Link>.</p>}
        </Card>
      </div>

      {resumeAnalysis && (
        <Card title="Resume analysis" actions={<Link to="/resume">Details</Link>}>
          <p style={{ marginTop: 0 }}>{resumeAnalysis.summary}</p>
          <Bar label="ATS score" value={resumeAnalysis.atsScore} />
        </Card>
      )}

      <Card title="Recent interviews" actions={<Link to="/history">All history</Link>}>
        {interviewHistory.length === 0 ? <p className="muted">No interviews yet. <Link to="/interviews">Start one</Link>.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Role</th><th>Difficulty</th><th>Score</th><th>Date</th><th /></tr></thead>
            <tbody>
              {[...interviewHistory].reverse().slice(0, 5).map((h) => (
                <tr key={h.sessionId}><td>{h.role || "-"}</td><td>{h.difficulty || "-"}</td><td><strong>{h.overallScore}</strong></td><td>{fmtDate(h.createdAt)}</td><td><Link to={`/report/${h.sessionId}`}>Report</Link></td></tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
