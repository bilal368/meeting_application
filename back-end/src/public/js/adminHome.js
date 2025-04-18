$(document).ready(function () {
    // On page load
    $("#createOrganisationButton").show();
    $("#editOrganisationButton").hide();
    $("#createOrganisation").text('Create Organisation');
    $(".createUserWrapper").hide();
    $(".listUserWrapper").hide();
    $(".createOrganisationWrapper").show();
    $(".listOrganisationWrapper").hide();
    $("#createOrganisation").css("color", "rgb(237 180 5)");
    $("#createUser").css("color", "black");
    $("#listOrganisation").css("color", "black");
    $("#listUser").css("color", "black");
    $("#editTemplate").hide();
    $("#emailTemplate").show();
    $(".createUserBtn").click(function () {
        $(".createUserWrapper").show();
        $(".listUserWrapper").hide();
        $(".createOrganisationWrapper").hide();
        $(".listOrganisationWrapper").hide();
        $("#createOrganisation").css("color", "black");
        $("#createUser").css("color", "rgb(237 180 5)");
        $("#listOrganisation").css("color", "black");
        $("#listUser").css("color", "black");
        $("input[name='createOrgnanisation']").val('');
        $("input[name='domainName']").val('');
        $("#timezone").val('');
        $("#emailTemplate").val(templateString);

    });
    $(".listUserBtn").click(function () {
        $(".listUserWrapper").show();
        $(".createUserWrapper").hide();
        $(".createOrganisationWrapper").hide();
        $(".listOrganisationWrapper").hide();
        $("#createOrganisation").css("color", "black");
        $("#createUser").css("color", "black");
        $("#listOrganisation").css("color", "black");
        $("#listUser").css("color", "rgb(237 180 5)");
        $.get("/api/mtn/user", function (res) {
            var acc = "<table border='1'><tr><th>Organisation</th><th>User Id</th><th>Email</th><th>Type</th><th>Date Created</th>" +
                "<th>Actions</th></tr>";
            for (let i = 0; i < res.length; i++) {
                const date = moment(res[i].date_created).format('MMMM Do YYYY h:mm:ss A');
                let out = "<tr><td>" + res[i].orgName + "</td>" +
                    "<td>" + res[i].zoom_user_id + "</td>" +
                    "<td>" + res[i].email_id + "</td>" +
                    "<td>" + res[i].user_type + "</td>" +
                    "<td>" + date + "</td>" +
                    "<td><button style='margin: 10px 10px 5px 5px;' onclick='deleteHandler(this);'>Delete</button></td></tr>"
                acc += out;
            }
            acc += "</table>";
            $(".listUserWrapper").html(acc);
        })

    });

    $(".createUserSubmit").click(function () {
        let user = $("input[name='createUserEmail']").val();
        let emailArr = user.split('@');
        let userName = emailArr[0];
        let domain = emailArr[1];
        let email = userName + '@devmtn.' + domain;
        let orgId = $("#selectOrganisation").val();
        let action = "custCreate";
        let type;
        if ($('#license').is(":checked")) {
            type = 2;
        }
        else {
            type = 1;
        }
        $.post("/api/mtn/user", { "email": email, "action": action, "type": type, "orgId": orgId }, function (data) {
            if (data.status == true) {
                $("input[name='createUserEmail']").val('');
                $("#selectOrganisation").val('');
                $("#license").prop("checked", false);
                $("#successMessage").show();
                setInterval(function () { $("#successMessage").hide() }, 3000);
            }
            else {
                $("#failureMessage").show();
                setInterval(function () { $("#failureMessage").hide() }, 3000);
            }
        });

    });
    function genAnchorTag(url, text) {
        var link = $("<a>");
        link.attr("href", url);
        link.text(text);
        return link;
    }
    // organisation section
    $(".createOrganisationBtn").click(function () {
        $("#createOrganisationButton").show();
        $("#editOrganisationButton").hide();
        $("#createOrganisation").text('Create Organisation');
        $(".createOrganisationWrapper").show();
        $(".createUserWrapper").hide();
        $(".listUserWrapper").hide();
        $(".listOrganisationWrapper").hide();
        $("#createOrganisation").css("color", "rgb(237 180 5)");
        $("#createUser").css("color", "black");
        $("#listOrganisation").css("color", "black");
        $("#listUser").css("color", "black");
        $("#organisation").val('');
        $("#domainName").val('');
        $("#timezone").val('');
    });

    $(".createOrganisationSubmit").click(function () {
        let organisation = $("input[name='createOrgnanisation']").val();
        let domainName = $("input[name='domainName']").val();
        let timezone = $("#timezone").val();
        let emailTemplate = $("#emailTemplate").html();
        let action = "custCreate";
        $.post("/api/mtn/organisation", { "organisation": organisation, "domainName": domainName, "timezone": timezone, "emailTemplate": emailTemplate, "action": action }, function (data) {
            if (data.status == true) {
                $("input[name='createOrgnanisation']").val('');
                $("input[name='domainName']").val('');
                $("#timezone").val('');
                // $("#emailTemplate").val('');
                $("#gmtTimeSection").hide();
                $("#organisationSuccessMessage").text('Organisation created successfully');
                $("#organisationSuccessMessage").show();
                setInterval(function () { $("#organisationSuccessMessage").hide() }, 3000);
            }
            else {
                $("#organisationFailureMessage").text('Organisation creation failed');
                $("#organisationFailureMessage").show();
                setInterval(function () { $("#organisationFailureMessage").hide() }, 3000);
            }
        });

    });
    $(".editOrganisationSubmit").click(function () {
        let organisation = $("input[name='createOrgnanisation']").val();
        let domainName = $("input[name='domainName']").val();
        let timezone = $("#timezone").val();
        let emailTemplate = $("#editTemplate").html();
        let organisationId = $("#organisationId").val();
        let action = "custCreate";
        $.post("/api/mtn/organisationUpdate", { "organisation": organisation, "domainName": domainName, "timezone": timezone, "emailTemplate": emailTemplate, "organisationId": organisationId, "action": action }, function (data) {
            if (data.status == true) {
                $("#organisationSuccessMessage").text('Organisation updated successfully');
                $("#organisationSuccessMessage").show();
                setInterval(function () { $("#organisationSuccessMessage").hide() }, 3000);
            }
            else {
                $("#organisationFailureMessage").text('Organisation updation failed');
                $("#organisationFailureMessage").show();
                setInterval(function () { $("#organisationFailureMessage").hide() }, 3000);
            }
        });

    });
    $(".listOrganisationBtn").click(function () {
        $(".createOrganisationWrapper").hide();
        $(".createUserWrapper").hide();
        $(".listUserWrapper").hide();
        $(".listOrganisationWrapper").show();
        $("#createOrganisation").css("color", "black");
        $("#createUser").css("color", "black");
        $("#listOrganisation").css("color", "rgb(237 180 5)");
        $("#listUser").css("color", "black");
        $.get("/api/mtn/organisation", function (res) {
            var acc = "<table border='1'><tr><th>Organisation</th><th>Domain Name</th>" +
                "<th colspan='2'>Actions</th></tr>";
            for (let i = 0; i < res.length; i++) {
                let out = "<tr class='orgName' id='" + res[i].orgId + "'><td >" + res[i].orgName + "</td><td >" + res[i].domainName + "</td>" +
                    "<td><button style='margin: 10px 10px 5px 5px;' onclick='zainOrganisationdeleteHandler(this);'>Delete</button></td>\
                    <td><button style='margin: 10px 10px 5px 5px;' onclick='zainOrganisationeditHandler(this);'>Edit</button></td></tr>"
                acc += out;
            }
            acc += "</table>";
            $(".listOrganisationWrapper").html(acc);
        })

    });
    // Organisation dropdown values
    $("#selectOrganisation").click(function () {
        $.get("/api/mtn/organisation", function (res) {
            for (let i = 0; i < res.length; i++) {
                $('#selectOrganisation')
                    .append($("<option></option>")
                        .attr("value", res[i].orgId)
                        .text(res[i].orgName));
            }

        });
        $("#selectOrganisation").html('');
    });
    
});
function signOutHandler(e) {
    window.location.href = "/logout"
}
function editHandler(e) {
    let zoom_user_id = $(e).closest("tr").find("td:eq(0)").html();
    let email = $(e).closest("tr").find("td:eq(1)").html();
    let action = "custCreate";
    let type = $('input[name="createUserLicense"]:checked').val();
    console.log("email %o", email);
    $(".createUserWrapper").show();
    $(".listUserWrapper").hide();
    $("input[name='createUserEmail']").val(email);
    isUserUpdate = true;
}
function deleteHandler(e) {
    console.log("delete handler %o", e);
    let zoom_user_id = $(e).closest("tr").find("td:eq(1)").html();
    $.ajax({
        type: "DELETE",
        url: "/api/mtn/zainUser/name/" + zoom_user_id,
        contentType: 'application/json'
    }).done(function (res) {
        console.log(res);
        if (res.message) {
            $(e).closest("tr").remove();
            viewNotification("User deleted successfully");
        }
    }).fail(function () {
        viewNotification("Error deleting user");
    });
}
function zainOrganisationdeleteHandler(e) {
    console.log("delete handler %o", e);
    let orgId = $('.orgName').attr('id');
    $.ajax({
        type: "DELETE",
        url: "/api/mtn/organisation/orgId/" + orgId,
        contentType: 'application/json'
    }).done(function (res) {
        console.log(res);
        if (res.message) {
            $(e).closest("tr").remove();
            viewNotification("User deleted successfully");
        }
    }).fail(function () {
        viewNotification("Error deleting user");
    });
}
function zainOrganisationeditHandler(e) {
    $("#editTemplate").show();
    $("#emailTemplate").hide();
    $("#createOrganisationButton").hide();
    $("#editOrganisationButton").show();
    $("#createOrganisation").text('Edit Organisation');
    let orgId = $(e).closest("tr").attr('id');
    $(".createOrganisationWrapper").show();
    $(".createUserWrapper").hide();
    $(".listUserWrapper").hide();
    $(".listOrganisationWrapper").hide();
    $("#createOrganisation").css("color", "rgb(237 180 5)");
    $("#createUser").css("color", "black");
    $("#listOrganisation").css("color", "black");
    $("#listUser").css("color", "black");
    $.get("/api/mtn/organisationForEdit", { "orgId": orgId }, function (res) {
        $("#organisation").val(res[0].orgName);
        $("#domainName").val(res[0].domainName);
        $("#timezone").val(res[0].timezone);
        $("#editTemplate").html(res[0].emailTemplate);
        $("#organisationId").val(res[0].orgId);


    })

}
function calcTime(e) {
    let timeValue = $(e).val();
    let offset = timeValue.replace(":", ".");
    let city = $("#timezone option:selected").text();
    // // create Date object for current location
    var d = new Date();

    // // convert to msec
    // // subtract local time zone offset
    // // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // // create new Date object for different city
    // // using supplied offset
    var nd = new Date(utc + (3600000 * offset));

    // return time as a string
    let displayTime = "The local time for city " + city + " is " + nd.toLocaleString();
    $("#gmtTimeSection").show();
    $("#displayTime").text(displayTime);
}
