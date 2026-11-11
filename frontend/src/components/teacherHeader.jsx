// src/components/Header.jsx
import React, { useState } from 'react';
import { logout } from '../api/api';

const Header = ({ user, totalCourses, totalStudents, selectedCourseName }) => {
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

  return (
    <>
      <header className="dashboard-header">
        <div className="header-main">
          <div className="header-title">
            <h1>Teacher Dashboard</h1>
            <p>Manage your courses and track student attendance</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{totalCourses}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalStudents}</div>
              <div className="stat-label">Selected Students</div>
            </div>
            {selectedCourseName && (
              <div className="stat-card">
                <div className="stat-value">📚</div>
                <div className="stat-label">{selectedCourseName}</div>
              </div>
            )}
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
                  {user.first_name} {user.last_name}
                  <span className="user-role">{user.role}</span>
                </div>
                <button className="dropdown-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    </>
  );
};

export default Header;