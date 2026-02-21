import ApiError from "../Utils/ApiError.js";

const AdminMiddleware = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

export default AdminMiddleware;
