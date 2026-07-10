/**
 * middleware/authMiddleware.js
 * Express middlewares for verifying JWT authorization headers
 * and enforcing role-based endpoint permissions.
 */

const jwt = require('jsonwebtoken');

// Verifies Bearer JWT signature, attaching decoded payload to req.user
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if(!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
};

// Validates current user role membership and verifies teacher approval statuses
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied: insufficient role" })
        }

        if (req.user.role === 'teacher') {
            if(req.user.status !== 'approved') {
                return res.status(403).json({ message: "Teacher not approved yet" });
            }
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };