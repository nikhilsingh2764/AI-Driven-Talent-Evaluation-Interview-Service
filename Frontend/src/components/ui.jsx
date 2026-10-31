import { Children, useEffect, useState } from "react";

export const Spinner = ({ label = "Loading..." }) => (
  <div className="spinner-wrap" role="status">
    <div className="spinner" />
    <span>{label}</span>
  </div>
);

// Renders nothing when there is nothing to show (an array like ["", false] is truthy, so check the real content).
export const Alert = ({ kind = "error", children }) =>
  Children.toArray(children).some((c) => c !== "") ? <div className={`alert alert-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</div> : null;

export const Card = ({ title, actions, children, className = "" }) => (
  <section className={`card ${className}`}>
    {(title || actions) && (
      <div className="card-head">
        {title && <h2>{title}</h2>}
        {actions && <div className="row">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

export const Bar = ({ label, value }) => (
  <div className="bar">
    <div className="bar-label"><span>{label}</span><strong>{value}%</strong></div>
    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
  </div>
);

export const List = ({ items }) =>
  items?.length ? <ul className="list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="muted">None</p>;

export const Tags = ({ items }) =>
  items?.length ? <div className="tags">{items.map((t, i) => <span className="tag" key={i}>{t}</span>)}</div> : <p className="muted">None</p>;

export const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "-");

// Loads data on mount. Returns { data, error, loading, reload, setData }.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1), setData: (data) => setState((s) => ({ ...s, data })) };
}

// Saves a Blob as a file download.
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
