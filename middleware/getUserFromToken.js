import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";

export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];
  try {
    const { id } = verifyToken(token);
    const user = await getUserById(id);
    req.user = user;
  } catch (error) {
    console.error("Token verification failed:", error);
  }
  next();
}
