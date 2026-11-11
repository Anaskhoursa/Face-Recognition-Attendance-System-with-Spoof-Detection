import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 &&
      (error.response?.data?.message === "ACCESS_TOKEN_EXPIRED" || error.response?.data?.message === "NO_TOKEN")) {

      await api.post("/refresh", {}, { withCredentials: true });

      return axios(error.config);
    }

    if (error.response?.status === 401 &&
      error.response?.data?.message === "UNAUTHORZIED") {

      alert('UNAUTHORIZED')
      return <Navigate to="/" replace />
    }
    // else if (error.response?.data?.message === "Refresh token missing" 
    //   || error.response?.data?.message === "Invalid refresh token")  {
    //     navi
    //   }

    return Promise.reject(error);
  }
);


export const sendFrame = async (base64Frame) => {
  try {
    const res = await api.post("/process-frame", {
      frame: base64Frame,
    });
    return res.data;
  } catch (error) {
    console.log(error.response.data.message)
    return {
      success: false,
      error: error?.response?.data?.message || "UNKNOWN_ERROR",
      status: error?.response?.status || 500,
    };
  }

};

export const verifyAccess = async () => {
  try {
    const res = await api.post("/verify-access");
    return res.data;
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || "UNKNOWN_ERROR",
      status: error?.response?.status || 500,
    };
  }

};

export const verifyTeacher = async () => {
  try {
    const res = await api.post("/verify-teacher");
    return res.data;
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error?.response?.data?.message || "UNKNOWN_ERROR",
      status: error?.response?.status || 500,
    };
  }

};


export const saveCourse = async (data) => {
  const res = await api.post("/save-course", data);
  return res.data;
};

export const updateCourse = async (data) => {
  const res = await api.post("/update-course", data);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.post("/delete-course", id);
  return res.data;
};

export const addStudentToCourse = async (data) => {
  const res = await api.post("/add-student-to-course", data);
  return res.data;
};

export const getCourseStudents = async (data) => {
  const res = await api.post("/get-course-students", data);
  return res.data;
};

export const removeStudentFromCourse = async (data) => {
  const res = await api.post("/remove-student-from-course", data);
  return res.data;
};

export const getCourses = async (data) => {
  const res = await api.post("/get-courses");
  return res.data;
};

export const getSessions = async (data) => {
  const res = await api.post("/get-sessions", data);
  return res.data;
};

export const getStudentAttendance = async (data) => {
  const res = await api.post("/get-student-attendance", data);
  return res.data;
};

export const getStudentSessions = async (data) => {
  const res = await api.post("/get-student-sessions", data);
  return res.data;
};

export const getStudentCourses = async (data) => {
  const res = await api.post("/get-student-courses", data);
  return res.data;
};

export const getSessionToken = async (data) => {
  const res = await api.post("/get-session-token", data);
  return res.data;
};

export const createSession = async (data) => {
  const res = await api.post("/create-session", data);

  return res.data;
};

export const deleteSession = async (data) => {
  const res = await api.post("/delete-session", data);

  return res.data;
};

export const startSession = async (data) => {
  const res = await api.post("/start-session", data);

  return res.data;
};

export const endSession = async (data) => {
  const res = await api.post("/end-session", data);

  return res.data;
};

export const courseRegister = async (data) => {
  const res = await api.post("/course-register", data);

  return res.data;
};

export const courseRegisterRes = async (data) => {
  const res = await api.post("/course-register-res", data);

  return res.data;
};

export const getCourseRegistrationRequests = async (data) => {
  const res = await api.post("/get-courses-registrations", data);

  return res.data;
};

export const getAvailableCourses = async (data) => {
  const res = await api.post("/get-available-courses", data);

  return res.data;
};
export const setAttendance = async (data) => {
  const res = await api.post("/set-attendance", data);

  return res.data;
};
export const verifyFace = async (base64Frame, session_id) => {
  try {
    const res = await api.post("/verify-face", {
      frame: base64Frame,
      session_id: session_id
    });
    return res.data;
  } catch (error) {
    console.log(error.response.data.message)
    return {
      success: false,
      error: error?.response?.data?.message || "UNKNOWN_ERROR",
      status: error?.response?.status || 500,
    };
  }

};

export const getProfile = async () => {
    const response = await api.get('/profile')
    return response.data;
};

export const searchStudents = async (data) => {
    const response = await api.post('/search-students', data)
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/profile', profileData)
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.post('/change-password', passwordData)
    return response.data;
};

export const uploadProfileImage = async (formData) => {
    const response = await api.post('/upload-profile-image', formData)
    return response.data;
};

export const requestPasswordReset  = async (passwordData) => {
    const response = await api.post('/request', passwordData)
    return response.data;
};

export const verifyResetCode   = async (passwordData) => {
    const response = await api.post('/verify-code', passwordData)
    return response.data;
};

export const resetPassword    = async (passwordData) => {
    const response = await api.post('/reset', passwordData)
    return response.data;
};


export const logout = async () => {
    const response = await api.post('/logout')
    return response.data;
};

export const checkFaceChange = async (data) => {
    const response = await api.post('/check-face-change', data)
    return response.data;
};

export const requestFaceChange = async (data) => {
    const response = await api.post('/request-face-change', data)
    return response.data;
};

export const getRequestFaceChange = async (data) => {
    const response = await api.post('/get-request-face-change', data)
    return response.data;
};
export const manageRequestFaceChange = async (data) => {
    const response = await api.post('/manage-request-face-change', data)
    return response.data;
};

