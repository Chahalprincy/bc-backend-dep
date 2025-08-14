import { verifyToken } from "#utils/jwt";
import { getUserById } from "#db/queries/users";

export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) return next();
  
  const token = authorization.split(" ")[1];
  try {
    const { id } = verifyToken(token);
    const user = await getUserById(id);
    req.user = user;

    return next();
  } catch (error) {
    // If token is invalid, continue without setting req.user
    console.error("Invalid token:", error.message);
    return next(); // Use return to prevent further execution
  }
  next();
}
