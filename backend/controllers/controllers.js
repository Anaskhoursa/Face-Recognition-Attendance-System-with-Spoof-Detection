const axios = require("axios")
const path = require('path')
const fs = require('fs')
const pool = require("../pg/pg");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken, generateJitsiToken } = require("../utils/tokens");
const { generateRoomId } = require("../utils/functions");
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');



// exports.signup = async (req, res) => {
//     try {
//         const { email, firstName, lastName, password, code } = req.body;

//         const existing = await pool.query(
//             "SELECT * FROM users WHERE email = $1",
//             [email]
//         );

//         if (existing.rows.length > 0) {
//             return res.status(400).json({ message: "Email already in use" });
//         }

//         if (existing.rows.length === 0 && !code) {
//             const new_code = Math.floor(100000 + Math.random() * 900000)
//             const expiryTime = new Date(Date.now() + 5 * 60 * 1000)
//             await pool.query('delete from signup_codes where email = $1', [email])
//             await pool.query('insert into signup_codes (email, code, expiryTime) values ($1, $2, $3)', [email, new_code, expiryTime])
//             const mailOptions = {
//                 from: "anasskhoursa@gmail.com",
//                 to: email,
//                 subject: 'code',
//                 html: `<h1>${new_code}</h1>`
//             };

//             console.log(new_code)

//             try {
//                 await transporter.sendMail(mailOptions);
//                 console.log(new_code)
//             } finally {
//                 return res.status(403).json({ message: 'Please verify your email by inserting the code sent to it' });
//             }
//         }

//         if (code) {
//             const storedCode = await pool.query('select * from signup_codes where code = $1 and email = $2', [code, email])

//             if (!storedCode.rows[0] || storedCode.rows[0].expirytime < Date.now()) {
//                 return res.status(400).json({ message: "Invalid or expired code" });
//             }

//             else {
//                 const hashedPassword = await bcrypt.hash(password, 10);
//                 const result = await pool.query(
//                     `INSERT INTO users (email, first_name, last_name, password_hash)
//        VALUES ($1, $2, $3, $4) RETURNING id, email, role`,
//                     [email, firstName, lastName, hashedPassword]
//                 );


//                 return res.status(200).json({
//                     message: "User registered successfully",

//                 });
//             }


//         }





//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: err.message });
//     }
// };

exports.signup = async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body;

        if (!email || !firstName || !lastName || !password) {
            return res.status(400).json({ 
                message: "All fields are required: email, firstName, lastName, password" 
            });
        }

        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ 
                message: "Email already in use. Please login or use a different email." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (email, first_name, last_name, password_hash, role)
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, first_name, last_name, role, created_at`,
            [email, firstName, lastName, hashedPassword, 'student'] 
        );

        const newUser = result.rows[0];



        return res.status(201).json({
            success: true,
            message: "User registered successfully",
        });

    } catch (err) {
        console.error('Signup error:', err);
        
        if (err.code === '23505') { 
            return res.status(400).json({ 
                message: "Email already exists. Please use a different email." 
            });
        }
        
        if (err.code === '22001') { 
            return res.status(400).json({ 
                message: "One or more fields are too long." 
            });
        }
        
        return res.status(500).json({ 
            message: "Server error during registration. Please try again." 
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ message: "Invalid credentials" });

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await pool.query("insert into refreshtokens (token, user_id) VALUES ($1,$2)", [
            refreshToken,
            user.id,
        ]);

        const seid = {
            user_id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            profile_image: user.profile_image,
            role: user.role

        }

        res.cookie("refresh", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: '/api/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("access", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('details', JSON.stringify(seid), {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
            path: '/',
            maxAge: undefined
        });

        return res.status(200).json({
            message: "Login successful",


        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    const jwt = req.cookies.refresh;
    if (!jwt)
        return res.status(401).json({ message: "No refresh token provided" });

    try {
        const decoded = require("jsonwebtoken").verify(
            jwt,
            process.env.REFRESH_TOKEN_SECRET
        );

        const accessToken = generateAccessToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });

        res.cookie("access", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({ message: 'access token sent' })
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

exports.checkFaceChange = async (req, res) => {
    try {
        const check = await pool.query('select face_change from users where id = $1', [req.user.id])
        const check2 = await pool.query(`select * from face_change where status = 'pending' and student_id = $1 `, [req.user.id])
        return res.status(200).json({ message: check.rows[0].face_change, message2: check2.rows[0].length > 0 ? true : false });

    } catch (error) {
        return res.status(500).json({ message: "server error" });

    }
}

exports.requestFaceChange = async (req, res) => {
    try {
        await pool.query('insert into face_change (student_id) values ($1)', [req.user.id])
        return res.status(200).json({ message: 'Success' });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });

    }
}
exports.getRequestFaceChange = async (req, res) => {
    try {
        const { course_id } = req.body
        if (req.user.role !== 'teacher') {
            return res.status(401).json({ message: 'unauthorized' })

        }
        const ress = await pool.query('select fc.*, u.first_name, u.last_name from face_change fc left join users u on fc.student_id = u.id left join student_courses sc on u.id = sc.student_id left join teacher_courses tc on sc.course_id = tc.course_id where tc.teacher_id = $1 and tc.course_id = $2', [req.user.id, parseInt(course_id, 10)])
        return res.status(200).json({ message: ress.rows[0] });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" });

    }
}
exports.manageRequestFaceChange = async (req, res) => {
    try {
        const { ans, rid, student_id } = req.body

        if (req.user.role !== 'teacher') {
            return res.status(401).json({ message: 'unauthorized' })

        }
        await pool.query(`update face_change set status = $1 where id = $2`, [ans ? 'approved' : 'declined', rid])
        await pool.query('update users set face_change = $1 where id = $2 ', [ans ? 'true' : 'false', student_id])
        return res.status(200).json({ message: 'Success' });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });

    }
}

exports.processFrame = async (req, res) => {
    try {
        const { frame } = req.body;

        if (!frame) {
            return res.status(400).json({ error: "Frame not provided" });
        }

        const check = await pool.query('select face_change from users where id = $1', [req.user.id])
        if (!check.rows[0].face_change) {
            return res.status(500).json({ message: 'you do not have access to change your face encoding' });
        }
        const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");

        const result = await axios.post(
            "https://anas044-attendance.hf.space/encode_face",
            { image: base64Data },
            { headers: { "Content-Type": "application/json" } }
        );

        user_id = req.user.id

        await pool.query("update users set face_encoding= $1 where id = $2", [
            result.data.encoding,
            user_id,
        ]);
        await pool.query('update users set face_change = false where id = $1', [req.user.id])

        return res.json({ message: 'encoding saved' });


    } catch (err) {
        console.log(err)
        const status = err.response?.status || 500;
        const message = err.response?.data?.detail || err.response?.data?.message || "Internal server error";

        return res.status(status).json({ message: message });
    }

}

exports.saveCourse = async (req, res) => {
    try {
        const { name, schedule } = req.body

        const teacher_id = req.user.id
        const save = await pool.query('insert into courses (name, schedule) values ($1 ,$2) returning *', [name, schedule])
        await pool.query('insert into teacher_courses (teacher_id, course_id) values ($1 ,$2)', [teacher_id, save.rows[0].id])

        return res.status(200).json({ message: 'saved' })
    } catch (error) {
        return res.status(500).json({ message: 'server error' });

    }
}

exports.updateCourse = async (req, res) => {
    try {
        const { id, name, schedule } = req.body

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }

        await pool.query('update courses set name = $1, schedule = $2 where id = $3', [name, schedule, id])
        return res.status(200).json({ message: 'updated' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'server error' });

    }
}

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.body

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }

        await pool.query('delete from courses where id = $1', [id])
        return res.status(200).json({ message: 'updated' })
    } catch (error) {

        return res.status(500).json({ message: 'server error' });

    }
}

exports.addStudentToCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }

        await pool.query('insert into student_courses (student_id, course_id) values ($1 ,$2)', [student_id, course_id])
        return res.status(200).json({ message: 'saved' })
    } catch (error) {

        return res.status(500).json({ message: 'server error' });

    }
}

exports.getCourseStudents = async (req, res) => {
    try {
        const { id } = req.body
        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }
        const students = await pool.query('select sc.*, u.first_name, u.last_name, u.profile_image from student_courses sc left join users u on sc.student_id = u.id where course_id = $1', [id])
        return res.status(200).json({ message: students.rows })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'server error' });

    }
}

exports.getCourses = async (req, res) => {
    try {
        const teacher_id = req.user.id

        const result = await pool.query(
            `SELECT c.*
             FROM teacher_courses tc
             JOIN courses c ON tc.course_id = c.id
             WHERE tc.teacher_id = $1`,
            [teacher_id]
        ); return res.status(200).json({ message: result.rows })
    } catch (error) {

        return res.status(500).json({ message: 'server error' });

    }
}

exports.removeStudentFromCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }
        await pool.query('delete from student_courses where student_id = $1 and course_id = $2', [student_id, course_id])
        return res.status(200).json({ message: 'updated' })
    } catch (error) {

        return res.status(500).json({ message: 'server error' });

    }
}

exports.getStudentCourses = async (req, res) => {
    try {
        const id = req.user.id
        const courses = await pool.query('select c.* from courses c JOIN student_courses sc ON sc.course_id = c.id WHERE sc.student_id = $1 ', [id])
        console.log(courses.rows)
        return res.status(200).json({ message: courses.rows })
    } catch (error) {
        return res.status(500).json({ message: 'server error' });

    }
}

exports.getStudentSessions = async (req, res) => {
    try {
        const { course_id } = req.body

        const check = await pool.query('select * from student_courses where course_id = $1 and student_id = $2', [course_id, req.user.id])
        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }
        const sessions = await pool.query('select * from sessions where class_id = $1', [course_id])
        return res.status(200).json({ message: sessions.rowCount > 0 ? sessions.rows : 'no sessions' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'server error' });

    }
}

exports.getSessions = async (req, res) => {
    try {

        const { course_id } = req.body

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }

        const sessions = await pool.query('select * from sessions where class_id = $1', [course_id])
        return res.status(200).json({ message: sessions.rowCount > 0 ? sessions.rows : 'no sessions' })

    } catch (error) {
        return res.status(500).json({ message: 'server error' });

    }
}

exports.deleteSession = async (req, res) => {
    try {

        const { session_id } = req.body

        const course = await pool.query('select class_id from sessions where id =$1', [session_id])

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course.rows[0].class_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }

        const sessions = await pool.query('delete from sessions where id = $1', [session_id])
        return res.status(200).json({ message: 'Deleted' })

    } catch (error) {
        return res.status(500).json({ message: 'server error' });

    }
}

exports.getStudentAttendance = async (req, res) => {
    try {
        const { student_id, session_id } = req.body;

        console.log(req.body)

        const course = await pool.query('select * from sessions where id = $1', [session_id])

        const teacher_id = req.user.id

        const check = await pool.query('select * from teacher_courses where teacher_id = $1 and course_id = $2', [teacher_id, course.rows[0].class_id])

        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'unauthorized' })
        }
        const user = await pool.query('select first_name, last_name from users where id = $1', [student_id])
        console.log(user.rows[0])
        const attendance = await pool.query('select a.*, u.first_name, u.last_name from attendance a left join users u on a.student_id = u.id where session_id = $1 and student_id = $2', [session_id, student_id])
        return res.status(200).json({ message: attendance.rowCount > 0 ? attendance.rows : 'Absent', fullName: user.rows[0] })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'server error' });

    }
}


exports.createSession = async (req, res) => {
    try {
        const {
            class_id,
            room_name,
            scheduled_time,
            end_scheduled_time
        } = req.body;

        const teacher_id = req.user.id;
        const teacherCheck = await pool.query(
            `SELECT * FROM teacher_courses 
             WHERE teacher_id = $1 AND course_id = $2`,
            [teacher_id, class_id]
        );

        if (teacherCheck.rowCount === 0) {
            return res.status(403).json({
                message: 'You are not authorized to create sessions for this course'
            });
        }

        const courseCheck = await pool.query(
            `SELECT name FROM courses WHERE id = $1`,
            [class_id]
        );

        if (courseCheck.rowCount === 0) {
            return res.status(404).json({
                message: 'Course not found'
            });
        }
        const courseName = courseCheck.rows[0].name;

        const roomId = generateRoomId(class_id, teacher_id);



        const defaultSettings = {
            enable_waiting_room: true,
            allow_recordings: false,
            enable_chat: true,
            enable_screen_sharing: false,
            start_with_audio_muted: true,
            start_with_video_muted: false,
            require_display_name: true,
            enable_close_page: false
        };

        const sessionSettings = {
            ...defaultSettings,
        };



        const sessionData = {
            class_id,
            teacher_id,
            room_name,
            jitsi_room_id: roomId,
            start_time: scheduled_time || new Date(),
            end_time: end_scheduled_time,
            settings: JSON.stringify(sessionSettings),
            is_active: false,
            session_status: 'scheduled',
            end_time: null
        };

        const insertQuery = `
            INSERT INTO sessions (
                class_id, teacher_id, room_name, jitsi_room_id, 
                start_time, settings, is_active, session_status, end_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *
        `;

        const sessionResult = await pool.query(insertQuery, [
            sessionData.class_id,
            sessionData.teacher_id,
            sessionData.room_name,
            sessionData.jitsi_room_id,
            sessionData.start_time,
            sessionData.settings,
            sessionData.is_active,
            sessionData.session_status,
            sessionData.end_time


        ]);
        const createdSession = sessionResult.rows[0];

        const response = {
            message: 'Session created successfully',


        };


        return res.status(201).json(response);


    } catch (error) {
        console.log(error)

        res.status(500).json({ message: 'server error' })
    }
}

const jwt = require('jsonwebtoken');
const { transporter } = require("../utils/mail");

exports.getSessionToken = async (req, res) => {
    try {
        const { session_id } = req.body;
        console.log('Getting session token for session:', session_id);

        // Get session details
        const room_id = await pool.query(
            'SELECT jitsi_room_id, is_active, start_time, end_time FROM sessions WHERE id = $1',
            [session_id]
        );

        if (room_id.rowCount === 0) {
            return res.status(404).json({ message: 'no session with that id' })
        }

        const session = room_id.rows[0];

        if (!session.is_active) {
            console.log('Session not active:', session.is_active);
            return res.status(400).json({ message: 'session not active' })
        }



        const get = await pool.query(
            'SELECT * FROM session_tokens WHERE session_id = $1 AND user_id = $2',
            [session_id, req.user.id]
        );

        let token;

        if (get.rowCount === 0) {
            return res.status(401).json({ message: 'verify your face' })
        } else {
            const existingToken = get.rows[0].token;

            try {
                const decoded = jwt.decode(existingToken);

                if (!decoded) {
                    return res.status(401).json({ message: 'verify your face' })
                }

                const currentTime = Math.floor(Date.now() / 1000);

                if (decoded.exp && decoded.exp < currentTime) {

                    await pool.query(
                        'DELETE FROM session_tokens WHERE session_id = $1 AND user_id = $2',
                        [session_id, req.user.id]
                    );

                    return res.status(401).json({ message: 'verify your face' })
                } else {
                    token = existingToken;
                    const expiresIn = decoded.exp ? decoded.exp - currentTime : null;
                }
            } catch (decodeError) {
                return res.status(401).json({ message: 'verify your face' })
            }
        }

        return res.status(200).json({
            message: token,
            room_name: session.jitsi_room_id
        });

    } catch (error) {
        res.status(500).json({ message: 'server error' })
    }
}

exports.verifyFace = async (req, res) => {
    try {
        const { frame } = req.body;

        if (!frame) {
            return res.status(400).json({ error: "Frame not provided" });
        }

        const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");
        user_id = req.user.id

        const check = await pool.query("select face_encoding from users where id = $1", [
            user_id,
        ]);

        if (check.rows[0].face_encoding === null || !check.rows[0].face_encoding) {
            return res.status(500).json({ message: 'no face encoding saved' })

        }

        const result = await axios.post(
            "https://anas044-attendance.hf.space/verify_face",
            { image: base64Data, encoding: check.rows[0].face_encoding },
            { headers: { "Content-Type": "application/json" } }
        );
        if (result.data.verified) {
            const { session_id } = req.body
            console.log(session_id)
            const room_id = await pool.query('select jitsi_room_id, is_active from sessions where id = $1', [session_id])

            if (room_id.rowCount === 0) {
                return res.status(404).json({ message: 'no session with that id' })
            }

            if (!room_id.rows[0].is_active) {
                console.log(room_id.rows[0].isactive)
                return res.status(400).json({ message: 'session not active' })

            }

            let isTeacher = false;
            let room_name;

            const role = req.user.role;
            if (role === 'teacher') {
                const teacherCheck = await pool.query(
                    'SELECT * FROM sessions WHERE id = $1 AND teacher_id = $2',
                    [session_id, req.user.id]
                );

                isTeacher = teacherCheck.rowCount > 0;

            }
            token = generateJitsiToken(req.user, room_id.rows[0].jitsi_room_id, isTeacher)
            await pool.query('insert into session_tokens (session_id, user_id, token) values ($1, $2, $3)', [session_id, req.user.id, token])
        }


        return res.status(200).json({ message: result.data.verified ? 'verified' : 'not verified' });


    } catch (err) {
        console.log(err)
        const status = err.response?.status || 500;
        const message = err.response?.data?.detail || err.response?.data?.message || "Internal server error";

        return res.status(status).json({ message: message });
    }

}
exports.startSession = async (req, res) => {
    try {
        const { session_id } = req.body

        const teacherCheck = await pool.query(
            `SELECT s.* FROM sessions s
                 JOIN teacher_courses tc ON s.class_id = tc.course_id
                 WHERE s.id = $1 AND tc.teacher_id = $2`,
            [session_id, req.user.id]
        );
        if (teacherCheck.rowCount === 0) {
            return res.status(401).json({ message: 'not authorized' })
        };

        await pool.query(`update sessions set session_status = 'active', is_active = true where id = $1`, [session_id])
        return res.status(200).json({ message: 'updated' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'server error' })

    }
}

exports.endSession = async (req, res) => {
    try {
        const { session_id } = req.body

        const teacherCheck = await pool.query(
            `SELECT s.* FROM sessions s
                 JOIN teacher_courses tc ON s.class_id = tc.course_id
                 WHERE s.id = $1 AND tc.teacher_id = $2`,
            [session_id, req.user.id]
        );
        if (teacherCheck.rowCount === 0) {
            return res.status(401).json({ message: 'not authorized' })
        };

        await pool.query(`update sessions set session_status = 'ended', is_active = false where id = $1`, [session_id])
        return res.status(200).json({ message: 'updated' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'server error' })

    }
}

exports.courseRegister = async (req, res) => {
    try {
        const { course_id } = req.body
        const user_id = req.user.id

        await pool.query('insert into courses_registrations (course_id, student_id) values ($1,$2)', [course_id, user_id])
        return res.status(200).json({ message: 'saved' })
    } catch (error) {
        res.status(500).json({ message: 'server error' })

    }
}

exports.courseRegistrRes = async (req, res) => {
    try {
        const { request_id, isAccepted } = req.body
        const user_id = req.user.id
        console.log(req.body)

        const check = await pool.query('select tc.* from teacher_courses tc JOIN courses_registrations cr ON tc.course_id = cr.course_id where tc.teacher_id = $1', [user_id])
        if (check.rowCount === 0) {
            return res.status(401).json({ message: 'not authorized' })
        }

        const save = await pool.query('update courses_registrations set status = $1 where id = $2 returning *', [isAccepted ? 'approved' : 'declined', request_id])

        if (isAccepted) {
            await pool.query('insert into student_courses (student_id, course_id) values ($1 ,$2)', [save.rows[0].student_id, save.rows[0].course_id])
        }
        return res.status(200).json({ message: 'saved' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'server error' })

    }
}

exports.GetcourseRegistrRes = async (req, res) => {
    try {
        const user_id = req.user.id

        const check = await pool.query('select  cr.id, c.name, cr.student_id from teacher_courses tc JOIN courses_registrations cr ON tc.course_id = cr.course_id join courses c on c.id = cr.course_id where tc.teacher_id = $1 and cr.status =$2', [user_id, 'pending'])
        // if (check.rowCount === 0) {
        //     return res.status(401).json({ message: 'not authorized' })
        // }

        // const save = await pool.query('update courses_registrations set status = $3 where id = $4', [isAccepted ? 'approved' : 'declined', user_id])
        // if (isAccepted) {
        //     await pool.query('insert into student_courses (student_id, course_id) values ($1 ,$2)', [save.rows[0].student_id, save.rows[0].course_id])
        // }
        return res.status(200).json({ message: check.rows })
    } catch (error) {
        res.status(500).json({ message: 'server error' })

    }
}


exports.getAvailableCourses = async (req, res) => {
    try {
        const user_id = req.user.id

        const result = await pool.query(
            `SELECT c.*, cr.status from courses c left join courses_registrations cr on c.id = cr.course_id and cr.student_id = $1 where c.id not in (select course_id from student_courses where student_id = $1);`, [user_id]);
        return res.status(200).json({ message: result.rows })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'server error' });

    }
}

exports.setAttendance = async (req, res) => {
    try {
        const { session_id, joined_at, left_at } = req.body
        if (req.user.role === 'teacher') {
            return res.status(200).json({ message: 'no need' })
        }
        const user_id = req.user.id
        const check = await pool.query('select * from session_tokens where user_id = $1 and session_id = $2', [user_id, session_id])

        if (check.rowCount < 0) {
            return res.status(401).json({ message: 'did not attend the session' })
        }
        await pool.query('insert into attendance (session_id, student_id, joined_at, left_at) values ($1,$2, $3, $4)', [session_id, user_id, joined_at, left_at])
        res.status(200).json({ message: 'saved' })
    } catch (error) {
        return res.status(500).json({ message: 'server error' });

    }
}



exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                id, 
                email, 
                first_name, 
                last_name, 
                profile_image
             FROM users 
             WHERE id = $1`,
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: result.rows[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, first_name, last_name, phone_number } = req.body;



        if (email) {
            const emailCheck = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );
            if (emailCheck.rowCount > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }
        }

        const result = await pool.query(
            `UPDATE users 
             SET 
                email = COALESCE($1, email),
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name)
             WHERE id = $4
             RETURNING id, email, first_name, last_name`,
            [email, first_name, last_name, userId]
        );

        const user = result.rows[0];

        const seid = {
            user_id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            profile_image: user.profile_image,
            role: user.role

        }


        res.clearCookie('details')
        res.cookie('details', JSON.stringify(seid), {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
            path: '/',
            maxAge: undefined
        });

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({ message: 'All password fields are required' });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentHashedPassword = userResult.rows[0].password_hash;

        const isPasswordValid = await bcrypt.compare(current_password, currentHashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const saltRounds = 10;
        const newHashedPassword = await bcrypt.hash(new_password, saltRounds);

        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [newHashedPassword, userId]
        );

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const update = await pool.query(
            'UPDATE users SET profile_image = $1 WHERE id = $2 returning *',
            [imageUrl, userId]
        );

        const user = update.rows[0];

        const seid = {
            user_id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            profile_image: user.profile_image,
            role: user.role

        }


        res.clearCookie('details')
        res.cookie('details', JSON.stringify(seid), {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
            path: '/',
            maxAge: undefined
        });
        return res.status(200).json({
            message: 'Profile image updated successfully',
            image_url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.streamImage = async (req, res) => {
    try {
        const { filename } = req.params;

        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ message: 'Invalid filename' });
        }

        let imagePath;

        const profilePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(profilePath)) {
            imagePath = profilePath;
        } else {

            return res.status(404).json({ message: 'Image not found' });
        }

        const stats = fs.statSync(imagePath);
        const fileSize = stats.size;
        const ext = path.extname(filename).toLowerCase();

        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Cache-Control', 'public, max-age=86400');

        const stream = fs.createReadStream(imagePath);
        stream.pipe(res);

        // Handle stream errors
        stream.on('error', (err) => {
            console.error('Error streaming image:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming image' });
            }
        });

    } catch (error) {
        console.error('Error in streamImage:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

exports.searchStudents = async (req, res) => {
    try {
        const { search, course_id } = req.body;
        console.log(req.body)

        if (!search || search.trim().length === 0) {
            return res.status(200).json({ message: [] });
        }

        const searchTerm = `%${search}%`;

        let query = `
            SELECT 
                u.id as student_id,
                u.email,
                u.first_name,
                u.last_name,
                u.role
            FROM users u
            WHERE u.role = 'student'
            AND (
                u.id::TEXT ILIKE $1 OR 
                u.email ILIKE $1 OR
                CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
            )
            AND u.id NOT IN (
                SELECT student_id 
                FROM student_courses 
                WHERE course_id = $2
            )
            ORDER BY u.id
            LIMIT 10
        `;

        const result = await pool.query(query, [searchTerm, course_id || 0]);

        res.status(200).json({ message: result.rows });
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length === 0) {
            return res.status(200).json({
                message: 'If an account exists with this email, a reset code has been sent.'
            });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000);

        const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query('DELETE FROM reset_codes WHERE email = $1', [email]);

        await pool.query(
            'INSERT INTO reset_codes (email, code, expiryTime) VALUES ($1, $2, $3)',
            [email, resetCode, expiryTime]
        );

        const mailOptions = {
            from: "anasskhoursa@gmail.com",
            to: email,
            subject: 'Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the code below to proceed:</p>
                    <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <h1 style="color: #4f46e5; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #64748b; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(resetCode)
        res.status(200).json({
            message: 'If an account exists with this email, a reset code has been sent.',
            email: email
        });

    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and code are required' });
        }

        const result = await pool.query(
            `SELECT * FROM reset_codes 
             WHERE email = $1 
             AND code = $2 
             AND expiryTime > NOW()`,
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        res.status(200).json({
            message: 'Code verified successfully',
            email: email
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, new_password, confirm_password } = req.body;

        if (!email || !code || !new_password || !confirm_password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const codeResult = await pool.query(
            `SELECT * FROM reset_codes 
             WHERE email = $1 
             AND code = $2 
             AND expiryTime > NOW()`,
            [email, code]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        // await pool.query(
        //     'UPDATE reset_codes SET used = true WHERE email = $1 AND code = $2',
        //     [email, code]
        // );

        const mailOptions = {
            from: process.env.EMAIL_FROM || "anasskhoursa@gmail.com",
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Password Changed Successfully</h2>
                    <p>Your password has been successfully changed.</p>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <p style="margin: 0;">If you did not make this change, please contact support immediately.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #64748b; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

