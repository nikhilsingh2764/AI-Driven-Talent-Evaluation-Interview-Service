import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, History as HistoryIcon, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { ScoreBadge } from "../components/Score";
import Button, { buttonClass } from "../components/ui/Button";
import { Badge, EmptyState, ErrorNotice, Skeleton } from "../components/ui/Misc";
import { useDebounce } from "../hooks/useDebounce";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../lib/api";
import { CATEGORIES, DIFFICULTIES, type HistoryQuery } from "../lib/types";
import { formatDate } from "../lib/utils";
import { performanceService } from "../services/interview";

export default function HistoryPage() {
  useDocumentTitle("History");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<HistoryQuery["difficulty"]>("");
  const [category, setCategory] = useState<HistoryQuery["category"]>("");
  const [sort, setSort] = useState<HistoryQuery["sort"]>("latest");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 300);
  const query: HistoryQuery = { page, limit: 8, search: debounced, difficulty, category, sort };

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["history", query],
    queryFn: () => performanceService.history(query),
    placeholderData: keepPreviousData,
  });

  const filtered = !!debounced || !!difficulty || !!category;
  const reset = () => setPage(1);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader title="History" subtitle="Every finished interview, newest first." />

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <label htmlFor="h-search" className="sr-only">Search by role</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input id="h-search" value={search} onChange={(e) => { setSearch(e.target.value); reset(); }} placeholder="Search by role" className="field-input h-10 py-0 pl-9 text-sm" />
        </div>
        <label className="sr-only" htmlFor="h-diff">Difficulty</label>
        <select id="h-diff" value={difficulty} onChange={(e) => { setDifficulty(e.target.value as HistoryQuery["difficulty"]); reset(); }} className="field-input h-10 w-auto py-0 text-sm">
          <option value="">Any difficulty</option>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
        <label className="sr-only" htmlFor="h-cat">Category</label>
        <select id="h-cat" value={category} onChange={(e) => { setCategory(e.target.value as HistoryQuery["category"]); reset(); }} className="field-input h-10 w-auto py-0 text-sm">
          <option value="">Any category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="sr-only" htmlFor="h-sort">Sort</label>
        <select id="h-sort" value={sort} onChange={(e) => { setSort(e.target.value as HistoryQuery["sort"]); reset(); }} className="field-input h-10 w-auto py-0 text-sm">
          <option value="latest">Newest first</option><option value="oldest">Oldest first</option>
          <option value="highest-score">Highest score</option><option value="lowest-score">Lowest score</option>
        </select>
      </div>

      {isError ? (
        <ErrorNotice message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="space-y-3" aria-busy>{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : data.items.length === 0 ? (
        <div className="card border-dashed">
          <EmptyState icon={<HistoryIcon className="size-5" />} title={filtered ? "No interviews match" : "No finished interviews yet"}
            action={filtered ? <Button variant="secondary" onClick={() => { setSearch(""); setDifficulty(""); setCategory(""); reset(); }}>Clear filters</Button> : <Link to="/interviews" className={buttonClass("primary")}>Start an interview</Link>}>
            {filtered ? "Try different filters." : "Complete a mock interview and it will show up here."}
          </EmptyState>
        </div>
      ) : (
        <ul className={`card divide-y divide-line overflow-hidden transition-opacity ${isFetching ? "opacity-70" : ""}`}>
          {data.items.map((h) => (
            <li key={h.reportId}>
              <Link to={`/reports/${h.sessionId}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-sunken/60 sm:p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{h.role ?? "Interview"}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                    {h.difficulty && <Badge>{h.difficulty}</Badge>}{h.experience && <span>{h.experience}</span>}<span>· {formatDate(h.createdAt)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <span className="text-muted">Readiness <strong className="font-semibold text-ink">{h.interviewReadiness}%</strong></span>
                  <ScoreBadge score={h.overallScore} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-muted">Page {data.page} of {data.totalPages} · {data.total} interviews</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} icon={<ChevronLeft className="size-4" />}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="size-4" /></Button>
          </div>
        </nav>
      )}
    </div>
  );
}
