import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "caribbeandigitalunion@gmail.com",
    pass: "cub_app_secure_auth_2026",
  },
});
transporter.sendMail({
  from: '"Test" <no-reply@caribbeanunionbank.com>',
  to: "test@example.com",
  subject: "Test",
  text: "Test"
}).then(console.log).catch(console.error);
