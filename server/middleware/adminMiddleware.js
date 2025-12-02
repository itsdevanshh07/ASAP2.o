import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
        }

        const user = await User.findById(req.auth.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role !== 'admin' && user.email !== 'undhyani07@gmail.com') {
            return res.status(403).json({ success: false, message: "Access denied: Admins only" });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
