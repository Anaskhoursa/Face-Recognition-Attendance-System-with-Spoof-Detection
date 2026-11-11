import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile, getStudentCourses, getStudentSessions, logout } from '../api/api';
import './studentDashboard.css';
import CourseRegistration from '../components/CourseRegistration';
import Cookies from "js-cookie";

const StudentDashboard = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('courses');
    const user = JSON.parse(Cookies.get('details')?.toString() ?? '');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();





            window.location.href = '/login';

        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };
    const {
        data: courses,
        isLoading: coursesLoading,
        error: coursesError
    } = useQuery({
        queryKey: ['studentCourses'],
        queryFn: getStudentCourses,
    });

    const {
        data: sessions,
        isLoading: sessionsLoading,
        error: sessionsError,
        refetch: refetchSessions
    } = useQuery({
        queryKey: ['studentSessions', selectedCourse],
        queryFn: () => selectedCourse ? getStudentSessions({ course_id: selectedCourse }) : Promise.resolve([]),
        enabled: !!selectedCourse,
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const getSessionStatus = (session) => {
        const now = new Date();
        const startTime = new Date(session.start_time);
        const endTime = session.end_time ? new Date(session.end_time) : null;

        if (endTime) {
            return 'ended';
        } else if (startTime <= now) {
            return 'active';
        } else {
            return 'scheduled';
        }
    };

    const selectedCourseDetails = courses?.message?.find(course => course.course_id === selectedCourse);

    // const handleJoinSession = async (sessionId) => {
    //     try {
    //         const response = await fetch(`/api/sessions/${sessionId}/join-token`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${localStorage.getItem('token')}`
    //             }
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             // Open Jitsi meeting
    //             window.open(`https://${data.jitsi_domain}/${data.room_id}?jwt=${data.token}`, '_blank');
    //         } else {
    //             alert('Unable to join session: ' + data.message);
    //         }
    //     } catch (error) {
    //         console.error('Join session error:', error);
    //         alert('Error joining session');
    //     }
    // };

    if (coursesLoading) {
        return (
            <div className="student-dashboard">
                <div className="dashboard-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your courses...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (coursesError) {
        return (
            <div className="student-dashboard">
                <div className="dashboard-container">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>Error Loading Courses</h3>
                        <p>{coursesError.message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                            style={{ marginTop: '20px' }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="header-main">
                        <div className="header-title">
                            <h1>Student Dashboard</h1>
                            {/* <p>Manage your courses and track student attendance</p> */}
                        </div>

                        <div className="header-stats">
                            <div className="stat-card">
                                <div className="stat-value">{courses?.message?.length || 0}</div>
                                <div className="stat-label">Total Courses</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {sessions?.message?.length || 0}
                                </div>
                                <div className="stat-label">
                                    {selectedCourse ? 'Sessions' : 'Total Sessions'}
                                </div>
                            </div>

                        </div>

                        <div className="user-profile-section">
                            <div className="user-info-dropdown">
                                <div className="user-avatar-trigger">
                                    <div className="student-avatar">
                                        {user.profile_image ? (
                                            <img
                                                src={'https://anas044-attendance-nodejs.hf.space/api' + user.profile_image}
                                                className="profile-image"
                                                alt={user.first_name || 'User'}
                                            />
                                        ) : (
                                            <div className="avatar-initials">
                                                {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-name">
                                        {user.firstName} {user.lastName}
                                        <span className="user-role">{user.role}</span>
                                    </div>
                                    <button className="dropdown-arrow">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="user-dropdown-menu">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {user.profile_image ? (
                                                <img
                                                    src={'https://anas044-attendance-nodejs.hf.space/api' + user.profile_image}
                                                    className="profile-image"
                                                    alt={user.first_name || 'User'}
                                                />
                                            ) : (
                                                <div className="avatar-initials-large">
                                                    {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-user-name">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="dropdown-user-email">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <a href="/profile" className="dropdown-item">
                                        <span className="dropdown-icon">👤</span>
                                        <span>Profile Settings</span>
                                    </a>



                                    <div className="dropdown-divider"></div>

                                    <button
                                        onClick={handleLogoutClick}
                                        className="dropdown-item logout-item"
                                        disabled={isLoggingOut}
                                    >
                                        <span className="dropdown-icon">🚪</span>
                                        <span>
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                {/* <header className="student-header">
                    <div className="student-header-content">
                        <div className="student-info">
                            <div className="student-avatar">
                                {user.profile_image ? (
                                    <img
                                        src={'https://anas044-attendance-nodejs.hf.space/api' + user.profile_image}
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="avatar-initials">
                                        {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="student-name">
                                    {user.firstName + ' ' + user.lastName || 'Student'}
                                </div>
                                <div className="student-id">
                                    Student ID: {user.user_id || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div className="header-stats">
                            <div className="stat-card">
                                <div className="stat-value">{courses?.message?.length || 0}</div>
                                <div className="stat-label">Enrolled Courses</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {sessions?.message?.length || 0}
                                </div>
                                <div className="stat-label">
                                    {selectedCourse ? 'Sessions' : 'Total Sessions'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header> */}

                {showLogoutConfirm && (
                    <div className="logout-modal-overlay">
                        <div className="logout-modal">
                            <div className="logout-modal-header">
                                <h3>Confirm Logout</h3>
                                <button onClick={handleCancelLogout} className="close-modal-btn">
                                    ✕
                                </button>
                            </div>

                            <div className="logout-modal-body">
                                <div className="logout-warning-icon">⚠️</div>
                                <p>Are you sure you want to logout?</p>
                                <p className="logout-warning-text">
                                    You will need to login again to access the dashboard.
                                </p>
                            </div>

                            <div className="logout-modal-actions">
                                <button
                                    onClick={handleCancelLogout}
                                    className="logout-cancel-btn"
                                    disabled={isLoggingOut}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="logout-confirm-btn"
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('courses');
                                setSelectedCourse(null);
                            }}
                        >
                            My Courses
                        </button>
                        <button
                            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Register for Courses
                        </button>
                        {selectedCourse && (
                            <button
                                className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('sessions')}
                            >
                                {selectedCourseDetails?.name || 'Course'} Sessions
                            </button>
                        )}
                    </div>
                </div>

                <main className="dashboard-main">
                    <section className="panel">
                        <div className="panel-header">
                            <h2>My Courses</h2>
                            <div className="header-stats" style={{ gap: '8px' }}>
                                <div className="stat-card" style={{ padding: '8px 12px' }}>
                                    <div className="stat-value">{courses?.message?.length || 0}</div>
                                    <div className="stat-label">Enrolled</div>
                                </div>
                            </div>
                        </div>
                        <div className="panel-content">
                            {courses?.message?.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📚</div>
                                    <h3>No Courses Enrolled</h3>
                                    <p>You are not enrolled in any courses yet</p>
                                </div>
                            ) : (
                                <div className="courses-list">
                                    {courses?.message?.map((course) => (
                                        <div
                                            key={course.course_id}
                                            className={`course-item ${selectedCourse === course.course_id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCourse(course.id);
                                                setActiveTab('sessions');
                                            }}
                                        >
                                            <div className="course-header">
                                                <div className="course-name">{course.name}</div>
                                                <div className="course-actions">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCourse(course.course_id);

                                                            setActiveTab('sessions');
                                                        }}
                                                        className="btn-icon view"
                                                        title="View Sessions"
                                                    >
                                                        👁️
                                                    </button>
                                                </div>
                                            </div>
                                            {course.schedule && (
                                                <div className="course-schedule">
                                                    {(() => {
                                                        try {
                                                            const scheduleArray = Array.isArray(course.schedule)
                                                                ? course.schedule
                                                                : JSON.parse(course.schedule);

                                                            return scheduleArray.map((item, index) => (
                                                                <span key={index} className="schedule-badge">
                                                                    {item}
                                                                </span>
                                                            ));
                                                        } catch (error) {
                                                            return (
                                                                <span className="schedule-badge">
                                                                    {course.schedule}
                                                                </span>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="panel">
                        {activeTab === 'register' ? (
                            <CourseRegistration />
                        ) : !selectedCourse ? (
                            <div className="panel-content">
                                <div className="no-course-selected">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3>Select a Course</h3>
                                    <p>Choose a course from the list to view its sessions</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="panel-header">
                                    <div>
                                        <h2>Sessions for {selectedCourseDetails?.name}</h2>
                                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                            {sessions?.message?.length || 0} sessions available
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => refetchSessions()}
                                        className="btn-secondary"
                                        disabled={sessionsLoading}
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="panel-content">
                                    {sessionsLoading ? (
                                        <div className="loading-container">
                                            <div className="loading-spinner"></div>
                                            <p>Loading sessions...</p>
                                        </div>
                                    ) : sessionsError ? (
                                        <div className="error-container">
                                            <div className="error-icon">⚠️</div>
                                            <h3>Error Loading Sessions</h3>
                                            <p>{sessionsError.message}</p>
                                        </div>
                                    ) : (
                                        <div className="sessions-list">
                                            {sessions?.message === 'no sessions' || sessions?.message?.length === 0 ? (
                                                <div className="empty-state">
                                                    <div className="empty-icon">🎥</div>
                                                    <h3>No Sessions Yet</h3>
                                                    <p>This course doesn't have any scheduled sessions</p>
                                                </div>
                                            ) : (
                                                sessions?.message?.map((session) => {
                                                    const status = session.session_status;
                                                    const isActive = status === 'active';
                                                    const canJoin = isActive || status === 'scheduled';

                                                    return (
                                                        <div key={session.id} className="session-card">
                                                            <div className="session-header">
                                                                <div className="session-room">
                                                                    <span style={{ marginRight: '8px' }}>🎥</span>
                                                                    {session.room_name}
                                                                    <span className={`session-status ${session.session_status}`}>
                                                                        {session.session_status}
                                                                        {isActive && ' • Live'}
                                                                    </span>
                                                                </div>
                                                                {status === 'active' && <button
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

                                                            <div style={{ marginTop: '12px' }}>
                                                                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                                                                    <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                                                                        <strong>Started:</strong> {formatDate(session.start_time)} at {formatTime(session.start_time)}
                                                                    </div>
                                                                    {session.end_time && (
                                                                        <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                                                                            <strong>Ended:</strong> {formatDate(session.end_time)} at {formatTime(session.end_time)}
                                                                        </div>
                                                                    )}
                                                                </div>


                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;