// src/components/StudentList.jsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeStudentFromCourse } from '../api/api';

const StudentList = ({ students, loading, error, courseId }) => {
  const queryClient = useQueryClient();

  const removeStudentMutation = useMutation({
    mutationFn: removeStudentFromCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
    },
  });

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      removeStudentMutation.mutate({
        student_id: studentId,
        course_id: courseId,
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Students</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👤</div>
        <h3>No Students</h3>
        <p>Add students to this course to get started</p>
      </div>
    );
  }

  return (
    <div className="students-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Profile Picture</th>
            <th>Student Full Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id}>
              <td>
                <span className="student-id">{student.student_id}</span>
              </td>
              <td>
                <img className="student-id" style={{width:'1rem', height:'5rem'}} src={'https://anas044-attendance-nodejs.hf.space/api'+student.profile_image}/>
              </td>
              <td>
                <span className="student-id">{student.first_name} {student.last_name}</span>
              </td>
              <td>
                <button
                  onClick={() => handleRemoveStudent(student.student_id)}
                  className="btn-danger"
                  disabled={removeStudentMutation.isLoading}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;