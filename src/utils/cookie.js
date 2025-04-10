const isProduction = process.env.ENVIRONMENT === "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // isProduction,
  sameSite: "none", // isProduction ? "lax" : "none", // "none" for dev to allow cross-site cookies
  path: "/"
};
