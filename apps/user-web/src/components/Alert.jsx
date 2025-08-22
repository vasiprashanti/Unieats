import React from "react";

export default function Alert({ type = "error", message }) {
  if (!message) return null;
  const base = "w-full text-sm rounded-lg px-4 py-3 mb-3";
  const styles =
    type === "error"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-green-50 text-green-700 border border-green-200";
  return <div className={`${base} ${styles}`}>{message}</div>;
}