// src/components/CourseRegistrationRequests.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseRegistrationRequests, courseRegisterRes } from '../api/api';

const CourseRegistrationRequests = ({ courseId }) => {
  const queryClient = useQueryClient();

  const { 
    data: requests, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['registrationRequests', courseId],
    queryFn: () => getCourseRegistrationRequests({ course_id: courseId }),
    enabled: !!courseId,
  });

  // Mutation for approving registration
  const approveMutation = useMutation({
    mutationFn: ({ requestId }) => courseRegisterRes({ request_id: requestId, isAccepted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['registrationRequests', courseId]);
      queryClient.invalidateQueries(['courseStudents', courseId]);
    },
  });

  // Mutation for denying registration
  const denyMutation = useMutation({
    mutationFn: ({ requestId }) => courseRegisterRes({ request_id: requestId, isAccepted: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['registrationRequests', courseId]);
    },
  });

  // Handle approve
  const handleApprove = (requestId, studentName) => {
    if (window.confirm(`Approve ${studentName}'s registration request?`)) {
      approveMutation.mutate({ requestId });
    }
  };

  // Handle deny
  const handleDeny = (requestId, studentName) => {
    if (window.confirm(`Deny ${studentName}'s registration request?`)) {
      denyMutation.mutate({ requestId });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading registration requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Requests</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const requestsData = requests?.message || [];

  if (requestsData.length === 0) {
    return (
      <div className="empty-state">

      </div>
    );
  }

  return (
    <div className="registration-requests">
      <div className="requests-header">
        <h3>Pending Registration Requests ({requestsData.length})</h3>
      </div>
      
      <div className="requests-list">
        {requestsData.map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-info">
              <div className="student-name">
                <strong>{request.student_name || `Student #${request.student_id}`} {request.first_name + ' ' + request.last_name}</strong>
              </div>
              <div className="request-date">
                {request.name}
              </div>
            </div>
            
            <div className="request-actions">
              <button
                onClick={() => handleApprove(request.id, request.student_name || `Student`)}
                disabled={approveMutation.isPending || denyMutation.isPending}
                className="btn-approve"
              >
                {approveMutation.isPending ? 'Approve' : 'Approve'}
              </button>
              
              <button
                onClick={() => handleDeny(request.id, request.student_name || `Student`)}
                disabled={approveMutation.isPending || denyMutation.isPending}
                className="btn-deny"
              >
                {denyMutation.isPending ? 'Denying...' : 'Deny'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRegistrationRequests;