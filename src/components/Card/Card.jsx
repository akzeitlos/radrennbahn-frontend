import "./Card.css";
import Delete from "@/assets/icons/delete.svg?react";
import Edit from "@/assets/icons/edit.svg?react";
import Play from "@/assets/icons/play.svg?react";
import Eye from "@/assets/icons/eye.svg?react";

const Card = ({
  title,
  titleSub,
  subtitle,
  children,
  aspectRatio = "",
  onEdit,
  onDelete,
  onPlay,
  isCompleted = false,
  danger = false,
  extraClass = "",
}) => {
  return (
    <div className={`card ${aspectRatio} ${danger ? "card-danger" : ""} ${extraClass}`}>
      <div className="card-header">
        <div>
          <h2>{title}{titleSub && <span className="card__title-sub">{titleSub}</span>}</h2>
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
        {!danger && (onEdit || onDelete || onPlay) && (
          <div className="hover-buttons">
            {onPlay && (
              <button
                className={`play-btn ${isCompleted ? "play-btn--completed" : ""}`}
                onClick={onPlay}
                title={isCompleted ? "Ergebnisse ansehen" : "Rennen starten"}
              >
                {isCompleted
                  ? <Eye className="icon" />
                  : <Play className="icon" />
                }
              </button>
            )}
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