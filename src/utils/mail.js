import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config()


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_MAIL,
        pass: process.env.NODEMAILER_MAIL_PASSWORD
    },
});


export const sendOtpMail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.NODEMAILER_MAIL,
            to: email,
            subject: "OTP for Password Reset",
            text: `Your OTP for password reset is ${otp}`
        }

        const mail = await transporter.sendMail(mailOptions);

        return mail
    } catch (error) {
        console.log(error);
        return null;

    }

}