import "./Modal.css";
import Button from "@/components/Button/Button.jsx";

const Modal = ({ title, message, onConfirm, onCancel, confirmLabel = "Bestätigen", cancelLabel = "Abbrechen", danger = false }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="modal__title">{title}</h2>}
        {message && <p className="modal__message">{message}</p>}
        <div className="modal__actions">
          <Button style="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button style={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;