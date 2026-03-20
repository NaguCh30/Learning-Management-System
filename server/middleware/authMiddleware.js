const jwt = require('jsonwebtoken');

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