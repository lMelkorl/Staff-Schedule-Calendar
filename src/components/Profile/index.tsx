import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
    profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const getRoleDisplay = () => {
    if (profile?.role?.name) {
      return profile.role.name;
    }
    const storedRole = AuthSession.getRoles();
    if (typeof storedRole === 'object' && storedRole !== null) {
      return (storedRole as any).name || 'Admin';
    }
    return typeof storedRole === 'string' ? storedRole : 'Admin';
  };

  const handleLogout = () => {
    AuthSession.remove();
    window.location.href = '/';
  };
  
  return (
    <div className="profile-section">
      <div className="profile-info">
        <div>
          <h2>Welcome, {profile?.name ?? AuthSession.getName() ?? "User"}</h2>
          <p className="profile-email">{profile?.email ?? AuthSession.getEmail() ?? ""}</p>
        </div>
        <div className="profile-actions">
          <span className="profile-role">{getRoleDisplay()}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;