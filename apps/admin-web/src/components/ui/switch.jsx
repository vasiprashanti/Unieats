import React from 'react';

// Accessible pill switch with smooth animation and focus ring
export function Switch({ id, checked, onCheckedChange, disabled }) {
  return (
    <label htmlFor={id} className={`inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div
        className="relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
                   bg-neutral-300 dark:bg-neutral-700
                   peer-checked:bg-orange-500
                   peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange-500
                   after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow
                   after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
      />
    </label>
  );
}