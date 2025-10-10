import React, { useEffect, useMemo, useState } from "react";

/**
 * BannerManager
 * - Upload new banners with preview
 * - List banners with drag-and-drop reordering
 *
 * Props:
 * - api: { listBanners, uploadBanner, reorderBanners, deleteBanner }
 */
export default function BannerManager({ api }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch banners
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listBanners();
        if (mounted) setBanners(Array.isArray(data) ? data : data?.banners || []);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load banners");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  // Handle file select + preview
  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview("");
    }
  }

  async function onUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const newBanner = await api.uploadBanner(file);
      setBanners((prev) => [...prev, newBanner]);
      setFile(null);
      setPreview("");
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this banner?")) return;
    setLoading(true);
    setError("");
    try {
      await api.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id && b._id !== id));
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // DnD helpers
  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(overIndex) {
    if (dragIndex === null || dragIndex === overIndex) return;
    const reordered = [...banners];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setBanners(reordered);
    setDragIndex(null);

    // Persist order
    try {
      const orderedIds = reordered.map((b) => b.id || b._id);
      await api.reorderBanners(orderedIds);
    } catch (e) {
      setError(e?.message || "Reorder failed");
    }
  }

  const isUploading = useMemo(() => loading && !!file, [loading, file]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Promotional Banners</h2>
        <p className="text-sm text-muted">Upload and reorder homepage banners.</p>
      </div>

      {/* Upload section */}
     <div className="flex items-center gap-3">
  {/* Label acts as the button */}
  <label className="px-3 py-1 rounded bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
    Browse…
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      className="hidden"
    />
  </label>

  <span className="text-sm text-muted">
    {file ? file.name : "No file selected"}
  </span>

  <button
    className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
    onClick={onUpload}
  >
     Upload
  </button>

  {!!file && (
    <button
      type="button"
      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
      onClick={() => {
        setFile(null);
        setPreview("");
      }}
    >
      Clear
    </button>
  )}
</div>


      {/* List + DnD */}
      <div className="space-y-2">
        {loading && !banners.length ? (
          <p className="text-sm text-muted">Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-muted">No banners yet.</p>
        ) : (
          <ul className="space-y-2">
            {banners.map((b, index) => (
              <li
                key={b.id || b._id}
                className="flex items-center justify-between rounded-lg border border-base p-3 bg-white/50 dark:bg-neutral-900"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="cursor-move select-none text-neutral-400">⋮⋮</span>
                  <img src={b.url} alt={b.alt || "banner"} className="h-12 w-24 object-cover rounded" />
                  <div>
                    <p className="text-sm font-medium">{b.title || b.alt || (b.id || b._id)}</p>
                    <p className="text-xs text-muted">{b.url}</p>
                  </div>
                </div>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => onDelete(b.id || b._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}