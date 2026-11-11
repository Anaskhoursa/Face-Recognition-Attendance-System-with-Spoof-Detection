// src/components/CourseRegistrationRequests.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequestFaceChange, manageRequestFaceChange } from '../api/api';
import Cookies from "js-cookie";

const FaceChangeRequests = ({course_id }) => {
  const queryClient = useQueryClient();
  const user = JSON.parse(Cookies.get('details')?.toString() ?? '');

  const {
    data: requests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['faceChangeRequests', course_id],
    queryFn: () => getRequestFaceChange({course_id : course_id}),

  });

  const approveMutation = useMutation({
    mutationFn: ({ rid, student_id }) => manageRequestFaceChange({rid,  ans: true, student_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['faceChangeRequests', course_id]);

    },
  });

  // Mutation for denying registration
  const denyMutation = useMutation({
    mutationFn: ({rid, student_id}) => manageRequestFaceChange({rid, ans: false, student_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['faceChangeRequests', course_id]);
    },
  });

  // Handle approve
  const handleApprove = (rid, studentName, student_id) => {
    if (window.confirm(`Approve ${studentName}'s face change request?`)) {
      approveMutation.mutate({rid, student_id});
    }
  };

  // Handle deny
  const handleDeny = (rid, studentName, student_id) => {
    if (window.confirm(`Deny ${studentName}'s registration request?`)) {
      denyMutation.mutate({rid, student_id});
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading requests...</p>
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
        <div className="empty-icon"></div>
        <h3>No Requests Yet</h3>
      </div>
    );
  }

  return (
    <div className="registration-requests">
      <div className="requests-header">
        <h3>Pending Face Change Requests ({requestsData.length})</h3>
      </div>

      <div className="requests-list">
        {requestsData.map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-info">
              <div className="student-name">
                <strong>{request.first_name + ' ' + request.last_name + `#${request.student_id}`}</strong>
              </div>
              <div className="request-date">
                {request.status}
              </div>
            </div>

            <div className="request-actions">
              <button
                onClick={() => handleApprove(request.id ,request.first_name + request.last_name, request.student_id)}
                disabled={approveMutation.isPending || denyMutation.isPending}
                className="btn-approve"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </button>

              <button
                onClick={() => handleDeny(request.id ,request.first_name + request.last_name, request.student_id)}
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

export default FaceChangeRequests;