import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

// ─── helpers ───────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// ─── API calls ─────────────────────────────────────────────────────────────
const api = {
  getSubjects: () => fetch(`${API}/subjects`).then((r) => r.json()),
  addSubject: (name) =>
    fetch(`${API}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  renameSubject: (id, name) =>
    fetch(`${API}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  deleteSubject: (id) =>
    fetch(`${API}/subjects/${id}`, { method: "DELETE" }).then((r) => r.json()),

  getTempTopics: (subjectId) =>
    fetch(`${API}/subjects/${subjectId}/temp_topics`).then((r) => r.json()),
  addTempTopic: (subjectId) =>
    fetch(`${API}/subjects/${subjectId}/temp_topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New topic" }),
    }).then((r) => r.json()),
  editTempTopic: (subjectId, topicId, name) =>
    fetch(`${API}/subjects/${subjectId}/temp_topics/${topicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  deleteTempTopic: (subjectId, topicId) =>
    fetch(`${API}/subjects/${subjectId}/temp_topics/${topicId}`, {
      method: "DELETE",
    }).then((r) => r.json()),

  syncToday: () =>
    fetch(`${API}/sync-today`, { method: "POST" }).then((r) => r.json()),

  getAnalytics: () =>
    fetch(`${API}/analytics/summary`).then((r) => r.json()),

  getHistory: (subjectId) =>
    fetch(`${API}/subject/${subjectId}/history`).then((r) => r.json()),
};

// ─── Sub-components ────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-10 text-slate-400 text-sm tracking-wide">
      {message}
    </div>
  );
}

// ─── HOME TAB ──────────────────────────────────────────────────────────────
function TopicRow({ subject, topic, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(topic.name);

  const save = async () => {
    if (val.trim() && val !== topic.name) {
      await onEdit(topic.id, val.trim());
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 pl-4 pr-2 py-1.5 group">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="flex-1 text-sm bg-blue-50 border border-blue-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
        />
      ) : (
        <span className="flex-1 text-sm text-slate-700">{topic.name}</span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs px-2 py-0.5 rounded border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-500 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(topic.id)}
          className="text-xs px-2 py-0.5 rounded border border-slate-200 hover:border-red-400 hover:text-red-500 text-slate-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function SubjectCard({ subject, topics, onAddTopic, onEditTopic, onDeleteTopic }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="font-semibold text-slate-800 text-sm">{subject.name}</span>
        <button
          onClick={() => onAddTopic(subject.id)}
          className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          + Add topic
        </button>
      </div>
      <div className="divide-y divide-slate-50">
        {topics.length === 0 ? (
          <p className="text-xs text-slate-400 px-4 py-3 italic">No topics logged today.</p>
        ) : (
          topics.map((t) => (
            <TopicRow
              key={t.id}
              subject={subject}
              topic={t}
              onEdit={(tid, name) => onEditTopic(subject.id, tid, name)}
              onDelete={(tid) => onDeleteTopic(subject.id, tid)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function HomeTab() {
  const [subjects, setSubjects] = useState([]);
  const [topicsMap, setTopicsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const subs = await api.getSubjects();
    setSubjects(subs);
    const map = {};
    await Promise.all(
      subs.map(async (s) => {
        const topics = await api.getTempTopics(s.id);
        map[s.id] = topics;
      })
    );
    setTopicsMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddTopic = async (subjectId) => {
    await api.addTempTopic(subjectId);
    const updated = await api.getTempTopics(subjectId);
    setTopicsMap((prev) => ({ ...prev, [subjectId]: updated }));
  };

  const handleEditTopic = async (subjectId, topicId, name) => {
    await api.editTempTopic(subjectId, topicId, name);
    const updated = await api.getTempTopics(subjectId);
    setTopicsMap((prev) => ({ ...prev, [subjectId]: updated }));
  };

  const handleDeleteTopic = async (subjectId, topicId) => {
    await api.deleteTempTopic(subjectId, topicId);
    const updated = await api.getTempTopics(subjectId);
    setTopicsMap((prev) => ({ ...prev, [subjectId]: updated }));
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      await api.syncToday();
      setSyncMsg("Synced successfully!");
      await load();
    } catch {
      setSyncMsg("Sync failed.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 3000);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Today's Study Log</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && (
            <span className="text-xs text-emerald-600 font-medium">{syncMsg}</span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors font-medium"
          >
            <svg
              className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "Syncing…" : "Sync Day"}
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState message="No subjects yet. Add some in Manage Subjects." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              topics={topicsMap[s.id] || []}
              onAddTopic={handleAddTopic}
              onEditTopic={handleEditTopic}
              onDeleteTopic={handleDeleteTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MANAGE SUBJECTS TAB ───────────────────────────────────────────────────
function ManageSubjectsTab() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const subs = await api.getSubjects();
    setSubjects(subs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await api.addSubject(newName.trim());
    setNewName("");
    await load();
  };

  const handleRename = async (id) => {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    await api.renameSubject(id, renameVal.trim());
    setRenamingId(null);
    await load();
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    await api.deleteSubject(id);
    setDeleting(false);
    setDeleteConfirm(null);
    await load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800 mb-5">Manage Subjects</h2>

      {subjects.length === 0 ? (
        <EmptyState message="No subjects yet." />
      ) : (
        <div className="space-y-2 mb-8">
          {subjects.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm"
            >
              <span className="text-xs text-slate-400 w-6 font-mono">{i + 1}.</span>
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => handleRename(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(s.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="flex-1 text-sm bg-blue-50 border border-blue-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-slate-800">{s.name}</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setRenamingId(s.id); setRenameVal(s.name); }}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-500 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => setDeleteConfirm(s.id)}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-200 hover:border-red-400 hover:text-red-500 text-slate-500 transition-colors"
                >
                  Delete !
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Add new subject</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. DBMS"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-300"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors font-medium"
          >
            + Add
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="text-red-500 mb-3">
              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-center font-bold text-slate-800 mb-1">Delete Subject?</h3>
            <p className="text-center text-sm text-slate-500 mb-5">
              This will permanently delete the subject and all its topics, entries, and temp topics.
            </p>
            <div className="flex gap-3">
              {/* <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button> */}
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS TAB ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState message="No analytics data." />;

  const { careerStartDate, totalCareerDays, subjects } = data;
  const maxDays = Math.max(totalCareerDays, ...subjects.map((s) => s.studyDays), 1);

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Consistency Heat-map</h2>
      <p className="text-xs text-slate-400 mb-6">Days studied per subject out of {totalCareerDays} career days</p>

      {subjects.length === 0 ? (
        <EmptyState message="No study data yet." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="relative pl-10">
            {/* Y-axis grid lines */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="text-xs text-slate-300 font-mono text-right w-8 -translate-y-2">
                  {Math.round(maxDays - (maxDays / 5) * i)}
                </span>
              ))}
            </div>

            {/* Grid lines behind bars */}
            <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-t border-slate-100 w-full" />
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-3 h-56 pb-8 relative">
              {subjects.map((s) => {
                const pct = (s.studyDays / maxDays) * 100;
                return (
                  <div key={s.subjectId} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-xs font-bold text-blue-700">{s.studyDays}</span>
                    <div
                      className="w-full rounded-t-lg bg-blue-500 hover:bg-blue-600 transition-colors relative group cursor-default"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    >
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {s.studyDays} / {totalCareerDays} days
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 text-center leading-tight mt-1 max-w-[5rem] truncate" title={s.name}>{s.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Career Start Date</p>
              <p className="text-sm font-semibold text-slate-700">{fmt(careerStartDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Career Days</p>
              <p className="text-sm font-semibold text-slate-700">{totalCareerDays}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY TAB ───────────────────────────────────────────────────────────
function HistoryModal({ subjectId, subjectName, onClose }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory(subjectId).then((d) => {
      setTopics(d.topics || []);
      setLoading(false);
    });
  }, [subjectId]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800">{subjectName}</h3>
            <p className="text-xs text-slate-400">Topic history</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <Spinner />
          ) : topics.length === 0 ? (
            <EmptyState message="No topic history yet." />
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-blue-600 text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">S.No.</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Topic Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">First Studied</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Last Studied</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topics.map((t, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(t.firstStudiedAt)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(t.lastStudiedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {t.frequency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryTab() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.getSubjects().then((s) => { setSubjects(s); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800 mb-1">History</h2>
      <p className="text-xs text-slate-400 mb-5">Click "More info" to see topic-level history for a subject.</p>

      {subjects.length === 0 ? (
        <EmptyState message="No subjects yet." />
      ) : (
        <div className="space-y-2">
          {subjects.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm"
            >
              <span className="text-xs text-slate-400 font-mono w-6">{i + 1}.</span>
              <span className="flex-1 text-sm font-medium text-slate-800">{s.name}</span>
              <button
                onClick={() => setSelected(s)}
                className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
              >
                More info
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <HistoryModal
          subjectId={selected.id}
          subjectName={selected.name}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home", label: "Home" },
  { id: "manage", label: "Manage Subjects" },
  { id: "analytics", label: "Analytics" },
  { id: "history", label: "History" },
];

// ─── ROOT ──────────────────────────────────────────────────────────────────
export default function StudyTracker() {
  const [tab, setTab] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center">
            <div className="flex items-center gap-2 py-4 pr-8 border-r border-slate-100 mr-6">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-800 tracking-tight hidden sm:block">Study Tracker</span>
            </div>

            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab === t.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "home" && <HomeTab />}
        {tab === "manage" && <ManageSubjectsTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "history" && <HistoryTab />}
      </main>
    </div>
  );
}
