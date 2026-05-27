import { useContext, useEffect, useState } from "react";
import Card from "@/components/Card/Card.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import ProfileForm from "@/components/Forms/ProfileForm.jsx";
import useUsers from "@/hooks/useUsers.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";

const Profile = () => {
  const { token, user, fetchUser } = useContext(AuthContext);

  const { updateUser, error, isLoading } = useUsers(token, { autoFetch: false });

  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        username: user.username || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        password: "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      username: formData.username,
      firstname: formData.firstname,
      lastname: formData.lastname,
    };

    if (formData.password.trim() !== "") {
      payload.password = formData.password;
    }

    const result = await updateUser(user.id, payload);

    if (result.success) {
      await fetchUser(token);

      setIsSuccess(true);

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));

      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }
  };

  return (
    <>
      <h1>Mein Profil</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          <Card title="Profildaten" extraClass="card-edit">
            <ProfileForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              error={error}
              isSuccess={isSuccess}
            />
          </Card>
        </div>
      )}
    </>
  );
};

export default Profile;