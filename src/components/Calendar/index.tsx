/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updateAssignment } from "../../store/schedule/actions";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const dispatch = useDispatch();
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null | undefined>(undefined);
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const getStaffColor = (staffId: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
      '#EF476F', '#06D6A0', '#118AB2', '#FF8C42', '#8E44AD',
      '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
    ];
    const index = schedule?.staffs?.findIndex((s) => s.id === staffId) || 0;
    return colors[index % colors.length];
  };

  const getShiftColor = (shiftId: string) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
    const index = schedule?.shifts?.findIndex((s) => s.id === shiftId) || 0;
    return colors[index % colors.length];
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    if (!schedule) return;

    const works: EventInput[] = [];

    const filteredAssignments = selectedStaffId 
      ? schedule.assignments?.filter((assign) => assign.staffId === selectedStaffId) || []
      : schedule.assignments || [];

    for (let i = 0; i < filteredAssignments.length; i++) {
      const assignmentDate = dayjs
        .utc(filteredAssignments[i]?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const assignment = filteredAssignments[i];
      const shift = getShiftById(assignment.shiftId);
      const staff = getStaffById(assignment.staffId);
      
      const shiftEmoji = shift?.name === 'Morning' ? '☀️' : shift?.name === 'Night' ? '🌙' : '⏰';
      const shiftWithEmoji = `${shiftEmoji} ${shift?.name || 'Unknown'}`;
      
      const work = {
        id: assignment.id,
        title: selectedStaffId ? shiftWithEmoji : `${staff?.name} - ${shiftWithEmoji}`,
        duration: "01:00",
        date: assignmentDate,
        staffId: assignment.staffId,
        shiftId: assignment.shiftId,
        backgroundColor: selectedStaffId ? getShiftColor(assignment.shiftId) : getStaffColor(assignment.staffId),
        borderColor: getStaffColor(assignment.staffId),
        extendedProps: {
          staffName: staff?.name,
          shiftName: shift?.name,
          shiftStart: assignment.shiftStart,
          shiftEnd: assignment.shiftEnd,
          isUpdated: getAssigmentById(assignment.id)?.isUpdated,
        },
        className: `event ${
          getAssigmentById(assignment.id)?.isUpdated ? "highlight" : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setEvents(works);
  };

  useEffect(() => {
    if (schedule?.staffs?.[0]?.id && selectedStaffId === undefined) {
      // Set to null (All Staff) on initial load
      setSelectedStaffId(null);
    }
  }, [schedule]);

  useEffect(() => {
    if (selectedStaffId !== undefined && schedule) {
      generateStaffBasedCalendar();
    }
  }, [selectedStaffId, schedule]);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div className="event-content">
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const totalStaff = schedule?.staffs?.length || 0;
  const totalAssignments = schedule?.assignments?.length || 0;
  const activeStaff = schedule?.staffs?.filter((s: any) => 
    schedule?.assignments?.some((a: any) => a.staffId === s.id)
  ).length || 0;
  
  const currentMonthEvents = events.filter((event: any) => {
    if (!event.date) return false;
    const eventDate = dayjs(event.date);
    const currentMonthYear = dayjs(currentMonth).format('YYYY-MM');
    const eventMonthYear = eventDate.format('YYYY-MM');
    return currentMonthYear === eventMonthYear;
  }).length;

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <h2>Staff Schedule Calendar</h2>
      </div>
      
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalStaff}</div>
            <div className="stat-label">Total Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{activeStaff}</div>
            <div className="stat-label">Active Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{totalAssignments}</div>
            <div className="stat-label">Total Assignments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{currentMonthEvents}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <div className="staff-section">
          <div className="staff-search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={staffSearchQuery}
              onChange={(e) => setStaffSearchQuery(e.target.value)}
            />
          </div>
          <div className="staff-list">
            <div
              onClick={() => setSelectedStaffId(null)}
              className={`staff ${selectedStaffId === null ? "active" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16px"
                viewBox="0 -960 960 960"
                width="16px"
              >
                <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
              </svg>
              <span>All Staff</span>
            </div>
            
            {schedule?.staffs
              ?.filter((staff: any) => 
                staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase())
              )
              .map((staff: any) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`staff ${
                  staff.id === selectedStaffId ? "active" : ""
                }`}
              >
                <span 
                  className="staff-color-dot"
                  style={{ backgroundColor: getStaffColor(staff.id) }}
                />
                <span>{staff.name}</span>
              </div>
            ))}
          </div>
        </div>
        <FullCalendar
          ref={calendarRef}
          locale={auth.language}
          plugins={getPlugins()}
          height="auto"
          contentHeight="auto"
          handleWindowResize={true}
          selectable={true}
          editable={true}
          eventOverlap={true}
          eventDurationEditable={false}
          initialView="dayGridMonth"
          initialDate={initialDate}
          events={events}
          firstDay={1}
          dayMaxEventRows={2}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          expandRows={false}
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          eventClick={handleEventClick}
          eventDrop={(info: any) => {
            const newDate = dayjs(info.event.start).format("YYYY-MM-DD");
            dispatch(updateAssignment({
              id: info.event.id,
              newDate: newDate,
              staffId: selectedStaffId
            }) as any);
          }}
          datesSet={(dateInfo: any) => {
            if (dateInfo.view && dateInfo.view.currentStart) {
              setCurrentMonth(new Date(dateInfo.view.currentStart));
            } else if (dateInfo.start) {
              setCurrentMonth(new Date(dateInfo.start));
            }
            
            const currentDate = calendarRef?.current?.getApi().getDate();
            if (currentDate && schedule?.scheduleStartDate) {
              if (!dayjs(schedule.scheduleStartDate).isSame(currentDate)) {
                setInitialDate(currentDate);
              }
            }
          }}
          dayCellContent={({ date }) => {
            const found = validDates().includes(
              dayjs(date).format("YYYY-MM-DD")
            );
            const isHighlighted = highlightedDates.includes(
              dayjs(date).format("DD-MM-YYYY")
            );
            
            const selectedStaff = schedule?.staffs?.find(s => s.id === selectedStaffId);
            const pairForDate = selectedStaff?.pairList?.find((pair: any) => {
              const pairDates = getDatesBetween(pair.startDate, pair.endDate);
              return pairDates.includes(dayjs(date).format("DD-MM-YYYY"));
            });

            const hasStaffEvent = selectedStaffId && events.some(event => 
              event.date && dayjs(event.date as string).isSame(dayjs(date), 'day')
            );

            const staffColor = selectedStaffId ? getStaffColor(selectedStaffId) : null;

            return (
              <div
                className={`${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } ${pairForDate ? "" : ""} ${hasStaffEvent ? "has-staff-event" : ""}`}
                style={{
                  ...(pairForDate && {
                    borderBottomColor: getStaffColor(pairForDate.staffId)
                  }),
                  ...(hasStaffEvent && staffColor && {
                    borderTop: `3px solid ${staffColor}`,
                    fontWeight: 600
                  })
                }}
              >
                {dayjs(date).date()}
              </div>
            );
          }}
        />
      </div>

      {/* Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div 
              className="modal-header"
              style={{ 
                background: selectedEvent.backgroundColor || '#3498db',
                borderLeft: `6px solid ${selectedEvent.backgroundColor || '#3498db'}`
              }}
            >
              <div className="modal-header-content">
                <div className="modal-shift-badge">
                  {selectedEvent.extendedProps?.shiftName === 'Morning' ? '☀️ Morning' : 
                   selectedEvent.extendedProps?.shiftName === 'Night' ? '🌙 Night' : 
                   '⏰ ' + (selectedEvent.extendedProps?.shiftName || 'Shift')}
                </div>
                <h3>{selectedEvent.extendedProps?.staffName || 'Staff Member'}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <div className="modal-icon">📅</div>
                <div className="modal-info">
                  <span className="modal-label">Date</span>
                  <span className="modal-value">
                    {dayjs(selectedEvent.start).format('DD MMMM YYYY')}
                  </span>
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-icon">🕐</div>
                <div className="modal-info">
                  <span className="modal-label">Time</span>
                  <span className="modal-value">
                    {dayjs(selectedEvent.extendedProps?.shiftStart).format('HH:mm')} - {dayjs(selectedEvent.extendedProps?.shiftEnd).format('HH:mm')}
                  </span>
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-icon">⏱</div>
                <div className="modal-info">
                  <span className="modal-label">Duration</span>
                  <span className="modal-value">
                    {(() => {
                      const start = dayjs(selectedEvent.extendedProps?.shiftStart);
                      const end = dayjs(selectedEvent.extendedProps?.shiftEnd);
                      const hours = end.diff(start, 'hour', true);
                      return `${hours.toFixed(1)} hours`;
                    })()}
                  </span>
                </div>
              </div>
              {selectedEvent.extendedProps?.isUpdated && (
                <div className="modal-updated-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  <span>This event has been updated</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarContainer;
