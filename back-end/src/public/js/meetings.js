let users = [];
let participants = [];
function iOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
function detectOS() {
    if (!iOS()) {
        $(".startMeetingButtonIos").hide();
        $(".startMeetingAndroid").show();
    }
    else {
        $(".startMeetingButtonIos").show();
        $(".startMeetingAndroid").hide();
    }


}
$(document).ready(function () {
    var scrolled = 0;
    detectOS();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let user = params.email;
    let emailArr = user.split('@');
    let userName = emailArr[0];
    let domain = emailArr[1];
    let organisationDomain = domain;
    let email = userName + '@isv.' + domain;
    // let email = user;
    $.get('/api/mtn/user', function (data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].email_id == email) {
                if (data[i].type == 2) {
                    $("#addMeetingButton").show();
                    $("#meetingFilter").show();
                    $(".listMeetingBtn").css("display", "flex");
                    $(".inviteMeetingBtn").show();
                    $(".listMeetingWrapper").show();
                    $(".listMeetingBtn").css("border-bottom", "5px solid #22427d");

                }
                else {
                    $("#addMeetingButton").hide();
                    $("#meetingFilter").hide();
                    $(".listMeetingBtn").hide();
                    $(".inviteMeetingBtn").css("border-bottom", "5px solid #22427d");
                    $(".invitedMeetingWrapper").show();
                    $("#noMeeting").hide();
                }

            }
        }
    })
    // filters
    let hostedMeeting = $(".hostedMeeting").length;
    let invitedMeeting = $(".invitedMeeting").length;
    let allMeeting = hostedMeeting + invitedMeeting;
    $("#all").text("ALL(" + allMeeting + ")");
    $("#own").text("OWN(" + hostedMeeting + ")");
    $("#invited").text("INVITES(" + invitedMeeting + ")");


    $("#all").click(function () {

        $("#all").css("background-color", "#22427d");
        $("#all").css("color", "whitesmoke");
        $("#own").css("background-color", "whitesmoke");
        $("#own").css("color", "black");
        $("#invited").css("background-color", "whitesmoke");
        $("#invited").css("color", "black");
        $(".hostedMeeting").show();
        $(".invitedMeeting").show();
    });
    $("#own").click(function () {
        $("#all").css("background-color", "whitesmoke");
        $("#all").css("color", "black");
        $("#own").css("background-color", "#22427d");
        $("#own").css("color", "whitesmoke");
        $("#invited").css("background-color", "whitesmoke");
        $("#invited").css("color", "black");
        $(".hostedMeeting").show();
        $(".invitedMeeting").hide();
    });
    $("#invited").click(function () {
        $("#all").css("background-color", "whitesmoke");
        $("#all").css("color", "black");
        $("#own").css("background-color", "whitesmoke");
        $("#own").css("color", "black");
        $("#invited").css("background-color", "#22427d");
        $("#invited").css("color", "whitesmoke");
        $(".hostedMeeting").hide();
        $(".invitedMeeting").show();
    });
    // create meeting
    $(".createMeetingSubmit").click(function () {
        let validation = true;
        // Use Javascript
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        var ss = today.getSeconds();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        if (hr < 10) {
            hr = '0' + hr
        }
        if (min < 10) {
            min = '0' + min
        }
        if (ss < 10) {
            ss = '0' + ss
        }
        today = yyyy + '-' + mm + '-' + dd + 'T' + hr + ':' + min + ':' + ss;
        if ($('#meetingTopic').val() == "") {
            $("#meetingTopic").focus();
            $("#meetingTopic").css('border-color', 'orange');
            $("#meetingTopic").animate({
                scrollBottom: scrolled
            });
            return false;
        } else if ($('#scheduledDate').val() == "") {
            $("#scheduledDate").focus();
            $("#scheduledDate").css('border-color', 'orange');
            $("#scheduledDate").animate({
                scrollBottom: scrolled
            });
            return false;
        }
        else if ($('#scheduledDate').val() < today) {
            $("#timeValidation").show();
            $("#scheduledDate").animate({
                scrollBottom: scrolled
            });
            return false;

        }
        $(".createMeetingSubmit").css("background-color", "#eee");
        $(".createMeetingSubmit").css("color", "black");
        let email = userName + '@isv.' + domain;
        let pathEmail = user;
        let meetingTopic = $('#meetingTopic').val();
        let scheduledDate = $('#scheduledDate').val();
        var d = new Date(scheduledDate);
        var utcDate = d.getUTCDate();
        var utcMonth = d.getUTCMonth() + 1;
        var utcYear = d.getUTCFullYear();
        var utcHour = d.getUTCHours();
        var utcMinutes = d.getUTCMinutes();
        var utcSeconds = d.getUTCSeconds();
        if (utcDate < 10) {
            utcDate = '0' + utcDate
        }
        if (utcMonth < 10) {
            utcMonth = '0' + utcMonth
        }
        if (utcHour < 10) {
            utcHour = '0' + utcHour
        }
        if (utcMinutes < 10) {
            miutcMinutesn = '0' + utcMinutes
        }
        if (utcSeconds < 10) {
            utcSeconds = '0' + utcSeconds
        }
        var utcScheduledDate = utcYear + '-' + utcMonth + '-' + utcDate + ' ' + utcHour + ':' + utcMinutes + ':' + utcSeconds;
        $(".participantTableRow").each(function (i, e) {
            participants.push($(e).attr("id"));
        })
        $.post("/api/mtn/meeting", { "email": email, "meetingTopic": meetingTopic, "scheduledDate": utcScheduledDate, "users": participants }, function (data) {
            if (data.status == true) {
                $("#successMessage").show();
                $(".createMeetingSubmit").hide();
                setTimeout(function () { $("#successMessage").hide(); }, 3000);
                if ($("table tr").length != 0) {
                    $("#mailBodyLabel").show();
                    $("#mailBody").show();
                    $("#sentMail").show();
                    let zainJoinUrl = 'https://meetings.xlogix.ca/?type=join&meetingNo=' + data.data.id + '&password=';
                    let mailBody = user + " is inviting you to a scheduled Zain meeting.\n Zain Url\n " + zainJoinUrl + "\n Zoom Url\n" + data.data.join_url + "";
                    $("#mailBody").val(mailBody);
                    $("#joinLink").val(data.data.join_url);
                    $("#zainJoinLink").val(zainJoinUrl);
                    $("#hostName").val(user);
                    scrolled = scrolled + 300;

                    $("#mailBody").animate({
                        scrollTop: scrolled
                    });

                    for (let k = 0; k < users.length; k++) {
                        let userArray = users[k].split("@");
                        let domain = userArray[1];
                        if (domain.startsWith("isv")) {
                            domain = domain.substr(4);
                            email = userArray[0] + "@" + domain;
                            users[k] = email;

                        }
                    }
                    let userString = String(users);
                }
                else {
                    location.reload(true);
                }

            }
            else {
                $("#errorMessage").show();
            }
        });
        $.get("/api/mtn/meetings", { "email": email }, function () {
        });
    });
    // Edit meeting
    $(".editMeetingSubmit").click(function () {
        let validation = true;
        // Use Javascript
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        var ss = today.getSeconds();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        if (hr < 10) {
            hr = '0' + hr
        }
        if (min < 10) {
            min = '0' + min
        }
        if (ss < 10) {
            ss = '0' + ss
        }
        today = yyyy + '-' + mm + '-' + dd + 'T' + hr + ':' + min + ':' + ss;
        if ($('#meetingTopic').val() == "") {
            $("#meetingTopic").focus();
            $("#meetingTopic").css('border-color', 'orange');
            $("#meetingTopic").animate({
                scrollBottom: scrolled
            });
            return false;
        } else if ($('#scheduledDate').val() == "") {
            $("#scheduledDate").focus();
            $("#scheduledDate").css('border-color', 'orange');
            $("#scheduledDate").animate({
                scrollBottom: scrolled
            });
            return false;
        }
        else if ($('#scheduledDate').val() < today) {
            $("#timeValidation").show();
            $("#scheduledDate").animate({
                scrollBottom: scrolled
            });
            return false;

        }
        $(".editMeetingSubmit").css("background-color", "#eee");
        $(".editMeetingSubmit").css("color", "black");
        let email = userName + '@isv.' + domain;
        let pathEmail = user;
        let meetingTopic = $('#meetingTopic').val();
        let scheduledDate = $('#scheduledDate').val();
        let meetingId = parseInt($('#meetingId').val());
        let joinUrl = $("#zoomJoinUrl").val();
        var d = new Date(scheduledDate);
        var utcDate = d.getUTCDate();
        var utcMonth = d.getUTCMonth() + 1;
        var utcYear = d.getUTCFullYear();
        var utcHour = d.getUTCHours();
        var utcMinutes = d.getUTCMinutes();
        var utcSeconds = d.getUTCSeconds();
        if (utcDate < 10) {
            utcDate = '0' + utcDate
        }
        if (utcMonth < 10) {
            utcMonth = '0' + utcMonth
        }
        if (utcHour < 10) {
            utcHour = '0' + utcHour
        }
        if (utcMinutes < 10) {
            miutcMinutesn = '0' + utcMinutes
        }
        if (utcSeconds < 10) {
            utcSeconds = '0' + utcSeconds
        }
        var utcScheduledDate = utcYear + '-' + utcMonth + '-' + utcDate + ' ' + utcHour + ':' + utcMinutes + ':' + utcSeconds;
        $(".participantTableRow").each(function (i, e) {
            participants.push($(e).attr("id"));
        })

        $.post("/api/mtn/meetingUpdate", { "email": email, "meetingTopic": meetingTopic, "scheduledDate": utcScheduledDate, "users": participants, "meetingId": meetingId, "joinUrl": joinUrl }, function (data) {
            if (data.status == true) {
                $("#editSuccessMessage").show();
                setTimeout(function () { $("#editSuccessMessage").hide(); }, 3000);
                $("#sentMail").show();
                $("#mailBody").show();
                let zainJoinUrl = 'https://meetings.xlogix.ca/?type=join&meetingNo=' + meetingId + '&password=';
                let mailBody = user + " is inviting you to a scheduled Zain meeting.\n Zain Url\n " + zainJoinUrl + "\n Zoom Url\n" + joinUrl + "";
                $("#mailBody").val(mailBody);
                $("#joinLink").val(joinUrl);
                $("#zainJoinLink").val(zainJoinUrl);
                $("#hostName").val(user);
                scrolled = scrolled + 300;

                $("#mailBody").animate({
                    scrollTop: scrolled
                });

                for (let k = 0; k < users.length; k++) {
                    let userArray = users[k].split("@");
                    let domain = userArray[1];
                    if (domain.startsWith("isv")) {
                        domain = domain.substr(4);
                        email = userArray[0] + "@" + domain;
                        users[k] = email;

                    }
                }
                let userString = String(users);

            }
            else {
                $("#errorMessage").show();
            }
        });
    });
    $("#sentMail").click(function () {
        $("#sentMail").css("background-color", "#eee");
        $("#sentMail").css("color", "black");
        setTimeout(function () { location.reload(true); }, 3000);
        let meetingTopic = $('#meetingTopic').val();
        let mailBody = $("#mailBody").val();
        let joinLink = $("#joinLink").val();
        let zainJoinLink = $("#zainJoinLink").val();
        let meetingId = parseInt($('#meetingId').val()) || 0;
        let hostName = $("#hostName").val();
        let scheduledDate = $("#scheduledDate").val().replace("T", " ");
        $(".participantTableRow").each(function (i, e) {
            participants.push($(e).attr("id"));
        })
        for (let k = 0; k < users.length; k++) {
            let userArray = users[k].split("@");
            let domain = userArray[1];
            if (domain.startsWith("isv")) {
                domain = domain.substr(4);
                email = userArray[0] + "@" + domain;
                users[k] = email;

            }
        }
        let userString = String(users);
        $.post("/api/mtn/sentMail", { "meetingTopic": meetingTopic, "mailBody": mailBody, "users": userString, "joinLink": joinLink, "zainJoinLink": zainJoinLink, "meetingId": meetingId, "organisationDomain": organisationDomain, "hostName": hostName, "scheduledDate": scheduledDate }, function (data) {
        })

    })
    function genAnchorTag(url, text) {
        var link = $("<a>");
        link.attr("href", url);
        link.text(text);
        return link;
    }
    //Popup from avatar
    var moveLeft = 0;
    var moveDown = 0;
    $('a.popper').click(function (e) {

        var target = '#' + ($(this).attr('data-popbox'));
        $(target).show();
        moveLeft = $(this).outerWidth();
        moveDown = ($(target).outerHeight() / 2);
    }, function () {
        var target = '#' + ($(this).attr('data-popbox'));
        if (!($("a.popper").hasClass("show"))) {
            $(target).hide();
        }
    });
    $('a.popper').click(function (e) {
        var target = '#' + ($(this).attr('data-popbox'));
        if (!($(this).hasClass("show"))) {
            $(target).show();
        }
        $(this).toggleClass("show");
    });
    $(".close").click(function () {
        $(".popbox").hide();
    });

});
function copyUrl(meetingId) {
    let joinUrl = $("#joinUrl" + meetingId).val();
    let zoomJoinUrl = $("#zoomJoinUrl" + meetingId).val();
    let url = " Zain Url\n " + joinUrl + " \n Zoom Url\n " + zoomJoinUrl + "";
    copy(url);
    $("#copyButton" + meetingId).hide();
    $("#copiedButton" + meetingId).show();
    setTimeout(function () { $("#copyButton" + meetingId).show(); }, 3000);
    setTimeout(function () { $("#copiedButton" + meetingId).hide(); }, 3000);
    // setTimeout(function () { $("#copyUrl" + meetingId).val(''); }, 3000);

}
function copyXlogixStartUrl(i) {
    $("#copyXlogixStartButton" + i + "").hide();
    $("#copiedXlogixStartButton" + i + "").show();
    setTimeout(function () { $("#copyXlogixStartButton" + i + "").show(); }, 3000);
    setTimeout(function () { $("#copiedXlogixStartButton" + i + "").hide(); }, 3000);
    var copyText = document.getElementById("xlogixStartUrl" + i + "");
    copy(copyText.value);
}
function copyXlogixJoinUrlForOthers(i) {
    $("#copyXlogixJoinButtonForOthers" + i + "").html('Copied');
    setTimeout(function () { $("#copyXlogixJoinButtonForOthers" + i + "").html('Copy For Others'); }, 3000);
    var copyText = document.getElementById("xlogixJoinUrlForOthers" + i + "");
    copy(copyText.value);
}
function copy(text) {
    var input = document.createElement('input');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}
function createMeetingPopUp() {
    dateValidation();
    $("#meetingHeading").text("CREATE NEW MEETING");
    $("#createMeeting").css("display", "flex");
    $("#modifyMeeting").hide();
    $("#meetingTopic").val('');
    $("#scheduledDate").val('');
    $("#searchUser").val('');
    $("#mailBody").val('');
    $("#joinLink").val('');
    // Get the modal
    var modal = document.getElementById("myModal");
    $("#myModal").show()
    // Get the button that opens the modal
    var btn = document.getElementById("addMeetingButton");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks on <span> (x), close the modal
    $(".close").click(function () {
        modal.style.display = "none";
        location.reload(true);
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.reload(true);
        }
    }

    // select all checkbox
    $("#checkAll").on('change', function () {
        users = [];
        var ischecked = $(this).is(':checked');
        if (ischecked) {
            $(".userCheckbox").attr('checked', this.checked)
            var count = $(".userCheckbox:checked").length;
            for (let i = 1; i <= count; i++) {
                $('#checkUser' + i + ':checked').each(function () {
                    users.push($(this).val());
                    let convertedEmail = convertFromIsv($(this).val());
                    $("#participantSection").show();
                    $("#viewParticipants").append("<tr id='" + $(this).val() + "' class='participantTableRow'>\
        <td class='participant'>"+ convertedEmail + "</td>\
        <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipant(this)' class='fa fa-trash-o'></i>\
        </td>\
    </tr>")
                    // Alternate colour for table rows
                    $("tr:even").css("background-color", "rgb(95 145 213)");
                    $("tr:odd").css("background-color", "rgb(166 202 233)");
                })

            }
        }
        else {
            $("#viewParticipants").html('');
            $('.userCheckbox').prop('checked', false);
        }
    });
    // Search user
    $("#searchUser").click(function () {
        $(".userListSection").show();
    })
    $('#searchUser').on('keyup', function () {
        $("#selectAllUsers").hide();
        if ($('#searchUser').val() == "") {
            $(".userListSection").hide();
        }
        else {
            $(".userListSection").show();
        }
        var value = this.value.toLowerCase().trim();
        $("#usersList li").show().filter(function () {
            return $(this).text().toLowerCase().trim().indexOf(value) == -1;
        }).hide();

    });
    $("#addExternal").on('click', function () {
        $("#participantSection").show();
        let externalUser = $("#addParticipant").val();
        if ($("#addParticipant").val() != "") {
            $("#viewParticipants").append("<tr id='" + externalUser + "' class='participantTableRow'>\
      <td class='participant'>"+ externalUser + "<sup class='externalIndicator'>EXT</sup></td>\
      <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipant(this)' class='fa fa-trash-o'></i>\
      </td>\
  </tr>")
            users.push(externalUser);
        }
        $("#addParticipant").val('');
        // Alternate colour for table rows
        $("tr:even").css("background-color", "rgb(95 145 213)");
        $("tr:odd").css("background-color", "rgb(166 202 233)");
    });
    $('#addParticipant').on('keyup', function () {
        let text = $("#addParticipant").val();
        if (text.includes("@") == true && text.includes(".com") == true) {
            $(".participantsButton").css("background", "#22427d");
            $(".participantsButton").css("color", "whitesmoke");
        }
    });
    $("#participantSection").hide();
    $("#participantSearch").show();
    $("#participantAdd").hide();
    $(".internalSpan").css("background", "#22427d");
    $(".internalSpan").css("color", "white");
    $(".externalSpan").css("background", "whitesmoke");
    $(".externalSpan").css("color", "black");

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let user = params.email;
    let emailArr = user.split('@');
    let userName = emailArr[0];
    let domain = emailArr[1];
    let email = userName + '@isv.' + domain;
    $.get(`/api/mtn/organisationUser?domainName=${domain}`, function (data) {
        // let email = user;
        let html = ""; users = [];
        for (let j = 0; j < data.length; j++) {
            let userEmails = data[j].email_id;
            if (userEmails != email) {
                let convertedEmail = convertFromIsv(data[j].email_id);
                // $(".selectUser" + i + "").append("<option value='" + data[j].email_id + "'>" + data[j].email_id + "</option>");
                html += "<li class='userListItem'><label class='participantName' data-email=" + data[j].email_id + ">" + convertedEmail + "</label><input name='selector[]' id='checkUser" + j + "' name='chk' class='userCheckbox participantCheckbox'  type='checkbox' onclick = 'checkclick(" + j + ")' value='" + data[j].email_id + "'></li>";
            }
        }
        $(".selectUser").html(html);
    })
    $("#closeUser").click(function () {
        $(".userListSection").hide();
    })

}
function checkclick(vald) {
    $("#checkUser" + vald).on('change', function () {
        var ischecked = $(this).is(':checked');
        if (ischecked) {
            $('#checkUser' + vald + ':checked').each(function () {
                users.push($(this).val());
                let convertedEmail = convertFromIsv($(this).val());
                $("#participantSection").show();
                $("#viewParticipants").append("<tr id='" + $(this).val() + "' data-id = '" + $(this).val() + "' class='participantTableRow'>\
            <td class='participant'>"+ convertedEmail + "</td>\
            <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipant(this)'  class='fa fa-trash-o'></i>\
            </td>\
        </tr>")
                // Alternate colour for table rows
                $("tr:even").css("background-color", "rgb(95 145 213)");
                $("tr:odd").css("background-color", "rgb(166 202 233)");
            })
        } else {
            $("tr[data-id='" + $(this).val() + "']").remove();
        }
    });


}

function deleteHandler(e, zoom_meeting_id, meetingTopic) {
    e.preventDefault();
    // Get the modal
    var modal = document.getElementById("deleteMeetingPopup");
    $("#deleteMeetingPopup").show();
    // Get the button that opens the modal
    // var btn = document.getElementById("addMeetingButton");
    $("#no").click(function () {
        modal.style.display = "none";
    });
    $("#yes").click(function () {
        $("#confirmationsection").show();
        $("#deletingMessage").hide();
        $.ajax({
            type: "DELETE",
            url: "/api/mtn/meetings/meetingId/" + zoom_meeting_id,
            contentType: 'application/json'
        }).done(function (res) {
            console.log(res);
            if (res.message) {
                $("#deleteMeetingPopup").hide();
                $("#meetingCard" + zoom_meeting_id).remove();
                $.post("/api/mtn/zainSentMailForDelete", { "zoomMeetingId": zoom_meeting_id, "meetingTopic": meetingTopic }, function (data) {
                    console.log('Data',data);
                })
            }
        }).fail(function () {
        });

    });
}
function editHandler(zoom_meeting_id) {
    dateValidation();
    $("#meetingHeading").text("EDIT MEETING");
    $("#createMeeting").hide();
    $("#modifyMeeting").css("display", "flex");
    $("#searchUser").val('');
    $("#mailBody").val('');
    $("#timeValidation").hide();
    $.get("/api/mtn/editMeeting", { "zoom_meeting_id": zoom_meeting_id }, function (res) {
        let scheduledDate = res[0].scheduled_date.replace("T", " ").replace("Z", "");
        $("#meetingTopic").val(res[0].meeting_topic);
        $("#meetingId").val(res[0].zoom_meeting_id);
        $("#zoomJoinUrl").val(res[0].zoom_join_url);
        $("#scheduledDate").val(scheduledDate);
        for (let i = 0; i < res[1].length; i++) {
            let convertedEmail = convertFromIsv(res[1][i].email);
            $("#participantSection").show();
            $("#viewParticipants").append("<tr id='" + res[1][i].email + "' class='participantTableRow'>\
            <td class='participant'>"+ convertedEmail + "</td>\
            <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipantFromDb(this,"+ zoom_meeting_id + ")' class='fa fa-trash-o'></i>\
            </td>\
        </tr>");
            // Alternate colour for table rows
            $("tr:even").css("background-color", "rgb(95 145 213)");
            $("tr:odd").css("background-color", "rgb(166 202 233)");
        }
    });
    // Get the modal
    var modal = document.getElementById("myModal");
    $("#myModal").show()
    // Get the button that opens the modal
    var btn = document.getElementById("addMeetingButton");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks on <span> (x), close the modal
    $(".close").click(function () {
        modal.style.display = "none";
        $(".participantTable").html('');
        location.reload(true);
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            $(".participantTable").html('');
            location.reload(true);
        }
    }

    // select all checkbox
    $("#checkAll").click(function () {
        users = [];
        $(".userCheckbox").attr('checked', this.checked);
        var count = $(".userCheckbox:checked").length;
        for (let i = 1; i <= count; i++) {
            $('#checkUser' + i + ':checked').each(function () {
                users.push($(this).val());
                $("#participantSection").show();
                $("#viewParticipants").append("<tr id='" + $(this).val() + "' class='participantTableRow'>\
        <td class='participant'>"+ $(this).val() + "</td>\
        <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipant(this)' class='fa fa-trash-o'></i>\
        </td>\
    </tr>")
                // Alternate colour for table rows
                $("tr:even").css("background-color", "rgb(95 145 213)");
                $("tr:odd").css("background-color", "rgb(166 202 233)");
            })
        }
    });
    // Search user
    $("#searchUser").click(function () {
        $(".userListSection").show();
        //check invited users
        $.get(`/api/mtn/getInvitedUsers?meetingId=${zoom_meeting_id}`, function (data) {
            for (j = 0; j < data.length; j++) {
                $('li input[type=checkbox]').filter(function () {
                    return this.value === data[j].email;
                }).prop('checked', true);
            }

        });
    })
    $('#searchUser').on('keyup', function () {
        $("#selectAllUsers").hide();
        if ($('#searchUser').val() == "") {
            $(".userListSection").hide();
        }
        else {
            $(".userListSection").show();
        }
        var value = this.value.toLowerCase().trim();
        $("#usersList li").show().filter(function () {
            return $(this).text().toLowerCase().trim().indexOf(value) == -1;
        }).hide();
        //check invited users
        $.get(`/api/mtn/getInvitedUsers?meetingId=${zoom_meeting_id}`, function (data) {
            for (j = 0; j < data.length; j++) {
                $('li input[type=checkbox]').filter(function () {
                    return this.value === data[j].email;
                }).prop('checked', true);
            }

        });
    });
    $("#addExternal").on('click', function () {
        let externalUser = $("#addParticipant").val();
        if ($("#addParticipant").val() != "") {
            $("#viewParticipants").append("<tr id='" + externalUser + "' class='participantTableRow'>\
      <td class='participant'>"+ externalUser + "<sup class='externalIndicator'>EXT</sup></td>\
      <td align='right'><i style='font-size:22px;padding: 5px;' onclick='removeParticipant(this)' class='fa fa-trash-o'></i>\
      </td>\
  </tr>")
            users.push(externalUser);
        }
        $("#addParticipant").val('');
        // Alternate colour for table rows
        $("tr:even").css("background-color", "rgb(95 145 213)");
        $("tr:odd").css("background-color", "rgb(166 202 233)");
    });
    $('#addParticipant').on('keyup', function () {
        let text = $("#addParticipant").val();
        if (text.includes("@") == true && text.includes(".com") == true) {
            $(".participantsButton").css("background", "#22427d");
            $(".participantsButton").css("color", "whitesmoke");
        }

    });
    $("#participantSection").hide();
    $("#participantSearch").show();
    $("#participantAdd").hide();
    $(".internalSpan").css("background", "#22427d");
    $(".internalSpan").css("color", "white");
    $(".externalSpan").css("background", "whitesmoke");
    $(".externalSpan").css("color", "black");

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let user = params.email;
    let emailArr = user.split('@');
    let userName = emailArr[0];
    let domain = emailArr[1];
    let email = userName + '@isv.' + domain;
    $.get(`/api/mtn/organisationUser?domainName=${domain}`, function (data) {
        // let email = user;
        let html = ""; users = [];
        for (let j = 0; j < data.length; j++) {
            let userEmails = data[j].email_id;
            if (userEmails != email) {
                let convertedEmail = convertFromIsv(data[j].email_id);
                // $(".selectUser" + i + "").append("<option value='" + data[j].email_id + "'>" + data[j].email_id + "</option>");
                html += "<li class='userListItem'><label class='participantName' data-email=" + data[j].email_id + ">" + convertedEmail + "</label><input name='selector[]' id='checkUser" + j + "' name='chk' class='userCheckbox participantCheckbox' type='checkbox' onclick = 'checkclick(" + j + ")' value='" + data[j].email_id + "'></li>";
            }
        }
        $(".selectUser").html(html);
    })
    $("#closeUser").click(function () {
        $(".userListSection").hide();
    })


}
function internalUsers() {
    // $(".userListSection").show();
    $("#participantSearch").show();
    $("#participantAdd").hide();
    $(".internalSpan").css("background", "#22427d");
    $(".internalSpan").css("color", "whitesmoke");
    $(".externalSpan").css("background", "whitesmoke");
    $(".externalSpan").css("color", "black");

} function externalUsers() {
    $("#searchUser").val('');
    $("#addParticipant").val('');
    $(".userListSection").hide();
    $("#participantAdd").show();
    $("#participantSearch").hide();
    $(".externalSpan").css("background", "#22427d");
    $(".externalSpan").css("color", "whitesmoke");
    $(".internalSpan").css("background", "whitesmoke");
    $(".internalSpan").css("color", "black");
}
function removeParticipant(e) {
    $(e).closest("tr").remove();
    $(e).closest("tr").html('');
}
function removeParticipantFromDb(e, id) {
    let email = $(e).closest("tr").attr('id');
    let meetingTopic = $("#meetingTopic").val();
    $.ajax({
        type: "DELETE",
        url: "/api/mtn/participant/zoomMeetingId/" + '?id=' + id + '&email=' + email,
        contentType: 'application/json'
    }).done(function (res) {
        console.log(res);
        if (res.message) {
            $(e).closest("tr").remove();
            $(e).closest("tr").html('');
            $.post("/api/sentMailForRemovedUser", { "zoomMeetingId": id, "meetingTopic": meetingTopic, "email": email }, function (data) {
            })
            viewNotification("User deleted successfully");
        }
    }).fail(function () {
        viewNotification("Error deleting user");
    });
}
function dateValidation() {
    // Use Javascript
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
    var yyyy = today.getFullYear();
    var hr = today.getHours();
    var min = today.getMinutes();
    var ss = today.getSeconds();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    if (hr < 10) {
        hr = '0' + hr
    }
    if (min < 10) {
        min = '0' + min
    }
    if (ss < 10) {
        ss = '0' + ss
    }
    today = yyyy + '-' + mm + '-' + dd + 'T' + hr + ':' + min + ':' + ss;
    document.getElementById("scheduledDate").setAttribute("min", today);
}
function convertToIsv() {

}
function convertFromIsv(inputMail) {
    let userArray = inputMail.split("@");
    let domain = userArray[1];
    if (domain.startsWith("isv")) {
        domain = domain.substr(4);
        inputMail = userArray[0] + "@" + domain;
    }
    return inputMail;
}
function hostPopup(meetingId) {
    $("#popUp" + meetingId).show();
    setTimeout(function () { $("#popUp" + meetingId).hide(); }, 3000);

}
function participantPopup(meetingId) {
    $("#participantPopup" + meetingId).show();
    setTimeout(function () { $("#participantPopup" + meetingId).hide(); }, 3000);

}
function allParticipantPopup(meetingId) {
    $("#popUpAll" + meetingId).show();
    setTimeout(function () { $("#popUpAll" + meetingId).hide(); }, 3000);
}
function inviteHostavatar(meetingId) {
    $("#pop" + meetingId).show();
    setTimeout(function () { $("#pop" + meetingId).hide(); }, 3000);

}
function inviteParticipantavatar(meetingId) {
    $("#pop" + meetingId).show();
    setTimeout(function () { $("#pop" + meetingId).hide(); }, 3000);

}
function inviteAllParticipantavatar(meetingId) {
    $("#popAll" + meetingId).show();
    setTimeout(function () { $("#popAll" + meetingId).hide(); }, 3000);

}