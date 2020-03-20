const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: 'pec.saumil@gmail.com',
      pass: 'saumiljain1994'
    }
  });

  exports.module= transporter;
//   var mailOptions = {
//     from: 'pec.saumil@gmail.com',
//     to: 'saumil.pec@gmail.com',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!'
//   };
  
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });