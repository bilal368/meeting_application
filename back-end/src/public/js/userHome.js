let reccurenceType;
//let validation = true;
$(document).ready(function () {
  // fetch timezone for dropdown
  $.get("/api/fetchTimezone", function (res) {
    for (let i = 0; i < res.timezone.length; i++) {
      $('.timezone')
        .append($("<option></option>")
          .attr("value", res.timezone[i].timezoneName)
          .text(res.timezone[i].timezoneText));
    }
  });
})
// signout
function signOutHandler(e) {
  window.location.href = "/logout"
}
// Save scheduled meeting
function saveMeeting() {
  $("#saveMeeting").css("background-color", "#eee");
  let topic = $("#topic").val();
  let type, scheduledData;
  let timezone = $("#timezone").val();
  let start_time = $("#start_time").val();
  start_time = start_time + "z";
  let duration = $("#duration").val();
  let password = $("#password").val();
  let host_video = $('#host_video').is(':checked');
  let participant_video = $('#participant_video').is(':checked');
  let join_before_host = $('#join_before_host').is(':checked');
  let waiting_room = $('#waiting_room').is(':checked');
  if ($('#recurrenceMeeting').is(':checked')) {
    reccurenceType = $("#reccurenceType").val();
    type = 8;
    if (reccurenceType == 1) {
      scheduledData = {
        topic: topic,
        type: type,
        start_time: start_time,
        duration: duration,
        password: password,
        timezone: timezone,
        settings: {
          host_video: host_video,
          participant_video: participant_video,
          join_before_host: join_before_host,
          waiting_room: waiting_room
        },
        recurrence: {
          type: 1,
          repeat_interval: 3,
          end_date_time: "2023-07-01T17:36:00Z"
        }

      }
    }
    else if (reccurenceType == 2) {
      scheduledData = {
        topic: topic,
        type: type,
        start_time: start_time,
        duration: duration,
        password: password,
        timezone: timezone,
        settings: {
          host_video: host_video,
          participant_video: participant_video,
          join_before_host: join_before_host,
          waiting_room: waiting_room
        },
        recurrence: {
          type: 2,
          repeat_interval: 2,
          weekly_days: 1,
          end_date_time: "2023-08-10T17:39:00Z"
        },

      }
    }
    else if (reccurenceType == 3) {
      scheduledData = {
        topic: topic,
        type: type,
        start_time: start_time,
        duration: duration,
        password: password,
        timezone: timezone,
        settings: {
          host_video: host_video,
          participant_video: participant_video,
          join_before_host: join_before_host,
          waiting_room: waiting_room
        },
        recurrence: {
          type: 2,
          repeat_interval: 2,
          weekly_days: 1,
          end_date_time: "2023-08-10T17:39:00Z"
        },

      }
    }
  }
  else {

    type = 2;
    scheduledData = {
      topic: topic,
      type: type,
      start_time: start_time,
      duration: duration,
      password: password,
      timezone: timezone,
      settings: {
        host_video: host_video,
        participant_video: participant_video,
        join_before_host: join_before_host,
        waiting_room: waiting_room
      },
      recurrence: {
        type: 3,
        repeat_interval: 1,
        monthly_day: 5,
        end_date_time: "2023-08-20T17:43:00Z"
      },
    }
  }
  if ($("#topic").val() != "") {
    $.post("/api/scheduleMeeting", { "email": email, "payload": scheduledData}, function (data) {
    })
  }
  else {
    $("#topic").css("border-color", "red");
    $("#saveMeeting").css("background-color", "#3E6317");
    return false;
  }
}
//Enable reccurrence meeting
function enableReccurenceMeeting() {
  if ($('#recurrenceMeeting').is(':checked')) {
    $("#reccurenceTypeSection").show();
  }
  else {
    $("#reccurenceTypeSection").hide();
  }
}
//change reccurence type
function changeRecurrenceType() {
  reccurenceType = $("#reccurenceType").val();
  if (reccurenceType == 1) {
    $("#dailyReccuringSetting").show();
    $("#monthlyReccuringSetting").hide();
    $("#weeklyReccuringSetting").hide();
  }
  else if (reccurenceType == 2) {
    $("#weeklyReccuringSetting").show();
    $("#dailyReccuringSetting").hide();
    $("#monthlyReccuringSetting").hide();
  }
  else if (reccurenceType == 3) {
    $("#monthlyReccuringSetting").show();
    $("#weeklyReccuringSetting").hide();
    $("#dailyReccuringSetting").hide();
  }
}
// Navigation 
// New Meeting
function newMeetingPopup() {
  $("#usageHistorySection").hide();
  $("#newMeetingSection").show();
  $("#joinSection").hide();
  $("#sharescreenSection").hide();
  $("#scheduleMeetingSection").hide();
  $("#listMeetingSection").hide();
}
function joinMeetingPopup() {
  $("#usageHistorySection").hide();
  $("#newMeetingSection").hide();
  $("#joinSection").show();
  $("#sharescreenSection").hide();
  $("#scheduleMeetingSection").hide();
  $("#listMeetingSection").hide();
}
function scheduleMeetingPopup() {
  $("#usageHistorySection").hide();
  $("#newMeetingSection").hide();
  $("#joinSection").hide();
  $("#sharescreenSection").hide();
  $("#scheduleMeetingSection").show();
  $("#listMeetingSection").hide();
}
function sharescreenPopup() {
  $("#usageHistorySection").hide();
  $("#newMeetingSection").hide();
  $("#joinSection").hide();
  $("#sharescreenSection").show();
  $("#scheduleMeetingSection").hide();
  $("#listMeetingSection").hide();
}
function usageHistoryPopup() {
  $("#usageHistorySection").show();
  $("#newMeetingSection").hide();
  $("#joinSection").hide();
  $("#sharescreenSection").hide();
  $("#scheduleMeetingSection").hide();
  $("#listMeetingSection").hide();
}
