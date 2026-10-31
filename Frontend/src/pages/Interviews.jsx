import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Card, Spinner, fmtDate, useLoad } from "../components/ui.jsx";

export default function Interviews() {
  const navigate = useNavigate();
  const list = useLoad(api.listInterviews);
  const [form, setForm] = useState({ role: "", experience: "", difficulty: "Medium" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState("");

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.createInterview(form);
      setForm({ ...form, role: "" });
      list.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const start = async (interview) => {
    setError("");
    setStartingId(interview.id);
    try {
      const { session } = await api.startSession(interview.id);
      navigate(`/interview/${session._id}`);
    } catch (err) {
      setError(err.message);
      setStartingId("");
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Mock interviews</h1><p className="muted">Questions are generated from your resume. You need an analysed resume first.</p></div></div>

      <Card title="New interview">
        <form className="stack" onSubmit={create}>
          {error && <Alert>{error}{error.toLowerCase().includes("resume") && <> <Link to="/resume">Go to Resume</Link></>}</Alert>}
          <div className="grid grid-2">
            <label>Role<input required minLength={2} maxLength={100} placeholder="e.g. Full Stack Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label>
            <label>Experience<input required maxLength={100} placeholder="e.g. Fresher, 2 years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
            <label>Difficulty
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </label>
          </div>
          <div><button className="btn" disabled={creating}>{creating ? "Generating questions..." : "Generate interview"}</button></div>
          {creating && <Spinner label="The AI is writing your questions (this can take up to a minute)..." />}
        </form>
      </Card>

      <Card title="Your interviews">
        {list.loading ? <Spinner /> : list.error ? <Alert>{list.error.message}</Alert> : list.data.length === 0 ? <p className="muted">None yet.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Role</th><th>Level</th><th>Status</th><th>Progress</th><th>Score</th><th>Created</th><th /></tr></thead>
            <tbody>
              {list.data.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.role}</strong><div className="muted small">{i.experience}</div></td>
                  <td>{i.difficulty}</td>
                  <td><span className={`badge ${i.status}`}>{i.status}</span></td>
                  <td>{i.status === "COMPLETED" ? i.totalQuestions : i.answered}/{i.totalQuestions}</td>
                  <td>{i.overallScore ?? "-"}</td>
                  <td className="small">{fmtDate(i.createdAt)}</td>
                  <td>
                    {i.status === "COMPLETED"
                      ? <Link className="btn btn-small btn-ghost" to={`/report/${i.sessionId}`}>Report</Link>
                      : <button className="btn btn-small" disabled={startingId === i.id} onClick={() => start(i)}>{i.status === "STARTED" ? "Continue" : "Start"}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
