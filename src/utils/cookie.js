export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // send cookie over HTTPS only in production
    sameSite: "lax", // or 'strict' if you want tighter CSRF protection
    path: "/", // accessible across the whole app
  };