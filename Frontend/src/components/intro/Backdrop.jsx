// components/intro/Backdrop.jsx
import React from "react";

export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="mx-auto max-w-7xl h-80 blur-3xl opacity-25 dark:opacity-20"
        style={{
          background:
            "radial-gradient(600px circle at 20% 20%, hsl(var(--accent)/0.25), transparent 60%), radial-gradient(700px circle at 80% 0%, hsl(var(--primary)/0.18), transparent 65%)",
        }}
      />
    </div>
  );
}
