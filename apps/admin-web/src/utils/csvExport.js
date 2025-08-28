// Simple CSV export utility
// data: array of objects; filename: string; headers (optional): array of { key, label }
export function exportToCSV({ data = [], filename = 'report.csv', headers } = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    // Still create an empty CSV with headers if provided
    const csv = (headers ? headers.map(h => escapeCsv(h.label ?? h.key)).join(',') : '') + '\n';
    triggerDownload(csv, filename);
    return;
  }

  const cols = headers && headers.length
    ? headers
    : Object.keys(data[0]).map(k => ({ key: k, label: k }));

  const lines = [];
  // Header line
  lines.push(cols.map(c => escapeCsv(c.label)).join(','));
  // Rows
  for (const row of data) {
    lines.push(cols.map(c => escapeCsv(valueFor(row, c.key))).join(','));
  }

  const csv = lines.join('\n');
  triggerDownload(csv, filename);
}

function valueFor(obj, key) {
  const val = obj?.[key];
  if (val == null) return '';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.join('; ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function escapeCsv(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function triggerDownload(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}