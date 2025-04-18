/* eslint-disable no-undef */
window.addEventListener('DOMContentLoaded', function (event) {
  console.log('DOM fully loaded and parsed');
  // websdkready();
  let meetingSDKElement = document.getElementById('meetingSDKElement');
});
var authEndpoint = '/signature';
var sdkKey = 'D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU'
// var meetingNumber = '83755275609'
var meetingNumber;
var passWord;
var role = 1
var userName;
var registrantToken = ''
var zakToken = ''
function getSignature() {

  console.log("Meeting Id::", $("#joinMeetingId").val());
  let meetingid = $("#joinMeetingId").val()
  $.post("/api/checkUserBundleBalance", { "loginId": loginId, "meetingId": meetingid }, function (res) {
    const result = res
    if (result.status == true) {
      console.log("RESPONSE::", result)
      meetingNumber = $("#joinMeetingId").val();
      passWord = $("#meetingPasscode").val();
      userName = $("#yourName").val();
      if (meetingNumber == "") {
        $("#joinMeetingId").css("border-color", "red");
        return false;
      }
      else if (userName == "") {
        $("#yourName").css("border-color", "red");
        return false;
      }
      else {
        $("#meetingSDKElement").css("display", "flex");
        fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meetingNumber: meetingNumber,
            role: 0
          })
        }).then((response) => {
          return response.json()
        }).then((data) => {
          console.log(data)
          startMeeting(data.signature)
        }).catch((error) => {
          console.log(error)
        })
      }
    }
    else {
      alert(result.error);
    }
  })

}

function startMeeting(signature) {
  console.log("zak", userName)
  const client = ZoomMtgEmbedded.createClient();

  // Set your init parameters
  const initParams = {
    zoomAppRoot: meetingSDKElement,
    language: 'en-US',
  };
  client.init(initParams);
  // Set your join params
  const joinParams = {
    signature: signature,
    sdkKey: sdkKey,
    meetingNumber: meetingNumber,
    password: passWord,
    userName: userName,
    userEmail: userEmail,
    tk: registrantToken,
    zak: zakToken
  };
  client.join(joinParams);
}

function StartInstantMeeting() {
  $("#usageHistorySection").hide();
  $("#newMeetingSection").show();
  $("#joinSection").hide();
  $("#sharescreenSection").hide();
  $("#scheduleMeetingSection").hide();
  $("#listMeetingSection").hide();

  //Checking the User Having Balance
  $.post("/api/checkHostbalance", { "loginId": loginId }, function (res) {
    console.log("Plan::", res.data.RemainingMinutes)
    let time_in_minutes = res.data.RemainingMinutes;

    console.log("email::", email)
    $.post("/api/instantMeeting", { "email": email }, function (res) {
      console.log("RESULT::", res)
      console.log("loginId::", loginId)

      meetingNumber = res.zoom_meeting_id;
      console.log("meetingNumber::", meetingNumber)
      passWord = res.password;
      zakToken = res.zak
      userName = username

      fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: 0
        })
      }).then((response) => {
        return response.json()
      }).then((data) => {
        console.log(data)
        startMeeting(data.signature)
      }).catch((error) => {
        console.log(error)
      })
    })

  })
}

