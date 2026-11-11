const express = require("express");
const { signup, refreshToken, processFrame, login, saveCourse, updateCourse, deleteCourse, addStudentToCourse, getCourseStudents, removeStudentFromCourse, getCourses, getStudentAttendance, getSessions, getStudentCourses, getStudentSessions, createSession, getSessionToken, startSession, endSession, verifyFace, courseRegistrRes, courseRegister, GetcourseRegistrRes, getAvailableCourses, setAttendance, updateProfile, getProfile, changePassword, uploadProfileImage, streamImage, searchStudents, requestPasswordReset, verifyResetCode, resetPassword, checkFaceChange, requestFaceChange, getRequestFaceChange, manageRequestFaceChange, deleteSession } = require("../controllers/controllers");
const { authMiddleware, verifyRefreshToken, verifyAcess, teacherAuthMiddleware, verifyTeacher } = require("../middlewares/middlewares");
const upload = require("../middlewares/upload");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/refresh", refreshToken);
router.post("/check-face-change",  authMiddleware, checkFaceChange);
router.post("/request-face-change",  authMiddleware, requestFaceChange);
router.post("/get-request-face-change",  teacherAuthMiddleware, getRequestFaceChange);
router.post("/manage-request-face-change",  teacherAuthMiddleware, manageRequestFaceChange);

router.post("/process-frame",  authMiddleware, processFrame);
router.post("/refresh",  verifyRefreshToken);
router.post("/verify-access",  verifyAcess);
router.post("/verify-teacher",  verifyTeacher);

router.post("/save-course", teacherAuthMiddleware, saveCourse);
router.post("/update-course", teacherAuthMiddleware, updateCourse);
router.post("/delete-course", teacherAuthMiddleware, deleteCourse);
router.post("/add-student-to-course",teacherAuthMiddleware,  addStudentToCourse);
router.post("/add-student-to-course", teacherAuthMiddleware, addStudentToCourse);
router.post("/get-course-students", teacherAuthMiddleware, getCourseStudents);
router.post("/remove-student-from-course", teacherAuthMiddleware, removeStudentFromCourse);
router.post("/get-courses", teacherAuthMiddleware, getCourses);
router.post("/get-student-attendance", teacherAuthMiddleware, getStudentAttendance);
router.post("/get-sessions", teacherAuthMiddleware, getSessions);
router.post("/get-student-courses", authMiddleware, getStudentCourses);
router.post("/get-student-sessions", authMiddleware, getStudentSessions);

router.post("/create-session", teacherAuthMiddleware, createSession);
router.post("/delete-session", teacherAuthMiddleware, deleteSession);

router.post("/get-session-token", authMiddleware, getSessionToken);
router.post("/start-session", teacherAuthMiddleware, startSession);
router.post("/course-register", authMiddleware, courseRegister);
router.post("/course-register-res", teacherAuthMiddleware, courseRegistrRes);
router.post("/end-session", teacherAuthMiddleware, endSession);
router.post("/verify-face", authMiddleware, verifyFace);
router.post("/get-courses-registrations", teacherAuthMiddleware, GetcourseRegistrRes);
router.post("/get-available-courses", authMiddleware, getAvailableCourses);
router.post("/set-attendance", authMiddleware, setAttendance);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

router.post('/change-password', authMiddleware, changePassword);
router.post('/search-students', authMiddleware, searchStudents);

router.post('/upload-profile-image', 
    authMiddleware,
    upload.single('profile_image'), 
    uploadProfileImage
);

router.get('/uploads/:filename', streamImage);
router.post('/request', requestPasswordReset);
router.post('/verify-code', verifyResetCode);
router.post('/reset', resetPassword);

module.exports = router;
