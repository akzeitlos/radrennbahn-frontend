import Button from "@/components/Button/Button.jsx";

const FormActions = ({ onCancel, error, submitLabel = "Speichern", cancelLabel = "Abbrechen" }) => (
  <>
    <div className="button-wrapper">
      <Button type="submit" style="primary">{submitLabel}</Button>
      {onCancel && (
        <Button type="button" style="secondary" onClick={onCancel}>{cancelLabel}</Button>
      )}
    </div>
    {error && <p className="error-message">{error}</p>}
  </>
);

export default FormActions;
