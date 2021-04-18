const sgMail = require('@sendgrid/mail')
const { text } = require('express')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) =>{
    sgMail.send({
        to: email,
        from: 'ankitdwivedi5155@gmail.com',
        subject: 'Welcome! Task Manager App',
        text: `welcome to the task manager app ${name}. `
    })
}

const  sendCancelationEmail = (name, email) =>{
    sgMail.send({
        to: email,
        from: 'ankitdwivedi5155@gmail.com',
        subject: 'Cancelation! task manager app',
        text: `thanks for joining ${name}. Is there anything which we could have done to kept you in!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}