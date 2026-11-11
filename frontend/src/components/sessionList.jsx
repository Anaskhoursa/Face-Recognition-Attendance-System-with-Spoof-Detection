// src/components/SessionList.jsx
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSession, endSession, getSessions, startSession } from '../api/api';
import { useState } from 'react';

const SessionList = ({ courseId, onViewAttendance }) => {

  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['sessions', courseId],
    queryFn: () => getSessions({ course_id: courseId }),
    enabled: !!courseId,
  });


  const startSessionMutation = useMutation({
    mutationFn: ({ sessionId }) => startSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', courseId] });
    },
    onError: (error) => {
      alert(`Failed to start session: ${error.message}`);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ sessionId }) => endSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', courseId] });
    },
    onError: (error) => {
      alert(`Failed to start session: ${error.message}`);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: ({ sessionId }) => deleteSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', courseId] });
    },
    onError: (error) => {
      alert(`Failed to start session: ${error.message}`);
    },
  });

  const handleStartSession = (sessionId) => {
    if (window.confirm('Are you sure you want to start this session?')) {
      startSessionMutation.mutate({ sessionId });
    }
  };

  const handleEndSession = (sessionId) => {
    if (window.confirm('Are you sure you want to end this session?')) {
      endSessionMutation.mutate({ sessionId });
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSessionMutation.mutate({ sessionId });
    }
  };


  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    if (end) {
      return 'ended';
    } else if (start <= now) {
      return 'active';
    } else {
      return 'scheduled';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Sessions</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const sessionsData = sessions?.message === 'no sessions' ? [] : sessions?.message || [];

  if (sessionsData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎥</div>
        <h3>No Sessions Yet</h3>
        <p>No online sessions have been created for this course</p>
      </div>
    );
  }

  return (
    <div className="sessions-list">
      {sessionsData.map((session) => {
        const status = getSessionStatus(session.start_time, session.end_time);

        return (
          <div key={session.id} className="session-item">
            <div className="session-header">
              <div className="session-room">
                🎥 {session.room_name}
                <span className={`session-status ${session.session_status}`}>
                  {session.session_status}
                </span>
              </div>
              <button
                onClick={() => onViewAttendance(session)}
                className="btn-info"
              >
                View Attendance
              </button>
              {session.session_status !== 'active' && <button
                onClick={() => handleDeleteSession(session.id)}
                className={`btn-info`}
                style={{ background: 'linear-gradient(135deg, var(--info), #e31a35ff)' }}
              >

                Delete Session
              </button>}
              {session.session_status !== 'active' && <button
                onClick={() => handleStartSession(session.id)}
                disabled={startSessionMutation.isPending}
                className={`btn-info`}
                style={{ background: 'linear-gradient(135deg, var(--info), #1ae36b)' }}
              >
                {startSessionMutation.isPending ? 'Starting...' : 'Start Session'}
              </button>}
              {session.session_status === 'active' && <button
                onClick={() => handleEndSession(session.id)}
                disabled={endSessionMutation.isPending}
                className={`btn-info`}
                style={{ background: 'linear-gradient(135deg, var(--info), #1ae36b)' }}
              >
                {startSessionMutation.isPending ? 'Ending...' : 'End Session'}
              </button>}
              {session.session_status === 'active' && <button
                className={`btn-info`}
                style={{ background: 'linear-gradient(135deg, var(--info), #e31a35ff)' }}
              >
                <a
                  href={`/meeting/${session.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white' }}
                >
                  Join Meeting
                </a>
              </button>}


            </div>
            <div className="session-time">
              <div>
                <strong>Started:</strong> {formatDateTime(session.start_time)}
              </div>
              {session.end_time && (
                <div>
                  <strong>Ended:</strong> {formatDateTime(session.end_time)}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default SessionList;