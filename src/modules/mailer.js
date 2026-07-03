const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default;

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST || process.env.HOST,
    port: Number(process.env.MAIL_PORT || process.env.PORT_MAIL || 587),
    secure: String(process.env.MAIL_SECURE || 'false') === 'true',
    auth: {
        user: process.env.MAIL_USER || process.env.USER,
        pass: process.env.MAIL_PASS || process.env.PASS
    }
});

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}));

module.exports = transport;
