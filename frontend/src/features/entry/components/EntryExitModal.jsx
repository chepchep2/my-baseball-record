import React from "react";

export default function EntryExitModal({ open, onContinue, onExit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="entry-exit-modal-backdrop">
      <div className="entry-exit-modal" role="dialog" aria-modal="true" aria-label="기록 입력 중단 확인">
        <strong>기록 입력을 중단할까요?</strong>
        <p>지금까지 입력한 내용은 저장되지 않습니다.</p>
        <div className="entry-exit-modal-actions">
          <button type="button" onClick={onContinue}>계속 입력</button>
          <button type="button" onClick={onExit}>나가기</button>
        </div>
      </div>
    </div>
  );
}
