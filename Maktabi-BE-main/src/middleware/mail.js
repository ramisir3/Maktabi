const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "softwareproject92@gmail.com",
    pass: "jwglydiwsqtqexxy",
  },
});

/** create reusable sendmail function 
@params {object} options - mail options (to, subject, text, html)
@params {function} callback - callback function to handle response
*/
const SENDMAIL = async (mailDetails, callback) => {
  try {
    const info = await transporter.sendMail(mailDetails)
    callback(info);
  } catch (error) {
    console.log(error);
  }
};

module.exports = SENDMAIL;