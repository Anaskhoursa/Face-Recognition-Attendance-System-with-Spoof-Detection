// src/components/AttendanceModal.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentAttendance, getCourseStudents } from '../api/api';

const AttendanceModal = ({ session, onClose }) => {
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['courseStudents', session.class_id],
    queryFn: () => getCourseStudents({ id: session.class_id }),
    enabled: !!session.class_id,
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const AttendanceItem = ({ studentId }) => {
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', session.id, studentId],
    queryFn: () => getStudentAttendance({ 
      student_id: studentId, 
      session_id: session.id 
    }),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="attendance-item">
        <div className="attendance-header">
          <span className="student-id">{studentId}</span>
          <span className="attendance-status">Loading...</span>
        </div>
      </div>
    );
  }

  const attendanceData = attendance?.message === 'Absent' ? [] : attendance?.message || [];
  const name = attendance.fullName
  const isAbsent = attendanceData.length === 0;

  const calculateTotalTime = (entries) => {
    let totalMinutes = 0;
    
    entries.forEach(entry => {
      if (entry.joined_at && entry.left_at) {
        const joined = new Date(entry.joined_at);
        const left = new Date(entry.left_at);
        const duration = left - joined; 
        const minutes = Math.floor(duration / (1000 * 60));
        totalMinutes += minutes;
      }
    });
    
    return totalMinutes;
  };

  const totalTimeMinutes = calculateTotalTime(attendanceData);
  
  const isPresentByTime = totalTimeMinutes >= 60;
  const displayStatus = isAbsent ? 'Absent' : (isPresentByTime ? 'Present' : 'Absent');

  return (
    <div className="attendance-item">
      <div className="attendance-header">
        <span className="student-id">{studentId} {name.first_name} {name.last_name}</span>
        <div className="attendance-info">
          <span className="total-time">
            {!isAbsent && `${totalTimeMinutes} min`}
          </span>
          <span className={`attendance-status ${displayStatus.toLowerCase()}`}>
            {displayStatus}
          </span>
        </div>
      </div>
      {!isAbsent && (
        <>
          <div className="attendance-summary">
            <div className="summary-row">
              <span className="summary-label">Total Participation:</span>
              <span className="summary-value">{totalTimeMinutes} minutes</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status:</span>
              <span className={`status-badge ${isPresentByTime ? 'present' : 'absent'}`}>
                {isPresentByTime ? 'Present (≥60 min)' : 'Absent (<60 min)'}
              </span>
            </div>
          </div>
          <div className="attendance-times">
            {attendanceData.map((entry, index) => {
              const joined = new Date(entry.joined_at);
              const left = entry.left_at ? new Date(entry.left_at) : null;
              const duration = left ? Math.floor((left - joined) / (1000 * 60)) : null;

              return (
                <div key={index} className="time-entry">
                  <div className="time-dot"></div>
                  <div className="time-group">
                    <span>Joined:</span>
                    <strong>{formatDateTime(entry.joined_at)}</strong>
                  </div>
                  {entry.left_at && (
                    <>
                      <div>→</div>
                      <div className="time-group">
                        <span>Left:</span>
                        <strong>{formatDateTime(entry.left_at)}</strong>
                      </div>
                      {duration !== null && (
                        <div className="duration-badge">
                          {duration} min
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

  const studentsList = students?.message || [];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3>Session Attendance</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              {session.room_name} • {new Date(session.start_time).toLocaleDateString()}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="panel-content">
          {studentsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : studentsList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No Students</h3>
              <p>No students enrolled in this course</p>
            </div>
          ) : (
            <div className="attendance-list">
              {studentsList.map((student) => (
                <AttendanceItem 
                  key={student.student_id} 
                  studentId={student.student_id} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;