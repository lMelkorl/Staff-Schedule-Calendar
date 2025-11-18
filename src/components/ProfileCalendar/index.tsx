/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import ProfileCard from "../Profile";
import CalendarContainer from "../Calendar";

import { useSelector } from "react-redux";
import { getAuthUser } from "../../store/auth/selector";
import { getSchedule } from "../../store/schedule/selector";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchSchedule } from "../../store/schedule/actions";
import { setProfile } from "../../store/auth/actions";

import "../profileCalendar.scss";

const ProfileCalendar = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const auth = useSelector(getAuthUser);
  const schedule = useSelector(getSchedule);

  useEffect(() => {
    dispatch(setProfile() as any);
    dispatch(fetchSchedule() as any);
    
    // Simulate loading for initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="profile-calendar-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-calendar-container">
      <ProfileCard profile={auth} />
      <CalendarContainer schedule={schedule} auth={auth} />
    </div>
  );
};

export default ProfileCalendar;
