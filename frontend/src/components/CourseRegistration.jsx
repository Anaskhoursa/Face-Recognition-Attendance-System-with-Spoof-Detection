// src/components/CourseRegistration.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailableCourses, courseRegister } from '../api/api';

const CourseRegistration = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available courses (not enrolled yet)
  const { 
    data: availableCourses, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: getAvailableCourses,
  });

  const registerMutation = useMutation({
    mutationFn: ({ courseId }) => courseRegister({ course_id: courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['availableCourses']);
      queryClient.invalidateQueries(['studentCourses']);
      alert('Registration request submitted successfully!');
    },
    onError: (error) => {
      alert(`Failed to submit registration: ${error.message}`);
    },
  });

  // Handle course registration
  const handleRegister = (courseId, courseName) => {
    if (window.confirm(`Request enrollment in ${courseName}?`)) {
      registerMutation.mutate({ courseId });
    }
  };

  // Filter courses based on search term
  const filteredCourses = availableCourses?.message?.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="registration-loading">
        <div className="loading-spinner"></div>
        <p>Loading available courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registration-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Courses</h3>
        <p>{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="course-registration">
      <div className="registration-header">
        <h2>Available Courses</h2>
        <p>Browse and request enrollment in available courses</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Course List */}
      <div className="available-courses">
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Courses Available</h3>
            <p>
              {searchTerm 
                ? `No courses found matching "${searchTerm}"`
                : 'No available courses at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <div className="course-code">{course.code || 'COURSE'}</div>
                  <div className="course-status" style={{backgroundColor:course.status === 'approved' ? 'green' : course.status === 'declined' ? 'red' : course.status === 'pending' ? 'yellow' : 'rgba(255, 255, 255, 0.2)'}}>{course.status || 'Open for Enrollment'}</div>
                </div>
                
                <div className="course-card-body">
                  <h3 className="course-name">{course.name}</h3>
                  
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}
                  
                  {course.teacher_name && (
                    <div className="course-teacher">
                      <strong>Instructor:</strong> {course.teacher_name}
                    </div>
                  )}
                  
                  {course.schedule && (
                    <div className="course-schedule">
                      <strong>Schedule:</strong> 
                      {(() => {
                        try {
                          const schedule = JSON.parse(course.schedule);
                          return Array.isArray(schedule) 
                            ? schedule.map((s, i) => <span key={i} className="schedule-badge">{s}</span>)
                            : <span className="schedule-badge">{schedule}</span>;
                        } catch {
                          return <span className="schedule-badge">{course.schedule}</span>;
                        }
                      })()}
                    </div>
                  )}
                </div>
                
                <div className="course-card-footer" style={{display: course.status ? 'none':''}}>
                  <button
                    onClick={() => handleRegister(course.id, course.name)}
                    disabled={registerMutation.isPending}
                    className="btn-register"
                  >
                    {registerMutation.isPending ? 'Requesting...' : 'Request Enrollment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRegistration;