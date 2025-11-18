import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
    profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Fix: getRoles returns object/number, handle properly
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
  
  return (
    <div className="profile-section">
      <div className="profile-info">
        <div>
          <h2>Welcome, {profile?.name ?? AuthSession.getName() ?? "User"}</h2>
          <p className="profile-email">{profile?.email ?? AuthSession.getEmail() ?? ""}</p>
        </div>
        <span className="profile-role">{getRoleDisplay()}</span>
      </div>
    </div>
  );
};

export default ProfileCard;