import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/**
 * FaqEditor
 * - CRUD UI for FAQs and Policies
 * - Uses React Quill for rich text editing
 *
 * Props:
 * - api: { listFaqs, createFaq, updateFaq, deleteFaq }
 */
export default function FaqEditor({ api }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New/Edit form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML string
  const [type, setType] = useState("faq"); // faq | policy

  // Quill config
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  }), []);
  const quillFormats = useMemo(() => (
    [
      "header",
      "bold", "italic", "underline", "strike",
      "list", "bullet",
      "link",
    ]
  ), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listFaqs();
        if (mounted) setItems(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load content");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setType("faq");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        const updated = await api.updateFaq(editingId, { title, content, type });
        setItems((prev) => prev.map((i) => (i.id === editingId || i._id === editingId ? updated : i)));
      } else {
        const created = await api.createFaq({ title, content, type });
        setItems((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    setError("");
    try {
      await api.deleteFaq(id);
      setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(item) {
    setEditingId(item.id || item._id);
    setTitle(item.title || "");
    setContent(item.content || "");
    setType(item.type || "faq");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">FAQs & Policies</h2>
        <p className="text-sm text-muted">Create and manage informational content.</p>
      </div>

      {/* Editor */}
      <form className="rounded-lg border border-base p-4 space-y-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Title</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Type</label>
            <select
              className="form-select mt-1"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="faq">FAQ</option>
              <option value="policy">Policy</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm">Content</label>
          <div className="mt-1">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {/* List */}
      <div className="space-y-2">
        {loading && !items.length ? (
          <p className="text-sm text-muted">Loading content...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">No content yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id || i._id} className="rounded-lg border border-base p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{i.title}</p>
                    <p className="text-xs text-muted">{(i.type || "faq").toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm hover:underline" onClick={() => onEdit(i)} disabled={loading}>
                      Edit
                    </button>
                    <button className="text-sm text-red-600 hover:underline" onClick={() => onDelete(i.id || i._id)} disabled={loading}>
                      Delete
                    </button>
                  </div>
                </div>
                {i.content && (
                  <div className="mt-2 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: i.content }} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}