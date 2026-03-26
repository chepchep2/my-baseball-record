import React from "react";

export default function EntryProgress({ step, total = 4 }) {
  return (
    <div className="entry-progress" aria-label={`현재 ${step} / ${total} 단계`}>
      <div
        className="entry-progress-bars"
        aria-hidden="true"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={index < step ? "entry-progress-bar is-active" : "entry-progress-bar"}
          />
        ))}
      </div>
      <span className="entry-progress-text">{step} / {total}</span>
    </div>
  );
}
