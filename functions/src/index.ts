//@ts-nocheck
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');
// Configure the email transport using the Fdefault SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const mailTransport = nodemailer.createTransport({
  service: 'Gmail',
  port: 465,
  secure: true,
  auth: {
    user: 'icheckit.v2@gmail.com',
    pass: 'ztgkfodwqvqbvfrh',
  },
});
const APP_NAME = 'iCheckit';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

const db = admin.firestore();
const settings = { timeStampInSnapshots: true };
db.settings(settings);

exports.adminCreateStudent = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      response.set('Access-Control-Allow-Origin', '*');
      const body = request.body;
      const displayName = body.displayName;
      /*
        const section = body.section;
        const course = body.course;
        const contactNumber = body.contactNumber;
        */
      const email = body.email;
      const password = 'password';

      admin
        .auth()
        .createUser({
          email: email,
          emailVerified: false,
          password: password,
          displayName: displayName,
          disabled: false,
        })
        .then((userRecord) => {
          const mailOptions = {
            from: `${APP_NAME} <noreply@firebase.com>`,
            to: email,
            subject: `Welcome to ${APP_NAME}!`,
            // html: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
            html: `<div style="margin: auto; background-color: white; height: auto;justify-content: center;">
            <div style="padding: 1rem;">
                <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
                <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
                <p style="margin-top: 2rem;"> iCheckit </p>
            </div>
            <div style="padding: 1rem; font-size: 100%;">
                <p> Hello, ${displayName}</p>
                <p> Welcome to ${APP_NAME}. This application is a task list and notification system for the students of the
                    College of Information and Computing Sciences that will help remind the students on accomplishing
                    non-curricular tasks such as Satisfaction Surveys and Faculty Evaluation that we usually forget to do
                    because of our academic load. You must download the application to your device to receive push
                    notification about new tasks or updated tasks assigned to you and you will also be able to submit your
                    proof of completion on these tasks once you downloaded the application. </p>
                <p> We hope that in creating this app to notify every one of us on the non-curricular tasks, we will have an
                    organized system of task completion and verification under our College.
                </p>
                <p> That would be all for now! Enjoy exploring iCheckIt! </p>
                <p style="margin-top: 5rem;"> Kind regards, </ps>
                <p> iCheckIt team </p>
            </div>
        </div>`,
          };
          functions.logger.log('New welcome email sent to:', email);
          setTimeout(() => {
            mailTransport.sendMail(mailOptions);
          }, 1000);
          return response.status(200).send({
            message: 'successfully created user',
            userRecord,
          });
        })
        .catch((error) => {
          return response.status(400).send('Failed to create user: ' + error);
        });
    }
  });
});

exports.deleteUser = functions.firestore
  .document('users/{id}')
  .onDelete((snap, context) => {
    const deletedValue = snap.data();
    const userEmail = deletedValue.email;

    return admin
      .auth()
      .getUserByEmail(userEmail)
      .then((userRecord) => {
        const userID = userRecord.uid;
        return admin.auth().deleteUser(userID);
      })
      .catch((error) => {
        console.log(error.message);
        return null;
      });
  });

exports.updateUser = functions.firestore
  .document('users/{id}')
  .onUpdate((change, context) => {
    const updatedValues = change.after.data();
    // const userEmail = deletedValue.email;
    const uid = updatedValues.uid;
    const userEmail = updatedValues.email;
    const displayName = updatedValues.displayName;
    return admin
      .auth()
      .getUser(uid)
      .then((userRecord) => {
        const userID = userRecord.uid;
        return admin.auth().updateUser(userID, {
          displayName: displayName,
          email: userEmail,
        });
      })
      .catch((error) => {
        console.log(error.message);
        return null;
      });
  });

exports.sendPushNotification = functions.firestore
  .document('tasks/{taskId}')
  .onCreate((event) => {
    // Access data required for payload notification
    const data = event.data();
    const taskTitle = data.title;
    const uploadedBy = data.uploadedBy;
    const pushTokens = data.pushTokens;
    const deadline = data.deadline;
    const recipients = data.recipients;
    const description = data.description;

    // Determine the message

    pushTokens.forEach((element: any) => {
      if (element.pushToken == '') {
        console.log('no push token');
      } else if (element.pushToken != '') {
        const payload = {
          notification: {
            title: taskTitle,
            body: 'A new task has been uploaded. Click on this notification to open the application.',
            sound: 'default',
            badge: '1',
          },
        };
        console.log(payload);
        console.log('sent to :', element.pushToken);
        return admin.messaging().sendToDevice(element.pushToken, payload);
      }
    });
    recipients.forEach((element: any) => {
      if (element.email == '') {
        console.log('no email');
      } else if (element.email != '') {
        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: element.email,
          subject: `New Task Assignment - <${taskTitle}>`,
          // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
          // html: `<h2>A new task has been uploaded for you.</h2>
          // <p>1.) ${taskTitle}</p>
          // <p>- ${description}
          // <ul>
          // <li>Uploaded by: ${uploadedBy}</li>
          // <li>Deadline: ${new Date(deadline).toUTCString()}</li>
          // </ul>
          // <br>
          // <p>Please submit your proof of completion on or before the said deadline</p>
          // `
          html: `
      <div style="margin: auto; background-color: white; height: auto; justify-content: center;">
          <div style="padding: 1rem;">
              <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
              <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
              <p style="margin-top: 2rem;"> iCheckit </p>
          </div>
          <div style="padding: 1rem; font-size: 100%;">
              <p> A new task has been assigned to you for your compliance. Click the button to open the task in your
                  mobile application to see the task instructions.
              </p>
          </div>
          <hr style="background-color: black; width: 90%;">
          <div style="padding: 1rem; font-size: 100%;">
              <p><b>Task Details</b></p>
              <span style="padding-left: 2rem;">Task title: ${taskTitle}</span> <br>
              <span style="padding-left: 2rem;">Task Description: ${description}</span> <br>
              <span style="padding-left: 2rem;">Task Deadline: ${deadline}</span> <br>
              <span style="padding-left: 2rem;">Uploaded By: ${uploadedBy} </span><br>
          </div>
      </div>
  `,
        };
        setTimeout(() => {
          mailTransport.sendMail(mailOptions);
        }, 1000);
      }
    });
    // // Get the user's tokenID
    // var pushToken = "";
    // return functions
    // .firestore
    //   .collection("Users/{user-ID}")
    //   .get()
    //   .then((doc) => {
    //     pushToken = doc.data().tokenID;
    //     // Send the message to the device
    //     return admin.messaging().sendTodevice(pushToken, message)
    //   });
  });

exports.sendEmail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      if (request.body.pushToken != '') {
        response.set('Access-Control-Allow-Origin', '*');
        console.log('may push token');
        const body = request.body;
        const email = body.email;
        const uploadedBy = body.uploadedBy;
        const title = body.title;
        const deadline = body.deadline;
        const description = body.description;
        const message = body.message;
        const status = body.status;
        const instructions = body.instructions;

        // Determine the message
        const payload = {
          notification: {
            title: `${status} - <${title}>`,
            body: `${message}`,
            badge: '1',
          },
        };

        // update student status
        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: email,
          subject: `${status} - <${title}>`,
          // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
          // html: `<h2>${message}</h2>
          // <p>1.) ${title}</p>
          // <p>- ${description}
          // <ul>
          // <li>Uploaded by: ${uploadedBy}</li>
          // <li>Deadline: ${new Date(deadline).toUTCString()}</li>
          // </ul>
          // <br>
          // <p>${instructions}</p>
          // `
          html: `
          <div style="margin: auto; background-color: white; height: auto;justify-content: center;">
          <div style="padding: 1rem;">
              <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
              <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
              <p style="margin-top: 2rem;"> iCheckit </p>
          </div>
          <div style="padding: 1rem; font-size: 100%;">
              <p> Thank you for submitting your proof of completion! </p>
              <p> ${message}.</p>
              <p> ${instructions}.</p>
          </div>
          <hr style="background-color: black; width: 90%;">
          <div style="padding: 1rem; font-size: 100%;">
          <p style="padding-left: 2rem;"><b>Submission Details</b></p>
          <span style="padding-left: 2rem;">Task title: ${title}</span> <br>
          <span style="padding-left: 2rem;">Task Description: ${description}</span> <br>
          <span style="padding-left: 2rem;">Task Deadline: ${deadline}</span> <br>
          <span style="padding-left: 2rem;">Uploaded By: ${uploadedBy} </span> <br>
          </div>
      </div>
      `,
        };
        functions.logger.log('updated task status email sent to:', email);

        // return admin.messaging().sendToDevice(element.pushToken, payload)

        return admin
          .messaging()
          .sendToDevice(request.body.pushToken, payload)
          .then((res) => {
            console.log(res);
            setTimeout(() => {
              mailTransport.sendMail(mailOptions);
            }, 1000);
            return response.status(200).send({
              message: 'sent email to' + email,
            });
          })
          .catch((err) => {
            return response.status(400).send('Failed to create user: ' + err);
          });
      }
      if (request.body.pushToken == '') {
        console.log('no push token');
        const body = request.body;
        const email = body.email;
        const uploadedBy = body.uploadedBy;
        const title = body.title;
        const deadline = body.deadline;
        const description = body.description;
        const message = body.message;
        const status = body.status;
        const instructions = body.instructions;

        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: email,
          subject: `${status} - <${title}>`,
          // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
          // html: `<h2>${message}</h2>
          // <p>1.) ${title}</p>
          // <p>- ${description}
          // <ul>
          // <li>Uploaded by: ${uploadedBy}</li>
          // <li>Deadline: ${new Date(deadline).toUTCString()}</li>
          // </ul>
          // <br>
          // <p>${instructions}</p>
          // `
          html: `<body style="background-color: #7d1d2d">
          <div style="margin: auto; background-color: white; height: auto;justify-content: center;">
              <div style="padding: 3rem;">
                  <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
                  <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
                  <p style="margin-top: 2rem;"> iCheckit </p>
              </div>
              <div style="padding: 3rem; font-size: 100%;">
                  <p> Thank you for submitting your proof of completion! </p>
                  <p> ${message}.</p>
                  <p> ${instructions}.</p>
              </div>
              <hr style="background-color: black; width: 75%;">
              <div style="padding: 2rem; font-size: 100%;">
                  <p style="padding-left: 2rem;"><b>Submission Details</b></p>
                  <span style="padding-left: 2rem;">Task title: ${title}</span> <br>
                  <span style="padding-left: 2rem;">Task Description: ${description}</span> <br>
                  <span style="padding-left: 2rem;">Task Deadline: ${deadline}</span> <br>
                  <span style="padding-left: 2rem;">Uploaded By: ${uploadedBy} </span> <br>
              </div>
          </div>
      
          <!-- <div style="padding: 3rem;">
              <button style="background-color: red; width: auto; height: auto; color: white;"> Open iCheckit </button>
          </div> -->
      </body>`,
        };
        functions.logger.log('updated task status email sent to:', email);
        setTimeout(() => {
          mailTransport.sendMail(mailOptions);
        }, 1000);
        return response.status(200).send({
          message: 'sent email to' + email,
        });
      }
    }
  });
});

exports.emailForApproval = functions.firestore
  .document('tasks/{id}/recipients/{userId}')
  .onUpdate((change, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = change.after.data();

    // ...or the previous value before this update
    const previousValue = change.before.data();

    // access a particular field as you would any JS property
    const status = newValue.status;

    console.log(newValue);
    console.log(previousValue);
    console.log(status);

    // perform desired operations ...
  });

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  console.log(user);
});

// exports.updateEmail = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     if (request.method !== "POST") {
//       response.status(405).send("Method Not Allowed");
//     } else {
//       const body = request.body;
//       const recipients = body.recipients;
//       /*
//         const section = body.section;
//         const course = body.course;
//         const contactNumber = body.contactNumber;
//         */

//         recipients.forEach(element => {
//         const mailOptions = {
//           from: `${APP_NAME} <noreply@firebase.com>`,
//           to: element.email,
//           subject: `${APP_NAME} has been updated!`,
//           // html: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
//           html: `<div style="margin: auto; background-color: white; height: auto;justify-content: center;">
//         <div style="padding: 1rem;">
//             <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
//             <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
//             <p style="margin-top: 2rem;"> iCheckit </p>
//         </div>
//         <div style="padding: 1rem; font-size: 100%;">
//             <p> Hello, ${APP_NAME}</p>
//             <p> Welcome to ${APP_NAME}. This application is a task list and notification system for the students of the
//                 College of Information and Computing Sciences that will help remind the students on accomplishing
//                 non-curricular tasks such as Satisfaction Surveys and Faculty Evaluation that we usually forget to do
//                 because of our academic load. You must download the application to your device to receive push
//                 notification about new tasks or updated tasks assigned to you and you will also be able to submit your
//                 proof of completion on these tasks once you downloaded the application. </p>
//             <p> We hope that in creating this app to notify every one of us on the non-curricular tasks, we will have an
//                 organized system of task completion and verification under our College.
//             </p>
//             <p> That would be all for now! Enjoy exploring iCheckIt! </p>
//             <p style="margin-top: 5rem;"> Kind regards, </ps>
//             <p> iCheckIt team </p>
//         </div>
//     </div>`,
//         };
//         functions.logger.log('New welcome email sent to:', email);
//         mailTransport.sendMail(mailOptions);
//         return response.status(200).send({
//           message: 'successfully created user',
//           userRecord
//         });
//       });
//     }
//   }
//   );
// });
exports.taskUpdatedEmail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      response.set('Access-Control-Allow-Origin', '*');
      const body = request.body;
      const recipients = body.recipients;
      const title = body.title;
      const description = body.description;
      const deadline = body.deadline;

      /*
            const section = body.section;
            const course = body.course;
            const contactNumber = body.contactNumber;
            */
      recipients.forEach((element: any) => {
        if (element.pushToken != '') {
          const payload = {
            notification: {
              title: title + ' has been updated',
              body: 'Open the mobile app to view the changes to the task.',
              sound: 'default',
              badge: '1',
            },
          };

          return admin
            .messaging()
            .sendToDevice(element.pushToken, payload)
            .then(() => {
              response.status(200).send({
                message: 'push notif sent to' + element.email,
              });
            });
        }
        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: element.email,
          subject: `${title} has been updated!`,
          // html: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
          html: `
                <div style="margin: auto; background-color: white; height: auto; justify-content: center;">
          <div style="padding: 1rem;">
              <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
              <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
              <p style="margin-top: 2rem;"> iCheckit </p>
          </div>
          <div style="padding: 1rem; font-size: 100%;">
              <p> The task ${title} has been updated. Please visit the mobile application to view the updates to the task
              </p>
          </div>
          <hr style="background-color: black; width: 90%;">
          <div style="padding: 1rem; font-size: 100%;">
              <p><b>Task Details</b></p>
              <span style="padding-left: 2rem;">Task title: ${title}</span> <br>
              <span style="padding-left: 2rem;">Task Description: ${description}</span> <br>
              <span style="padding-left: 2rem;">Task Deadline: ${deadline}</span> <br>
          </div>
      </div>
                `,
        };
        // const payload = {
        //   notification: {
        //     title: `${title} has updates!`,
        //     body: `There has been updates to the task ${title}. Click here to open the application.`,
        //     badge: '1'
        //   }
        // }

        setTimeout(() => {
          mailTransport.sendMail(mailOptions);
        }, 1000);
        //  return admin.messaging().sendToDevice(element.pushToken, payload).then((res) => {
        //   console.log(res)
        //   functions.logger.log('updated task email sent to:', element.email)
        //     mailTransport.sendMail(mailOptions)
        //     return response.status(200).send({
        //       message: 'email sent to' + element.email
        //     });
        // }).catch((err) => {
        //   return response.status(400).send("Failed to create user: " + err);
        // })
      });
    }
  });
});

exports.taskClosedEmail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      response.set('Access-Control-Allow-Origin', '*');
      const body = request.body;
      const recipients = body.recipients;

      /*
            const section = body.section;
            const course = body.course;
            const contactNumber = body.contactNumber;
            */
      recipients.forEach((element: any) => {
        if (element.pushToken != '') {
          const payload = {
            notification: {
              title: element.title + ' has been closed',
              body: 'The submission for this task has been closed.',
              sound: 'default',
              badge: '1',
            },
          };

          return admin
            .messaging()
            .sendToDevice(element.pushToken, payload)
            .then(() => {
              response.status(200).send({
                message: 'push notif sent to' + element.email,
              });
            });
        }

        //  return admin.messaging().sendToDevice(element.pushToken, payload).then((res) => {
        //   console.log(res)
        //   functions.logger.log('updated task email sent to:', element.email)
        //     mailTransport.sendMail(mailOptions)
        //     return response.status(200).send({
        //       message: 'email sent to' + element.email
        //     });
        // }).catch((err) => {
        //   return response.status(400).send("Failed to create user: " + err);
        // })
      });
    }
  });
});

exports.taskCreatedEmail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      response.set('Access-Control-Allow-Origin', '*');
      const body = request.body;
      const recipients = body.recipients;
      const title = body.title;
      const description = body.description;
      const deadline = body.deadline;

      recipients.forEach((element: any) => {
        if (element.pushToken != '') {
          const payload = {
            notification: {
              title: title + ' has been created',
              body: 'Open the mobile app to view the changes to the task.',
              sound: 'default',
              badge: '1',
            },
          };

          return admin
            .messaging()
            .sendToDevice(element.pushToken, payload)
            .then(() => {
              response.status(200).send({
                message: 'push notif sent to' + element.email,
              });
            });
        }

        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: element.email,
          subject: `${title} has been created!`,
          // html: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
          html: `
                <div style="margin: auto; background-color: white; height: auto; justify-content: center;">
          <div style="padding: 1rem;">
              <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
              <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
              <p style="margin-top: 2rem;"> iCheckit </p>
          </div>
          <div style="padding: 1rem; font-size: 100%;">
              <p> The task ${title} has been created. Please visit the mobile application to view the new task
              </p>
          </div>
          <hr style="background-color: black; width: 90%;">
          <div style="padding: 1rem; font-size: 100%;">
              <p><b>Task Details</b></p>
              <span style="padding-left: 2rem;">Task title: ${title}</span> <br>
              <span style="padding-left: 2rem;">Task Description: ${description}</span> <br>
              <span style="padding-left: 2rem;">Task Deadline: ${deadline}</span> <br>
          </div>
      </div>
                `,
        };
        // const payload = {
        //   notification: {
        //     title: `${title} has updates!`,
        //     body: `There has been updates to the task ${title}. Click here to open the application.`,
        //     badge: '1'
        //   }
        // }

        setTimeout(() => {
          mailTransport.sendMail(mailOptions);
        }, 1000);
        //  return admin.messaging().sendToDevice(element.pushToken, payload).then((res) => {
        //   console.log(res)
        //   functions.logger.log('updated task email sent to:', element.email)
        //     mailTransport.sendMail(mailOptions)
        //     return response.status(200).send({
        //       message: 'email sent to' + element.email
        //     });
        // }).catch((err) => {
        //   return response.status(400).send("Failed to create user: " + err);
        // })
      });
    }
  });
});

exports.importUsers = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
    } else {
      response.set('Access-Control-Allow-Origin', '*');
      const body = request.body;
      const users = body.users;

      console.log(body);

      console.log('USERS', users);
      console.log('TYPE OF USERS', typeof users);
      if (users && users?.length > 0) {
        const userRecords = users.map((user) => {
          console.log('TARGET USER', user);
          return admin
            .auth()
            .createUser({
              email: user?.email,
              emailVerified: false,
              password: 'password',
              displayName: user?.displayName,
              disabled: false,
            })
            .then((userRecord) => {
              console.log('userRecord inside', userRecord);
              const mailOptions = {
                from: `${APP_NAME} <noreply@firebase.com>`,
                to: user?.email,
                subject: `Welcome to ${APP_NAME}!`,
                // html: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
                html: `<div style="margin: auto; background-color: white; height: auto;justify-content: center;">
            <div style="padding: 1rem;">
                <!-- <img src="/logo.png" style="max-height: 80px; max-width: 80px; margin-top: 2rem;" />
                <img src="/cics.png" style="max-height: 80px; max-width: 100px; margin-top: 2rem;" /> -->
                <p style="margin-top: 2rem;"> iCheckit </p>
            </div>
            <div style="padding: 1rem; font-size: 100%;">
                <p> Hello, ${user?.displayName}</p>
                <p> Welcome to ${APP_NAME}. This application is a task list and notification system for the students of the
                    College of Information and Computing Sciences that will help remind the students on accomplishing
                    non-curricular tasks such as Satisfaction Surveys and Faculty Evaluation that we usually forget to do
                    because of our academic load. You must download the application to your device to receive push
                    notification about new tasks or updated tasks assigned to you and you will also be able to submit your
                    proof of completion on these tasks once you downloaded the application. </p>
                <p> We hope that in creating this app to notify every one of us on the non-curricular tasks, we will have an
                    organized system of task completion and verification under our College.
                </p>
                <p> That would be all for now! Enjoy exploring iCheckIt! </p>
                <p style="margin-top: 5rem;"> Kind regards, </ps>
                <p> iCheckIt team </p>
            </div>
        </div>`,
              };
              functions.logger.log('New welcome email sent to:', user?.email);
              setTimeout(() => {
                mailTransport.sendMail(mailOptions);
              }, 1000);

              return userRecord;
            })
            .catch((error) => {
              console.log('ERROR', error);
              return null;
            });
        });

        console.log('user records', userRecords);

        Promise.all(userRecords).then((res) => {
          if (!res.includes(undefined) && !res.includes(null)) {
            return response.status(200).send({
              message: 'Successfully imported users',
              res,
            });
          } else {
            return response.status(200).send({
              message:
                'WARN: one or more has failed to create, because the email already exists in our database',
              res,
            });
          }
        });
      } else {
        return response.status(400).send('Input is empty');
      }
    }
  });
  /*
    if (file) {
      admin
        .auth()
        .importUsers(
          file,
          {
            hash: {
              //@ts-ignore
              algorithm: SCRYPT,
              base64_signer_key: Buffer.from(
                'pfDMwMrCcnct5jHlaVHP4mKy5iW2fzyiu2IF4l9e6rCt109R9JVqUJvkI0PtuPQ9wUDXe//GFtauSn9VpYZNBg==',
                'base64'
              ),
              base64_salt_separator: Buffer.from('Bw==', 'base64'),
              rounds: 8,
              mem_cost: 14,
            },
          }
        )
        .then((results: any) => {
          results.errors.forEach((indexedError: any) => {
            console.log(`Error importing user ${indexedError.index}`);
          });
        })
        .catch((error: any) => {
          console.log('Error importing users :', error);
        });
    }
    */
});
