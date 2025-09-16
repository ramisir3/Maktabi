const HTML_TEMPLATE = require("../middleware/email_template");
const SENDMAIL = require("./mail");


const sendMail = (from, to, message, subject) => {
    try {
        const options = {
            from: from, // sender address
            to: to, // receiver email
            subject: subject, // Subject line
            text: message,
            html: HTML_TEMPLATE(message),
            attachments: [{
                filename: 'logo-no-background.png',
                path: '../Maktabi-BE/src/logo/logo-no-background.png',
                cid: 'logo'
            }],
        }

        SENDMAIL(options, (info) => {
            console.log("Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
        });
    } catch (err) {
        res.send(err)
    }
}

module.exports = sendMail