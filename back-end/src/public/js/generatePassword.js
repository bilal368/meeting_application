let token, userId;
$(document).ready(function () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    // userId = params.id;
    token = params.token;
    console.log("token::", token)
    $.post("/api/fetchUserWithId", { "autheticationToken": token }, function (res) {

        console.log("details::", res[0].timezone)
        $("#firstName").val(res[0].firstName);
        $("#lastName").val(res[0].lastName);
        $("#timezone").val(res[0].timezone);
    });
    // $.get("/api/fetchUserWithId", { "autheticationToken": token }, function (res) {

    //     console.log("details::",res[0].timezone)
    //     $("#firstName").val(res[0].firstName);
    //     $("#lastName").val(res[0].lastName);
    //     $("#timezone").val(res[0].timezone);
    // });

    $.get("/api/fetchTimezone", function (res) {
        for (let i = 0; i < res.timezone.length; i++) {
            $('.timezone')
                .append($("<option></option>")
                    .attr("value", res.timezone[i].timezoneName)
                    .text(res.timezone[i].timezoneText));
        }
    });
});

function generatePassword(firstName, lastName, timezone, password, retypepassword) {
    try {
        let firstName = firstName;
        let lastName = lastName;
        let timezone = timezone;
        let password = password;
        let retypepassword = retypepassword;
        
        if (password == retypepassword) {
            $.post("/api/updateUserWithId", { "firstName": firstName, "lastName": lastName, "timezone": timezone, "password": password, "token": token }, function (res) {
                const result = res.status;
                const message = res.message;
                if (result == true) {
                    // Mail sending logic here
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: '587',
                        secure: false,
                        auth: {
                            user: 'speechlogixemailalert@gmail.com',
                            pass: 'wedc rtlv xwtg ywva',  // Your Gmail password or an application-specific password if you have 2-factor authentication enabled
                        },
                        tls: { rejectUnauthorized: false }
                      });
                    
                    let info =  transporter.sendMail({
                        from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                        to: email,
                        subject: "Successfully Generate password",
                        text: "Successfully Generate password",
                        html: `
                          <p>Hi ${firstName + " " + lastName},</p>
                          <p>Thank you for registering for Meetings+!</p>
                          <!-- Rest of the email content -->
                        `
                    });

                    console.log("Message sent: %s", info);
                    return true;
                }
            });
        } else {
            $("#passwordMismatchMessage").show();
            setTimeout(function () { $("#passwordMismatchMessage").hide(); }, 3000);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        // Handle the error, e.g., display an error message to the user
    }
}
