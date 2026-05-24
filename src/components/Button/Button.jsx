import SaveIcon from "@/assets/icons/save.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";
import "./Button.css";

function Button({
  type = "button",
  onClick,
  disabled = false,
  children,
  style = "primary",
  saveState = null,
  fullWidth = false,
  square = false,
  small = false,
}) {
  const classes = (stateStyle) => [
    "button",
    `${stateStyle}-button`,
    fullWidth ? "button-full" : "",
    square ? "button-square" : "",
    small ? "button-small" : "",
  ].filter(Boolean).join(" ");

  if (saveState !== null) {
    const icon =
      saveState === "saved" ? <CheckIcon className="icon" />
      : saveState === "error" ? null
      : <SaveIcon className="icon" />;

    const label =
      saveState === "saving" ? "Speichere …"
      : saveState === "saved" ? "Gespeichert"
      : saveState === "error" ? "Fehler – nochmal?"
      : children;

    const stateStyle =
      saveState === "saved" ? "success"
      : saveState === "error" ? "danger"
      : style;

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || saveState === "saving"}
        className={`${classes(stateStyle)} button-state button-state-${saveState}`}
      >
        {icon} {label}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes(style)}
    >
      {children}
    </button>
  );
}

export default Button;