import "./Card.css";
import Delete from "@/assets/icons/delete.svg?react";
import Edit from "@/assets/icons/edit.svg?react";

const Card = ({
  title,
  children,
  aspectRatio = "",
  onEdit,
  onDelete,
  danger = false,
  extraClass = "",
}) => {
  return (
    <div
      className={`card ${aspectRatio} ${
        danger ? "card-danger" : ""
      } ${extraClass}`}
    >
      <div className="card-header">
        <h2>{title}</h2>

        {!danger && (onEdit || onDelete) && (
          <div className="hover-buttons">
            {onEdit && (
              <button className="edit-btn" onClick={onEdit} title="Bearbeiten">
                <Edit className="icon" />
              </button>
            )}
            {onDelete && (
              <button className="delete-btn" onClick={onDelete} title="Löschen">
                <Delete className="icon delete-icon" />
              </button>
            )}
          </div>
        )}
      </div>
      {children && <div className="card-body">{children}</div>}
    </div>
  );
};

export default Card;
