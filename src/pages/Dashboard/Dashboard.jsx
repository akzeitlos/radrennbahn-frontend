import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import useRaces from "@/hooks/useRaces.jsx";
import useAthletes from "@/hooks/useAthletes.jsx";
import useClubs from "@/hooks/useClubs.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import AthletesIcon from "@/assets/icons/athletes.svg?react";
import RacesIcon from "@/assets/icons/races.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";
import UsersIcon from "@/assets/icons/users.svg?react";
import PlayIcon from "@/assets/icons/play.svg?react";
import EyeIcon from "@/assets/icons/eye.svg?react";

import "./Dashboard.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
};

const StatTile = ({ value, label, Icon, accent }) => (
  <div className="dashboard__tile">
    <div className={`dashboard__tile-icon dashboard__tile-icon--${accent}`}>
      <Icon className="icon" />
    </div>
    <div className="dashboard__tile-body">
      <span className="dashboard__tile-value">{value}</span>
      <span className="dashboard__tile-label">{label}</span>
    </div>
  </div>
);

const RaceRow = ({ race, onClick }) => {
  const ActionIcon = race.isCompleted ? EyeIcon : PlayIcon;
  return (
    <button className="dashboard__race-row" onClick={onClick}>
      <span className="dashboard__race-date">{formatDate(race.date)}</span>
      <div className="dashboard__race-info">
        <span className="dashboard__race-mode">{race.raceMode?.title ?? "—"}</span>
        {race.raceClasses?.length > 0 && (
          <div className="dashboard__race-classes">
            {race.raceClasses.map((rc) => (
              <span key={rc.id} className="dashboard__race-class">{rc.name}</span>
            ))}
          </div>
        )}
      </div>
      <ActionIcon className="dashboard__race-arrow icon" />
    </button>
  );
};

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const { races, isLoading: racesLoading } = useRaces(token);
  const { athletes, isLoading: athletesLoading } = useAthletes(token);
  const { clubs } = useClubs(token);
  const { raceClasses } = useRaceClasses(token);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const upcomingRaces = useMemo(() =>
    races
      .filter((r) => !r.isCompleted && (!r.date || r.date >= today))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6),
    [races, today]
  );

  const recentRaces = useMemo(() =>
    races
      .filter((r) => r.isCompleted)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6),
    [races]
  );

  const completedCount = useMemo(() => races.filter((r) => r.isCompleted).length, [races]);

  if (racesLoading || athletesLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard">

      <div className="dashboard__stats">
        <StatTile value={athletes.length} label="Athleten" Icon={AthletesIcon} accent="blue" />
        <StatTile value={upcomingRaces.length} label="Kommende Rennen" Icon={RacesIcon} accent="green" />
        <StatTile value={completedCount} label="Absolvierte Rennen" Icon={CheckIcon} accent="grey" />
        <StatTile value={clubs.length} label="Vereine" Icon={UsersIcon} accent="red" />
      </div>

      <div className="dashboard__panels">
        <div className="dashboard__panel">
          <h2 className="dashboard__panel-title">Nächste Rennen</h2>
          {upcomingRaces.length === 0
            ? <p className="dashboard__empty">Keine kommenden Rennen geplant.</p>
            : upcomingRaces.map((r) => (
                <RaceRow key={r.id} race={r} onClick={() => navigate(`/races/${r.id}/session`)} />
              ))
          }
        </div>

        <div className="dashboard__panel">
          <h2 className="dashboard__panel-title">Zuletzt abgeschlossen</h2>
          {recentRaces.length === 0
            ? <p className="dashboard__empty">Noch keine Rennen abgeschlossen.</p>
            : recentRaces.map((r) => (
                <RaceRow key={r.id} race={r} onClick={() => navigate(`/races/${r.id}/session`)} />
              ))
          }
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
