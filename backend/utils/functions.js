function generateRoomId(classId, teacherId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `class_${classId}_${teacherId}_${timestamp}_${random}`;
}

function validateJitsiToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
        throw new Error('Invalid token');
    }
}

module.exports = {
    generateRoomId,
    validateJitsiToken,
    
};