import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addStudentToCourse, searchStudents } from '../api/api';

const AddStudentModal = ({ courseId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['studentSearch', searchTerm, courseId],
    queryFn: () => {
      if (searchTerm.trim().length >= 1) {
        return searchStudents({
          search: searchTerm.trim(),
          course_id: courseId
        });
      }
      return Promise.resolve({ message: [] });
    },
    enabled: searchTerm.trim().length >= 1,
    staleTime: 3000,
  });

  const addStudentMutation = useMutation({
    mutationFn: addStudentToCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
      queryClient.invalidateQueries({ queryKey: ['studentSearch', searchTerm, courseId] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to add student');
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setSearchTerm('');
    setSelectedStudent(null);
    setShowSuggestions(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedStudent(null);
    setShowSuggestions(value.trim().length >= 1);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchTerm(`${student.student_id} - ${student.first_name} ${student.last_name}`);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student from the list');
      return;
    }

    addStudentMutation.mutate({
      student_id: selectedStudent.student_id,
      course_id: courseId,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const students = searchResults?.message || [];

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3>Add Student to Course</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={addStudentMutation.isLoading}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Search Student by ID
              <span className="label-hint">(Start typing student ID or name)</span>
            </label>
            
            <div className="autocomplete-container" ref={suggestionsRef}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(searchTerm.trim().length >= 1)}
                className="form-input search-input"
                placeholder="Type student ID or name..."
                disabled={addStudentMutation.isLoading}
                autoComplete="off"
              />
              
              {isSearching && (
                <div className="search-loading">
                  <div className="mini-spinner"></div>
                  <span>Searching...</span>
                </div>
              )}
              
              {showSuggestions && students.length > 0 && (
                <div className="suggestions-dropdown">
                  {students.map((student) => (
                    <div
                      key={student.student_id}
                      className={`suggestion-item ${
                        selectedStudent?.student_id === student.student_id ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="student-id">{student.student_id}</div>
                      <div className="student-info">
                        <div className="student-name">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSuggestions && !isSearching && searchTerm.trim().length >= 1 && students.length === 0 && (
                <div className="suggestions-dropdown">
                  <div className="no-results">
                    No students found matching "{searchTerm}"
                  </div>
                </div>
              )}
            </div>
            
            {selectedStudent && (
              <div className="selected-student-card">
                <div className="selected-header">
                  <strong>Selected Student:</strong>
                </div>
                <div className="selected-details">
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedStudent.student_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedStudent.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={addStudentMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addStudentMutation.isLoading || !selectedStudent}
              className="btn-primary"
            >
              {addStudentMutation.isLoading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;