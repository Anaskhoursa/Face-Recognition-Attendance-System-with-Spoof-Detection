// src/pages/TeacherDashboard.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/teacherHeader';
import CourseList from '../components/courseList';
import StudentList from '../components/studentList';
import SessionList from '../components/sessionList';
import CourseForm from '../components/courseForm';
import AddStudentModal from '../components/addStudentModal';
import { getCourses, getCourseStudents } from '../api/api';
import './teacherDashboard.css';
import AttendanceModal from '../components/attedanceModal';
import CreateSession from '../components/createSession';
import CourseRegistrationRequests from '../components/CourseRegistrationRequests';
import Cookies from "js-cookie";
import FaceChangeRequests from '../components/faceChangeRequests';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const user = JSON.parse(Cookies.get('details')?.toString() ?? '');

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError
  } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError
  } = useQuery({
    queryKey: ['courseStudents', selectedCourse],
    queryFn: () => selectedCourse ? getCourseStudents({ id: selectedCourse }) : Promise.resolve([]),
    enabled: !!selectedCourse && activeTab === 'students',
  });

  const selectedCourseDetails = courses?.message?.find(course => course.id === selectedCourse);

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSession(null);
  };

  const handleCourseEdit = (courseId) => {
    setEditingCourse(courseId);
    setShowCourseForm(true);
  };

  const handleViewAttendance = (session) => {
    setSelectedSession(session);
  };

  if (coursesLoading) {
    return (
      <div className="teacher-dashboard">
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
      <div className="teacher-dashboard">
        <div className="dashboard-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Courses</h3>
            <p>{coursesError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        <Header
        user={user}
          totalCourses={courses?.message?.length || 0}
          totalStudents={students?.message?.length || 0}
          selectedCourseName={selectedCourseDetails?.name}
        />

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
            <button
              className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
            <button
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Face Change Requests
            </button>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Left Panel - Courses */}
          <section className="panel">
            <div className="panel-header">
              <h2>My Courses</h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowCourseForm(true);
                }}
                className="btn-primary"
              >
                <span>+</span>
                New Course
              </button>
            </div>
            <div className="panel-content">
              <CourseList
                courses={courses?.message || []}
                selectedCourse={selectedCourse}
                onSelectCourse={handleCourseSelect}
                onEditCourse={handleCourseEdit}
              />
            </div>
          </section>

          {/* Right Panel - Content based on active tab */}
          <section className="panel">
            {selectedCourse ? (
              <>
                <div className="panel-header">
                  <div>
                    <h2>
                      {activeTab === 'students' ? 'Students' : 'Sessions'}
                      {selectedCourseDetails && ` in ${selectedCourseDetails.name}`}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                      {activeTab === 'students'
                        ? `${students?.message?.length || 0} students enrolled`
                        : 'View and manage class sessions'
                      }
                    </p>
                  </div>
                  {activeTab === 'students' && (
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="btn-primary"
                    >
                      <span>+</span>
                      Add Student
                    </button>
                  )}
                  {activeTab === 'sessions' && (
                    <button
                      onClick={() => setShowCreateSession(true)}
                      className="btn-primary"
                    >
                      <span>+</span>
                      Add Session
                    </button>
                  )}
                </div>

                <div className="panel-content">
                  {activeTab === 'students' ? (
                    <>
                      <CourseRegistrationRequests courseId={selectedCourse} />

                      <StudentList
                        students={students?.message || []}
                        loading={studentsLoading}
                        error={studentsError}
                        courseId={selectedCourse}
                      />
                    </>
                  ) : activeTab === 'sessions' ? (
                    <SessionList
                      courseId={selectedCourse}
                      onViewAttendance={handleViewAttendance}
                    />
                  ) : (
                    <FaceChangeRequests course_id={selectedCourse} />
                  )} 
                </div>
              </>
            ) : (
              <div className="panel-content">
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>Select a Course</h3>
                  <p>Choose a course from the list to view {activeTab}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {showCourseForm && (
          <CourseForm
            editingCourse={editingCourse}
            courses={courses?.message || []}
            onClose={() => {
              setShowCourseForm(false);
              setEditingCourse(null);
            }}
          />
        )}

        {showAddStudent && selectedCourse && (
          <AddStudentModal
            courseId={selectedCourse}
            onClose={() => setShowAddStudent(false)}
          />
        )}

        {showCreateSession && selectedCourse && (
          <CreateSession
            course_id={selectedCourse}
            onClose={() => setShowCreateSession(false)}
          />
        )}

        {selectedSession && (
          <AttendanceModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;