// socket.js
const { Server } = require('socket.io');
const pool = require('./pg/pg');

const setupSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });

    // Store active users: { userId: { sessionId, joinedAt, socket } }
    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        const userId = socket.handshake.query.userId;
        const sessionId = socket.handshake.query.sessionId;

        // Handle join event
        socket.on('join', (data) => {
            console.log('Join event:', data);
            
            // Store user info
            activeUsers.set(userId, {
                sessionId: data.sessionId,
                joinedAt: data.joinedAt,
                socket: socket
            });
            
            console.log(`User ${userId} joined session ${data.sessionId} at ${data.joinedAt}`);
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            
            const userInfo = activeUsers.get(userId);
            if (userInfo) {
                // Save attendance
                await saveAttendance(
                    userInfo.sessionId,
                    userId,
                    userInfo.joinedAt,
                    new Date().toISOString()
                );
                
                // Remove from active users
                activeUsers.delete(userId);
                
                console.log(`Attendance saved for user ${userId}`);
            }
        });
    });

    console.log('Socket.io server ready');
    return io;
};

const saveAttendance = async (sessionId, userId, joinedAt, leftAt) => {
    try {
        const tokenCheck = await pool.query(
            'SELECT * FROM session_tokens WHERE user_id = $1 AND session_id = $2',
            [userId, sessionId]
        );
        
        if (tokenCheck.rowCount === 0) {
            return;
        }
        
        // const existingAttendance = await pool.query(
        //     'SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2',
        //     [sessionId, userId]
        // );
        
        // if (existingAttendance.rowCount > 0) {
        //     console.log(`Attendance already exists for user ${userId}`);
        //     return;
        // }
        
        await pool.query(
            'INSERT INTO attendance (session_id, student_id, joined_at, left_at) VALUES ($1, $2, $3, $4)',
            [sessionId, userId, joinedAt, leftAt]
        );
        

        
    } catch (error) {
        console.error('Error saving attendance:', error);
    }
};

module.exports = { setupSocketIO };