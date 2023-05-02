const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email{
    constructor(user,url)
    {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Vihitha <${process.env.EMAIL_FROM}>`;
    }
     newTransport ()
     {
        if(process.env.NODE_ENV === 'production')
        {
            //sendgrid
            return 1;
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        }
        );

     }
    async send(template,subject){
        //send actual mail
        //1. Render HTML baed on pug template
      const html =   pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
        firstName:this.firstName,
        url:this.url,
        subject
      });

        //2.Define email option
        const mailOptions={
            from:this.from,
            to: this.to,
            subject,
            html,
            text:htmlToText.fromString(html)
            //html:
        };

        //3.Create a transport and send email
        // this.newTransport();
        await  this.newTransport().sendMail(mailOptions);

     }
    async sendWelcome(){
    await this.send('welcome','Welcome to natours family');
     }

     async sendPasswordReset()
     {
        await this.send('passwordReset','Your password reset token.Valid for only 10 mins');
     }
};

    // const sendEmail= async options=>
    // {

    //1.Create transportor
    // const transporter = nodemailer.createTransport({
    //     host:process.env.EMAIL_HOST,
    //     port:process.env.EMAIL_PORT,
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         pass:process.env.EMAIL_PASSWORD
    //     }
    // }
    // );
  
    //2.Define email option
    // const mailOptions={
    //     from:'Vihitha <admin@gmail.com>',
    //     to: options.email,
    //     subject:options.subject,
    //     text:options.message
    //     //html:
    // };

    

    //3.Actually send the email
//  await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;