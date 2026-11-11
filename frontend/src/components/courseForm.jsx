// src/components/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveCourse, updateCourse } from '../api/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'];

const CourseForm = ({ editingCourse, courses, onClose }) => {
  const [scheduleItems, setScheduleItems] = useState([{ day: '', time: '' }]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingCourse && courses) {
      const course = courses.find(c => c.id === editingCourse);
      if (course && course.schedule) {
        try {
          const parsedSchedule = Array.isArray(course.schedule) 
            ? course.schedule 
            : JSON.parse(course.schedule);
          
          if (parsedSchedule.length > 0) {
            const items = parsedSchedule.map(item => {
              const [day, time] = item.split(' ');
              return { day, time: `${time} ${item.includes('PM') ? 'PM' : 'AM'}` };
            });
            setScheduleItems(items);
          }
        } catch (error) {
          console.error('Error parsing schedule:', error);
        }
      }
    }
  }, [editingCourse, courses]);

  const saveCourseMutation = useMutation({
    mutationFn: saveCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
  });

  const handleScheduleChange = (index, field, value) => {
    const newItems = [...scheduleItems];
    newItems[index][field] = value;
    setScheduleItems(newItems);
  };

  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { day: '', time: '' }]);
  };

  const removeScheduleItem = (index) => {
    if (scheduleItems.length > 1) {
      const newItems = scheduleItems.filter((_, i) => i !== index);
      setScheduleItems(newItems);
    }
  };

  const formatScheduleForBackend = () => {
    return scheduleItems
      .filter(item => item.day && item.time)
      .map(item => `${item.day} ${item.time}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const scheduleArray = formatScheduleForBackend();
    
    if (scheduleArray.length === 0) {
      alert('Please add at least one schedule item');
      return;
    }

    const courseData = {
      name: formData.get('name'),
      schedule: scheduleArray,
    };

    if (editingCourse) {
      courseData.id = editingCourse;
      updateCourseMutation.mutate(courseData);
    } else {
      saveCourseMutation.mutate(courseData);
    }
  };

  const isLoading = saveCourseMutation.isLoading || updateCourseMutation.isLoading;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Name</label>
            <input
              type="text"
              name="name"
              required
              className="form-input"
              placeholder="Enter course name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Schedule</label>
            <div className="schedule-form-group">
              {scheduleItems.map((item, index) => (
                <div key={index} className="schedule-item">
                  <div>
                    <label className="form-label">Day</label>
                    <select
                      value={item.day}
                      onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                      className="schedule-select"
                      required
                    >
                      <option value="">Select day</option>
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Time</label>
                    <select
                      value={item.time}
                      onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                      className="schedule-select"
                      required
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScheduleItem(index)}
                    className="remove-schedule-btn"
                    disabled={scheduleItems.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScheduleItem}
                className="add-schedule-btn"
              >
                <span>+</span>
                Add Another Schedule
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;