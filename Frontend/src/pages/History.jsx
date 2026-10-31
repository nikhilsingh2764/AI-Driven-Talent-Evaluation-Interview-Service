import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Alert, Card, Spinner, fmtDate, useLoad } from "../components/ui.jsx";

const empty = { search: "", difficulty: "", category: "", sort: "latest" };

export default function History() {
  const [filters, setFilters] = useState(empty);
  const [applied, setApplied] = useState(empty); // filters are applied on submit, not on every keystroke
  const [page, setPage] = useState(1);

  const params = { page, limit: 8, sort: applied.sort, ...(applied.search && { search: applied.search }), ...(applied.difficulty && { difficulty: applied.difficulty }), ...(applied.category && { category: applied.category }) };
  const { data, error, loading } = useLoad(() => api.history(params), [JSON.stringify(params)]);

  const apply = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  };

  return (
    <>
      <div className="page-head"><div><h1>Interview history</h1><p className="muted">Every finished interview and its score.</p></div></div>

      <Card>
        <form className="filters" onSubmit={apply}>
          <input placeholder="Search role..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} aria-label="Search role" />
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} aria-label="Difficulty">
            <option value="">Any difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} aria-label="Category">
            <option value="">Any category</option><option>Technical</option><option>Behavioral</option><option>System Design</option><option>HR</option>
          </select>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} aria-label="Sort">
            <option value="latest">Newest first</option><option value="oldest">Oldest first</option><option value="highest-score">Highest score</option><option value="lowest-score">Lowest score</option>
          </select>
          <button className="btn">Apply</button>
        </form>
      </Card>

      <Card>
        {loading ? <Spinner /> : error ? <Alert>{error.message}</Alert> : data.items.length === 0 ? <p className="muted">No interviews match. <Link to="/interviews">Start one</Link>.</p> : (
          <>
            <div className="table-wrap"><table>
              <thead><tr><th>Role</th><th>Difficulty</th><th>Score</th><th>Readiness</th><th>Date</th><th /></tr></thead>
              <tbody>
                {data.items.map((h) => (
                  <tr key={h.reportId}><td><strong>{h.role || "-"}</strong><div className="muted small">{h.experience}</div></td><td>{h.difficulty || "-"}</td><td><strong>{h.overallScore}</strong></td><td>{h.interviewReadiness}%</td><td className="small">{fmtDate(h.createdAt)}</td><td><Link to={`/report/${h.sessionId}`}>Report</Link></td></tr>
                ))}
              </tbody>
            </table></div>
            <div className="pager">
              <button className="btn btn-small btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="muted small">Page {data.page} of {data.totalPages} · {data.total} total</span>
              <button className="btn btn-small btn-ghost" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
