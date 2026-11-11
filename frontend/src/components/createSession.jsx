// src/components/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession, saveCourse, updateCourse } from '../api/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'];

const CreateSession = ({ course_id, courses, onClose }) => {
    const [scheduleItems, setScheduleItems] = useState([{ day: '', time: '' }]);
    const queryClient = useQueryClient();

    // useEffect(() => {
    //     if (editingCourse && courses) {
    //         const course = courses.find(c => c.id === editingCourse);
    //         if (course && course.schedule) {
    //             try {
    //                 const parsedSchedule = Array.isArray(course.schedule)
    //                     ? course.schedule
    //                     : JSON.parse(course.schedule);

    //                 if (parsedSchedule.length > 0) {
    //                     const items = parsedSchedule.map(item => {
    //                         const [day, time] = item.split(' ');
    //                         return { day, time: `${time} ${item.includes('PM') ? 'PM' : 'AM'}` };
    //                     });
    //                     setScheduleItems(items);
    //                 }
    //             } catch (error) {
    //                 console.error('Error parsing schedule:', error);
    //             }
    //         }
    //     }
    // }, [editingCourse, courses]);

    const createSessionMutation = useMutation({
        mutationFn: createSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions', course_id] });
            onClose();
        },
    });

    // const updateCourseMutation = useMutation({
    //     mutationFn: updateCourse,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['courses'] });
    //         onClose();
    //     },
    // });

    // const handleScheduleChange = (index, field, value) => {
    //     const newItems = [...scheduleItems];
    //     newItems[index][field] = value;
    //     setScheduleItems(newItems);
    // };

    // const addScheduleItem = () => {
    //     setScheduleItems([...scheduleItems, { day: '', time: '' }]);
    // };

    // const removeScheduleItem = (index) => {
    //     if (scheduleItems.length > 1) {
    //         const newItems = scheduleItems.filter((_, i) => i !== index);
    //         setScheduleItems(newItems);
    //     }
    // };

    // const formatScheduleForBackend = () => {
    //     return scheduleItems
    //         .filter(item => item.day && item.time)
    //         .map(item => `${item.day} ${item.time}`);
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // const scheduleArray = formatScheduleForBackend();

        // if (scheduleArray.length === 0) {
        //     alert('Please add at least one schedule item');
        //     return;
        // }

        const sessionData = {
            class_id : course_id,
            room_name: formData.get('name'),
            scheduled_time: formData.get('date') + ' ' +  formData.get('starttime'),
            end_scheduled_time: formData.get('date') + ' ' + formData.get('endtime'),
        };

        // if (editingCourse) {
        //     courseData.id = editingCourse;
        //     updateCourseMutation.mutate(courseData);
        // } else {
            createSessionMutation.mutate(sessionData);
        // }
    };

    const isLoading = createSessionMutation.isLoading;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{'Create New Course'}</h3>
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
                        <label className="form-label">Session Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="form-input"
                            placeholder="Enter course name"
                        />
                    </div>

                    <div className="schedule-item">
                        <div>
                            <label className="form-label">Date</label>
                            <input
                                type="text"
                                name="date"
                                required
                                className="form-input"
                                placeholder="yyyy/mm/dd"
                            />
                        </div>
                        <div>
                            <label className="form-label"> Start Time</label>
                            <select
                                
                                name='starttime'
                                className="schedule-select"
                                required
                            >
                                <option value="">Select time</option>
                                {TIME_SLOTS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label"> End Time</label>
                            <select
                                name='endtime'
                                className="schedule-select"
                                required
                            >
                                <option value="">Select time</option>
                                {TIME_SLOTS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
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
                            {isLoading ? 'Saving...' : 'Create Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSession;