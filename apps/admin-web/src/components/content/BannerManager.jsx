import React, { useEffect, useMemo, useState } from "react";

/**
 * BannerManager
 * - Upload new banners with preview
 * - List banners with drag-and-drop reordering
 * - Image-only display style
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
  const [imageErrors, setImageErrors] = useState({});

  // Fetch banners
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.listBanners();
        const data = Array.isArray(response.data) ? response.data : [];
        console.log("Banners loaded:", data);
        console.log("First banner structure:", data[0]);
        if (mounted) setBanners(data);
      } catch (e) {
        console.error("Failed to fetch banners:", e);
        if (mounted) setError(e?.message || "Failed to load banners");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  // Get image URL from various possible paths
  function getImageUrl(banner) {
    return banner.image?.url || null;
  }

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
      const imageUrl =  newBanner.image?.url || preview;
      console.log("Uploaded banner:", newBanner);
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
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // Drag-and-drop handlers
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
      const orderedIds = reordered.map((b) => b._id);
      await api.reorderBanners(orderedIds);
    } catch (e) {
      setError(e?.message || "Reorder failed");
    }
  }

  function handleImageError(bannerId, url) {
    console.error(`Failed to load image for banner ${bannerId}:`, url);
    setImageErrors(prev => ({ ...prev, [bannerId]: true }));
  }

  const isUploading = useMemo(() => loading && !!file, [loading, file]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Promotional Banners</h2>
        <p className="text-sm text-neutral-500">Upload and reorder homepage banners.</p>
      </div>

      {/* Upload section */}
      <div className="flex items-center gap-3">
        <label className="px-3 py-1 rounded bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
          Browse…
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>

        <span className="text-sm text-neutral-500">
          {file ? file.name : "No file selected"}
        </span>

        <button
          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          onClick={onUpload}
          disabled={isUploading}
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

      {/* Preview selected file */}
      {preview && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <img src={preview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded" />
        </div>
      )}

      {/* Image Grid with Delete on Hover */}
      <div className="space-y-2">
        {loading && !banners.length ? (
          <p className="text-sm text-neutral-500">Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-neutral-500">No banners yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {banners.map((b, index) => {
    const imageUrl = getImageUrl(b);
    const hasError = imageErrors[b._id];

    return (
      <div
        key={b._id}
        className="relative group rounded-lg overflow-hidden border border-neutral-200 cursor-move bg-neutral-100"
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
      >
        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={b.title || "banner"}
            className="w-full h-48 object-cover rounded"
            onError={() => handleImageError(b._id, imageUrl(b))}
          />
        ) : (
          <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        )}

        {/* Overlay on hover with delete button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <button
            className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-opacity"
            onClick={() => onDelete(b._id)}
            disabled={loading}
          >
            Delete
          </button>
        </div>

        {/* Drag handle indicator */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
          ⋮⋮ Drag to reorder
        </div>
      </div>
    );
  })}
</div>

        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {/* Debug info */}
      {banners.length > 0 && (
        <details className="text-xs text-neutral-500 border border-neutral-200 rounded p-2">
          <summary className="cursor-pointer font-medium">Debug Info (click to expand)</summary>
          <pre className="mt-2 overflow-auto">{JSON.stringify(banners, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
