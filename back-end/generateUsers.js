const axios = require('axios');
const utils = require('../mtn-zoom-webportal/src/utils/utils');
const db = require('../mtn-zoom-webportal/src/config/dbconnection');
const util = require('util');
// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);
// const { generateZoomAccessToken } = require('./src/auth/zoomtoken');
// let accessToken;


const { generateZoomAccessToken } = require('./src/auth/zoomtoken');

let accessToken;

async function main() {
    try {
        accessToken = await generateZoomAccessToken();
        console.log("accessToken",accessToken);
        
    } catch (error) {
        logger.error('Error getting Zoom access token:', error);
        throw new Error('Could not get Zoom access token');
    }
}

var emailAddresses = [
  "dc9d78a76f4f@devmtn.com",
  "ad844f10b496@devmtn.com",
  "a3590d8630c4@devmtn.com",
  "bc7ef345b6c8@devmtn.com",
  "adf601e0c48e@devmtn.com",
  "a90e03d73c73@devmtn.com",
  "a2d51d72f790@devmtn.com",
  "cda2c5e276f5@devmtn.com",
  "a510bc9bf6eb@devmtn.com",
  "a4a0b6344aaf@devmtn.com",
  "aece4ffd7a08@devmtn.com",
  "fdd51787732c@devmtn.com",
  "ddc372deaabc@devmtn.com",
  "d001d3299a17@devmtn.com",
  "ac74aa01e3fa@devmtn.com",
  "a87f3a6537d3@devmtn.com",
  "faf86fe70343@devmtn.com",
  "aaec8df00bb0@devmtn.com",
  "f12bc3d157e0@mtn.com",
  "ad72e80c9edf@devmtn.com",
  "d61f24cef78a@devmtn.com",
  "ac5076a58732@devmtn.com",
  "bd70083197c2@devmtn.com",
  "a5ab79e6f789@devmtn.com",
  "a8eb16fa7d36@devmtn.com",
  "a71cdbf2bc5f@devmtn.com",
  "ac74f6574df5@devmtn.com",
  "b3bb16deec91@devmtn.com",
  "a6576bb5002d@devmtn.com",
  "a2014c49a309@devmtn.com",
  "a6679a66e969@devmtn.com",
  "a283c2633b85@devmtn.com",
  "a21ee68ed0f7@devmtn.com",
  "b65c9e9fb0cc@devmtn.com",
  "a20d57f70d2a@devmtn.com",
  "a2e733499532@devmtn.com",
  "a2620a1a3610@devmtn.com",
  "aba28594ac2c@devmtn.com",
  "aeccdbe66fc6@devmtn.com",
  "a6ac29412221@devmtn.com",
  "af070d95e8de@devmtn.com",
  "a7f199af30c9@devmtn.com",
  "a4955b8bf1b8@devmtn.com",
  "a7e5bb0806f5@devmtn.com",
  "b37b0451ccdc@devmtn.com",
  "a32ff044f941@devmtn.com",
  "a41aa141a126@devmtn.com",
  "a2e7fa57a888@devmtn.com",
  "a810119581c5@devmtn.com",
  "ae5b108751ad@devmtn.com",
  "a2ac9ff2907f@devmtn.com",
  "c6686dcad9ce@devmtn.com",
  "a9704a46c35a@devmtn.com",
  "aa47beb79a40@devmtn.com",
  "a563f0bb78e1@devmtn.com",
  "a8cb1091c360@devmtn.com",
  "afd038593263@devmtn.com",
  "a9959b379369@devmtn.com",
  "fa4b967af81c@devmtn.com",
  "b89702196364@devmtn.com",
  "a42aa63cbf75@devmtn.com",
  "a4b92c0b2823@devmtn.com",
  "e7b8240f2119@devmtn.com",
  "ab8c37d690de@devmtn.com",
  "a1aa814d962f@devmtn.com",
  "ab72d6adf5b9@devmtn.com",
  "ca5e72f0bd6f@devmtn.com",
  "c5c27c0c0d73@devmtn.com",
  "a71850bc13bd@devmtn.com",
  "a598406d0a11@devmtn.com",
  "a9b628eb9c08@devmtn.com",
  "a7b2397dbb58@devmtn.com",
  "d63a74b3fa27@devmtn.com",
  "a3ef0254d828@devmtn.com",
  "abcfb62afab3@devmtn.com",
  "a8bc9f53e535@devmtn.com",
  "a338eb4c44f8@devmtn.com",
  "a9fd789f3c2e@devmtn.com",
  "b57c882a84da@devmtn.com",
  "c5dd7b8ae8dc@devmtn.com",
  "ad31cd6927f9@devmtn.com",
  "acd41a410721@devmtn.com",
  "d9c62019452e@devmtn.com",
  "ad0e072f6a97@devmtn.com",
  "a4666eaccf99@devmtn.com",
  "a46f0bd524b7@devmtn.com",
  "c9414d197422@devmtn.com",
  "af87c44a623e@devmtn.com",
  "ab8891636e4c@devmtn.com",
  "fd15abe8ae18@devmtn.com",
  "a83b2fdc78bb@devmtn.com",
  "e5865400c86e@devmtn.com",
  "ec6c0bf75ab1@devmtn.com",
  "e84a2408c90e@devmtn.com",
  "a8107748ab0f@devmtn.com",
  "a909283b23ca@devmtn.com",
  "a3caae58197d@devmtn.com",
  "acb0db98e4f2@devmtn.com",
  "a87fa40cb317@devmtn.com",
  "cd0976ee7cd9@devmtn.com",
  "a7e66bcbc764@devmtn.com",
  "ced8de32dcfa@devmtn.com",
  "a760e3388221@devmtn.com",
  "a7dcf54f7f47@devmtn.com",
  "abc0a96b3d21@devmtn.com",
  "a643e0d71002@devmtn.com",
  "a74814912d3b@devmtn.com",
  "a42019f9166a@devmtn.com",
  "ecd9e816cffa@devmtn.com",
  "c5f3f4352404@devmtn.com",
  "a20f71c22f3f@devmtn.com",
  "b8ba47c88072@devmtn.com",
  "a0cb0aad8f4a@devmtn.com",
  "eee60987e6c3@devmtn.com",
];


//update email delete from zoom
// let emailuser = "hadayeh909@akoption.com"
async function processEmail(email) {
  try {
    db.updatewithzoomidEmail(email, async function (user) {
      if (user.length > 0) {
        try {
          await main()
          console.log("users::", user);
          let normalemail = user[0].userMail
          let mtnemail = user[0].email_id
          let timezone = user[0].timezone
          let firstName = user[0].firstName
          let lastName = user[0].lastName
          let phone = user[0].phone
          let zoom_user_id = user[0].zoom_user_id
          console.log("userMail::", user[0].userMail);
          console.log("email_id::", user[0].email_id);
          console.log("timezone::", user[0].timezone);
          console.log("firstName::", user[0].firstName);
          console.log("lastName::", user[0].lastName);
          console.log("zoom_user_id::", user[0].zoom_user_id);
          let lowercaseEmail = email.toLowerCase();
          let usermail = utils.toMTNEmail(lowercaseEmail)

          // deleting from zoom

          const response = await axios.delete(`https://api.zoom.us/v2/users/${mtnemail}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            params: {
              action: 'delete'
            }
          });
          console.log("response", response.data)
          console.log("email", usermail);
          // creating with same id
          let action = "custCreate";
          let orgId = "1";
          let createpayload = {
            "action": action,
            "user_info": {
              "email": usermail,
              "type": "1",
              "first_name": firstName,
              "last_name": lastName,
              "phone_number": phone
            }
          }
          let result, data, status = true;
          result = await axios.post('https://api.zoom.us/v2/users',

            createpayload, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }

          });
          data = result.data;
          if (result.status = 201) {
            console.log('sucesss', data);
            console.log(result.status);
            db.updatezoomidtables(data.id, data.email,mtnemail,lowercaseEmail, async function (user) {
              if (user == true) {
                console.log("updated user::", normalemail);
              }

            })
          } else {
            console.log(result.status);
          }

          return response;
        }
        catch (error) {
          console.error('Error creating user:', error.message);
          return null;
        }

      }
      else {
        console.log({error: "The customer with the provided email does not exist."});
        // res.status(404).send({ "error": "The customer with the provided email does not exist." })
      }

    })
  } catch (error) {
    console.error('Error processing email:', email, error.message);
  }
}




//create Users
//zoom user createv
async function createUser() {
  await main();
  const numUsers = 2;

  (async () => {
    for (let i = 0; i < numUsers; i++) {
      const firstName = `MTN User${i}`; // Replace with your own data
      const lastName = 'Speechlogix';   // Replace with your own data
      const phone = `6785674534232${i}`; // Replace with your own data
      const email = `testing${i}@mail.com`; // Replace with your own data or generate email as needed
      const timezone = 'Africa/Nigeria'; // Replace with your own data

      const userData = {
        firstName,
        lastName,
        phone,
        email,
        timezone
      };

      let action = "custCreate";
      let orgId = "1";

      // logger.info(`email: ${email}, action: ${action}, orgId: ${orgId}`);
      let createPayload = {
        "action": action,
        "user_info": {
          "email": email,
          "type": "1",
          "first_name": firstName,
          "last_name": lastName,
          "phone_number": phone
        }
      };

      try {
        let result = await axios.post('https://api.zoom.us/v2/users', createPayload, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        let data = result.data;
        console.log("created ::", data);
      } catch (error) {

        if (error.response && error.response.data && error.response.data.code === 3412) {
          // Handle the specific error with code 3412
          res.status(400).send({ error: "Your account has reached the maximum number of basic users. Please remove some users before adding another." });
        } else {
          // Handle other errors or provide a generic error message
          console.error('Error creating user:', error.message);
          // res.status(400).send({ error: "An error occurred." });
        }
      }
    }
  })();
}

// Call the function to create users

// createUser();

// var emailAddresses = [];
// const createCustomer = async (userData) => {
//   try {
//     const response = await axios.post('https://meetingsplus.xlogix.ca//mtnapi/createcustomer', userData, {
//     });
//     console.log('User created:', response.data);
//     console.log('token:',response.data.token);
//     return response.data,response.data.token;
//   } catch (error) {
//     console.error('Error creating user:', error.message);
//     return null;
//   }
// };

// const generatePassword = async (email,token, password) => {
//   try {
//     console.log("TOKEN TO GO",token)
//     const response = await axios.post('https://meetingsplus.xlogix.ca//api/updateUserWithId', { email,token, password });
//     console.log('Password generated:', response.data);
//   } catch (error) {
//     console.error('Error generating password:', error.message);
//   }
// };

// const numUsers = 10000;

// (async () => {
//   for (let i = 0; i < numUsers; i++) {
//     const firstName = `MTN User${i}`; // Replace with your own data
//     const lastName = 'Speechlogix';   // Replace with your own data
//     const phone = `6785674534232${i}`; // Replace with your own data
//     const email = `testingdeleting${i}@gmail.com`; // Replace with your own data or generate email as needed
//     const timezone = 'Africa/Nigeria'; // Replace with your own data

//     const userData = {
//       firstName,
//       lastName,
//       phone,
//       email,
//       timezone
//     };

//     // Create user and get the response data
//     const user = await createCustomer(userData);

//     if (user) {
//         console.log("user token",user)
//       // Generate a password for the user
//       const password = 'Speechlogix143'; // Replace with your password generation logic
//       await generatePassword(user.email,user, password);
//     }
//   }
// })();


const emailsToDelete = [

];


const delete1 = async (email) => {
  try {
    await main()
    const response = await axios.delete(`https://api.zoom.us/v2/users/${email}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        action: 'delete'
      }
    });
    console.log("response", response.data)
    return response;
  }


  catch (error) {
    console.error('Error creating user:', error.message);
    return null;
  }
};


// Now you can call the delete1 function
const email = '';
async function deleteEmails() {
  let numUsers = 10000
  for (let i = 0; i < numUsers; i++) {
    const email = `testing${i}@mail.com`;
    await delete1(email); // Replace with your own data or generate email as needed
    ;
  }
  // for (const email of emails) {
  //   await delete1(email);
  // }
}

// Call the function to delete the emails
// deleteEmails(emailsToDelete);

// deleteEmails();

// const user = delete1(emailsToDelete);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6bGE1LW5Ec1RfV1dyR1p3MTdFZFRBIiwiZXhwIjoxNjkwOTU5NTcyMzU4LCJpYXQiOjE2OTA5NTk1Njd9.4B6X2y22hjO7PzooZg3n5h67-JFc-KY8Xu0S_J4-4aw
//list the users
const listuserszoom = async (email) => {
  try {
    const response = await axios.get(`
    https://api.zoom.us/v2/users`, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6bGE1LW5Ec1RfV1dyR1p3MTdFZFRBIiwiZXhwIjoxNjkwOTU5NTcyMzU4LCJpYXQiOjE2OTA5NTk1Njd9.4B6X2y22hjO7PzooZg3n5h67-JFc-KY8Xu0S_J4-4aw`
      },

    });
    // console.log("response::",response.data.users)

    // Loop through each user and extract the email
    for (var i = 0; i < response.data.users.length; i++) {
      emailAddresses.push(response.data.users[i].email);
    }
    console.log("emailAddresses::", emailAddresses)

    return response;
  }


  catch (error) {
    console.error('Error creating user:', error.message);
    return null;
  }
};

  // listuserszoom()



// Iterate through the list of email addresses and process each one
(async () => {
  await main();
  for (const email of emailAddresses) {
      const user = await getZoomUser(email);
      if (user) {
          await update_pmi(user.email, user.pmi);
      }
  }
})();


async function update_pmi(email, pmi) {
  try {
    const data = await dbQueryPromise("UPDATE tb_users SET pmi = ? WHERE email_id = ?", [pmi, email]);
    // return data.insertId;
      return data.affectedRows;
  } catch (err) {
      console.error("Error updating user PMI:", err);
      return -1;
  }
}


async function getZoomUser(email) {
  try {
      const result = await axios.get(`https://api.zoom.us/v2/users/${email}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log("result",result);
      
      return result.data;
  } catch (error) {
    // console.log("error",error);
    
      // logger.error(`User not found on Zoom: ${email}`);
      return null; // Return null instead of throwing
  }
}



