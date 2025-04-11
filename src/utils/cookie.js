const isProduction = process.env.ENVIRONMENT === "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // isProduction,
  sameSite: isProduction ? "lax" : "None", // "none" for dev to allow cross-site cookies
  path: "/"
};
