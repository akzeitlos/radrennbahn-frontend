import "./AddCard.css";
import Add from "@/assets/icons/add.svg?react";


function AddCard({ onClick, aspectRatio }) {
  return (
    <button
      className={`card add-card ${aspectRatio}`}
      onClick={onClick}
      aria-label="Neue Karte hinzufügen"
    >
      <span><Add className="icon" /></span>
    </button>
  );
}

export default AddCard;
