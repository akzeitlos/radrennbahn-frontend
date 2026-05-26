import "./FormModal.css";

const FormModal = ({ onClose, maxWidth = "540px", children }) => (
  <div className="form-modal" onClick={onClose}>
    <div
      className="form-modal__content"
      style={{ maxWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default FormModal;
