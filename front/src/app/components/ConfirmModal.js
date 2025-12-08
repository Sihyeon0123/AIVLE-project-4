// /app/components/ConfirmModal.jsx
'use client';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">{title || '확인'}</h5>
          </div>

          {/* Message */}
          <div className="modal-body">
            {message || '이 작업을 진행하시겠습니까?'}
          </div>

          {/* Buttons */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              취소
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              확인
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
