const isProduction = process.env.ENVIRONMENT === "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "lax" : "None", // "none" for dev to allow cross-site cookies
  path: "/"
};
