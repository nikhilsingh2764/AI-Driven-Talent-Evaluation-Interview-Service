import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Card, Spinner } from "../components/ui.jsx";

const MAX = 5000;

export default function InterviewRun() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null); // { question, answered, total, role, difficulty }
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [done, setDone] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const load = async () => {
    try {
      const d = await api.getSession(sessionId);
      if (d.session.status === "COMPLETED") return setDone(true);
      setState({ question: d.currentQuestion, answered: d.session.currentQuestionIndex, total: d.totalQuestions, role: d.role, difficulty: d.difficulty });
    } catch (e) {
      setLoadError(e);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sessionId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.submitAnswer(sessionId, answer);
      setAnswer("");
      if (r.completed) {
        setFinishing(true);
        navigate(`/report/${sessionId}`, { replace: true, state: { reportError: r.reportError } });
      } else {
        setState((s) => ({ ...s, question: r.nextQuestion, answered: r.progress.answered }));
        setBusy(false);
      }
    } catch (err) {
      setError(err.message);
      if (err.status === 409) await load(); // the server moved on (for example a double click): resync
      setBusy(false);
    }
  };

  if (done) return <Navigate to={`/report/${sessionId}`} replace />;
  if (loadError) return <Alert>{loadError.message}</Alert>;
  if (!state) return <Spinner />;
  if (finishing) return <Spinner label="Interview finished. The AI is scoring your answers..." />;

  const pct = Math.round((state.answered / state.total) * 100);
  return (
    <>
      <div className="page-head"><div><h1>{state.role}</h1><p className="muted">{state.difficulty} · question {state.answered + 1} of {state.total}</p></div></div>
      <div className="bar-track" aria-label={`${pct}% complete`}><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
      <Card>
        <form className="stack" onSubmit={submit}>
          <Alert>{error}</Alert>
          <div className="question">{state.question?.question}</div>
          <span className="badge CREATED" style={{ justifySelf: "start" }}>{state.question?.category}</span>
          <textarea required maxLength={MAX} autoFocus placeholder="Type your answer..." value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Your answer" />
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted small">{answer.length}/{MAX} · you cannot go back to a previous question</span>
            <button className="btn" disabled={busy || !answer.trim()}>{busy ? "Saving..." : state.answered + 1 === state.total ? "Submit and finish" : "Submit answer"}</button>
          </div>
        </form>
      </Card>
    </>
  );
}
