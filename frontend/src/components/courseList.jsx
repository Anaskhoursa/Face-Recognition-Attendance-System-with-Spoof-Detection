// src/components/CourseList.jsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCourse } from '../api/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'];

const CourseList = ({ courses, selectedCourse, onSelectCourse, onEditCourse }) => {
  const queryClient = useQueryClient();

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const formatScheduleDisplay = (schedule) => {
    try {
      const scheduleArray = Array.isArray(schedule) ? schedule : JSON.parse(schedule);
      return scheduleArray.map((item, index) => (
        <span key={index} className="schedule-badge">
          {item}
        </span>
      ));
    } catch (error) {
      return <span className="schedule-badge">{schedule}</span>;
    }
  };

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📚</div>
        <h3>No Courses Yet</h3>
        <p>Create your first course to get started</p>
      </div>
    );
  }

  return (
    <div className="courses-list">
      {courses.map((course) => (
        <div
          key={course.id}
          className={`course-item ${selectedCourse === course.id ? 'selected' : ''}`}
          onClick={() => onSelectCourse(course.id)}
        >
          <div className="course-header">
            <div className="course-name">{course.name}</div>
            <div className="course-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCourse(course.id);
                }}
                className="btn-icon edit"
                title="Edit Course"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this course?')) {
                    deleteCourseMutation.mutate({ id: course.id });
                  }
                }}
                className="btn-icon delete"
                disabled={deleteCourseMutation.isLoading}
                title="Delete Course"
              >
                🗑️
              </button>
            </div>
          </div>
          <div className="course-schedule">
            {formatScheduleDisplay(course.schedule)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;