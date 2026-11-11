const pool = require("../pg/pg");
const { generateAccessToken } = require("../utils/tokens");
const jwt = require("jsonwebtoken")

exports.authMiddleware = async (req, res, next) => {
    const token = req.cookies.access;

    if (!token) {
        return res.status(401).json({ message: "NO_TOKEN" });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: err.message });
    }
}

exports.teacherAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.access;

    if (!token) {
        return res.status(401).json({ message: "NO_TOKEN" });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (user.role !== 'teacher') {
            return res.status(401).json({ message: "UNAUTHORIZED" });

        }
        
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: err.message });
    }
}

exports.verifyAcess = async (req, res, next) => {
    const token = req.cookies.access;

    if (!token) {
        return res.status(401).json({ message: "NO_TOKEN" });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        return res.status(200).json({ message: 'Acess' })
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "INVALID_TOKEN" });
    }
}

exports.verifyTeacher = async (req, res, next) => {
    const token = req.cookies.access;

    if (!token) {
        return res.status(401).json({ message: "NO_TOKEN" });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (user.role !== 'teacher') {
            return res.status(401).json({ message: "UNAUTHORIZED" });

        }
        req.user = user;
        return res.status(200).json({ message: 'Acess' })
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "INVALID_TOKEN" });
    }
}

exports.verifyRefreshToken = async (req, res, next) => {


    const refreshToken = req.cookies.refresh;
    if (!refreshToken)
        return res.status(401).json({ message: "Refresh token missing" });

    try {
        const result = await pool.query(
            "SELECT * FROM refreshtokens WHERE token = $1",
            [refreshToken]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });


            const payload = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            };

            const newAccessToken = generateAccessToken(payload);

            res.cookie("access", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });

            return res.status(200).json({ message: 'access token sent' })



        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};


