const nodemailer = require("nodemailer");
const fs = require("fs");

const resetEmail = fs.readFileSync("email\\password_reset.html").toString();

function sendResetEmail(hash, email) {
    const transporter = nodemailer.createTransport({
        host: process.env.STMP_ENDPOINT,
        secure: true,
        port: process.env.STMP_PORT,
        auth: {
            user: process.env.STMP_USER,
            pass: process.env.STMP_PASS,
        }
    });

    try {
        transporter.sendMail({
            to: email,
            from: {
                address: "do-not-reply@dragleagues.com",
                name: "DragLeagues"
            },
            subject: "Password Reset",
            html: resetEmail.replace("{host}", process.env.APP_URL).replace("{hash}", encodeURIComponent(hash))
        });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    sendResetEmail
}