import './AuthLayout.css'; // Use the CSS you already created for centering

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
        {children}
    </div>
  );
};

export default AuthLayout;
