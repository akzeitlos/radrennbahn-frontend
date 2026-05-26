import Card from "@/components/Card/Card.jsx";
import Button from "@/components/Button/Button.jsx";

const DeleteCard = ({ item, title, onConfirm, onCancel }) => {
  const itemName =
    title === "Nutzer" ? `${item.firstname} ${item.lastname}` : item.name;

  return (
    <Card title={`${title} löschen`} danger>
      <p>
        Möchtest du den {title} <strong>{itemName}</strong> wirklich löschen?
      </p>
      <div className="card__actions">
        <Button style="danger" onClick={() => onConfirm(item.id)}>
          Löschen
        </Button>
        <Button style="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </Card>
  );
};

export default DeleteCard;
