import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

import 'firebase/storage';


// import * as firestore from '@google-cloud/firestore';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private afs: AngularFirestore,
    readonly fire: AngularFireAuth,
    private http: HttpClient,
    public toastService: ToastService,
    public router: Router
  ) { }

  getVerificationTask(): Observable<any> {
    return this.afs
      .collection('verificationTasks')
      .doc('60ThDEIPXLwWD8aHYs8E')
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return { id: doc.payload.id, ...doc.payload.data() };
        })
      );
  }
  public getVerifyTasks(): Observable<any> {
    return this.afs
      .collection('tasks', (ref) => ref.where('status', '==', 'Pending'))
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public getTaskRecipients(): Observable<any> {
    return this.afs
      .collection('tasks', (ref) => ref.orderBy('type', 'desc'))
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public setRecipients(scope: string): Observable<any> {
    return this.afs
      .collection('users', (ref) => ref.where('section', '==', scope))
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public getTask(id: string): Observable<any> {
    return this.afs
      .collection('tasks', (ref) => ref.where('taskId', '==', id))
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return { id: doc.payload.id, ...doc.payload.data() };
        })
      );
  }

  public getAccomplishedTasks(id: string): Observable<any> {
    console.log('ID', id);
    return this.afs
      .collection('accomplished_tasks')
      .snapshotChanges()
      .pipe(
        map((a) =>
          a.map((a) => {
            const item = a.payload.doc.data();
            //@ts-ignore
            if (item.taskId === id) {
              return a.payload.doc.data();
            }
          })
        )
      );
    /*
    return this.afs
      .collection('accomplished_tasks')
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          console.log("DOC", doc.payload)
          return { id: doc.payload.id, ...doc.payload.data() };
        })
      );
      */
  }

  public addTask(
    title: string,
    description: string,
    scope: Array<string>,
    startsAt: Date,
    deadline: Date,
    uploadedBy: string,
    recipients: any,
    pushTokens: any,
    term: string
  ): Promise<any> {
    let taskId = this.afs.createId();

    recipients.forEach((recipient: any) => {
      recipient.title = title;
      recipient.taskId = taskId;
      recipient.description = description;
      recipient.startsAt = +startsAt;
      recipient.deadline = +deadline;
      recipient.uploadedBy = uploadedBy;
      recipient.attemptsLeft = 2;
      recipient.deadlineLimit = 7;
      recipient.submittedAt = '';
      recipient.createdAt = new Date().getTime();
      console.log(recipient);
    });
    let task = {
      taskId: taskId,
      title: title,
      description: description,
      scope: scope,
      status: 'Pending',
      createdAt: new Date().getTime(),
      startsAt: +startsAt,
      deadline: +deadline,
      uploadedBy: uploadedBy,
      recipients: recipients,
      type: 'task',
      pushTokens: pushTokens,
      term: term,
    };

    console.log(task);
    console.log(+new Date(Date.now()));

    return this.afs
      .collection('tasks')
      .doc(taskId)
      .set(task)
      .then(() => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        const params: URLSearchParams = new URLSearchParams();

        params.set('recipients', recipients);
        params.set('title', title);
        params.set('deadline', deadline.toUTCString());
        params.set('description', description);

        this.http
          .post(
            `https://us-central1-icheckit-6a8bb.cloudfunctions.net/taskCreatedEmail`,
            {recipients},
            {headers}
          )
          .toPromise()
          .then(() => {
            this.toastService.publish(
              'Task has been succesfully created!',
              'formSuccess'
            );
            console.log('emails sent!');
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .then(() => {
        this.router.navigate(['/task/', taskId]);
      })
      .catch((err) => {
        this.toastService.publish(
          'There has been an error with the creation of the task',
          'userDoesNotExist'
        );
        console.log(err);
      });
  }

  public closeSubmissions(
    id: any,
    oldData: any,
    newData: any,
    recipients: any
  ) {
    return this.afs
      .collection('tasks')
      .doc(id)
      .update({
        status: 'Completed',
      })
      .then(() => {
        oldData.forEach((element: any) => {
          return this.afs
            .collection('tasks')
            .doc(id)
            .update({
              recipients: firebase.firestore.FieldValue.arrayRemove(element),
            });
        });

        newData.forEach((element: any) => {
          return this.afs
            .collection('tasks')
            .doc(id)
            .update({
              recipients: firebase.firestore.FieldValue.arrayUnion(element),
            });
        });
      })
      .then(() => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        const params: URLSearchParams = new URLSearchParams();

        params.set('recipients', recipients);

        this.http
          .post(
            `https://us-central1-icheckit-6a8bb.cloudfunctions.net/taskClosedEmail`,
            {recipients},
            {headers},
          )
          .toPromise()
          .then(() => {
            console.log('emails sent!');
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .then(() => {
        this.toastService.publish(
          'task has been successfully closed',
          'success'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'Closing of task failed: ',
          'taskdoesnotexist'
        );
      });

    // return this.afs.collection('tasks').doc(id).update({
    //   status:'Completed',
    //   recipients: firebase.firestore.FieldValue.arrayRemove(oldData),
    // }).then(() => {
    //   return this.afs.collection('tasks').doc(id).update({
    //     recipients: firebase.firestore.FieldValue.arrayUnion(newData),
    //   })
    // }).then(() => {
    //   this.toastService.publish('The task is now closed','success')
    // }).catch(() => {
    //   this.toastService.publish('closing task failed', 'taskdoesnotexist')
    // })
  }

  public updateTask(
    recipients: any,
    taskId: string,
    title: string,
    description: any,
    deadline: Date
  ): Promise<any> {
    return this.afs
      .collection('tasks')
      .doc(taskId)
      .update({
        title: title,
        description: description,
        deadline: +deadline,
      })
      .then(() => {
        recipients.forEach((element: any) => {
          let updatedData = {
            attemptsLeft: element.attemptsLeft,
            createdAt: element.createdAt,
            startsAt: +element.startsAt,
            deadline: deadline,
            deadlineLimit: element.deadlineLimit,
            description: description,
            displayName: element.displayName,
            email: element.email,
            pushToken: element.pushToken,
            section: element.section,
            status: element.status,
            submissionLink: element.submissionLink,
            taskId: element.taskId,
            term: element.term,
            submittedAt: element.submittedAt,
            title: title,
            uid: element.uid,
            uploadedBy: element.uploadedBy,
          };
          return this.afs
            .collection('tasks')
            .doc(taskId)
            .update({
              recipients: firebase.firestore.FieldValue.arrayRemove(element),
            })
            .then(() => {
              this.afs
                .collection('tasks')
                .doc(taskId)
                .update({
                  recipients:
                    firebase.firestore.FieldValue.arrayUnion(updatedData),
                });
            });
        });
      })
      .then(() => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        const params: URLSearchParams = new URLSearchParams();

        params.set('recipients', recipients);
        params.set('title', title);
        params.set('deadline', deadline.toUTCString());
        params.set('description', description);

        this.http
          .post(
            `https://us-central1-icheckit-6a8bb.cloudfunctions.net/taskUpdatedEmail`,
            {
              recipients,
              title,
              deadline,
              description,
            },
            {
              headers,
            }
          )
          .toPromise()
          .then(() => {
            console.log('emails sent!');
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .then(() => {
        this.toastService.publish('task updated' + title, 'success');
      })
      .then(() => {
        this.router.navigate(['task/', taskId]);
      })
      .catch(() => {
        this.toastService.publish(
          'Updating task failed: ' + title,
          'taskdoesnotexist'
        );
      });
  }

  public updateStudentStatus(id: string, newData: any, oldData: any) {
    console.log(newData);
    console.log(oldData);
    return this.afs
      .collection('tasks')
      .doc(id)
      .update({
        recipients: firebase.firestore.FieldValue.arrayRemove(oldData),
      })
      .then(() => {
        this.afs
          .collection('tasks')
          .doc(id)
          .update({
            recipients: firebase.firestore.FieldValue.arrayUnion(newData),
          });
      })
      .then((res) => {
        if (newData.status == 'Pending') {
          if (newData.pushToken == '') {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            const params: URLSearchParams = new URLSearchParams();

            // console.log(newData.email);
            let pushToken = newData.pushToken;
            let email = newData.email;
            let uploadedBy = newData.uploadedBy;
            let title = newData.title;
            let deadline = newData.deadline;
            let description = newData.description;
            let status = 'Rejected';
            let message =
              'Your task status has been updated to ' + status + '!';
            let instructions =
              'Your submission was rejected! Please re-submit your proof of completion and follow the proper instructions of the given task.';

            params.set('email', email);
            params.set('uploadedBy', uploadedBy);
            params.set('title', title);
            params.set('deadline', deadline);
            params.set('description', description);
            params.set('status', status);
            params.set('message', message);
            params.set('instructions', instructions);

            this.http
              .post(
                `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                {
                  email,
                  uploadedBy,
                  title,
                  deadline,
                  description,
                  status,
                  message,
                  instructions,
                  pushToken,
                },
                {
                  headers,
                }
              )
              .toPromise()
              .then(() => {
                this.toastService.publish(
                  'Email has been sent to ' + email,
                  'formSuccess'
                );
              })
              .catch((err) => {
                console.log(err);
              });
          } else if (newData.pushToken != '') {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            const params: URLSearchParams = new URLSearchParams();

            // console.log(newData.email);
            let pushToken = newData.pushToken;
            let email = newData.email;
            let uploadedBy = newData.uploadedBy;
            let title = newData.title;
            let deadline = newData.deadline;
            let description = newData.description;
            let status = 'Rejected';
            let message =
              'Your task status has been updated to ' + status + '!';
            let instructions =
              'Your submission was rejected! Please re-submit your proof of completion and follow the proper instructions of the given task.';

            params.set('email', email);
            params.set('uploadedBy', uploadedBy);
            params.set('title', title);
            params.set('deadline', deadline);
            params.set('description', description);
            params.set('status', status);
            params.set('message', message);
            params.set('instructions', instructions);
            params.set('pushToken', pushToken);

            this.http
              .post(
                `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                {
                  email,
                  uploadedBy,
                  title,
                  deadline,
                  description,
                  status,
                  message,
                  instructions,
                  pushToken,
                },
                {
                  headers,
                }
              )
              .toPromise()
              .then(() => {
                this.toastService.publish(
                  'Email has been sent to ' + email,
                  'formSuccess'
                );
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }

        if (newData.status == 'Accomplished') {
          if (newData.pushToken == '') {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            const params: URLSearchParams = new URLSearchParams();
            // console.log(newData.email);
            let pushToken = newData.pushToken;
            let email = newData.email;
            let uploadedBy = newData.uploadedBy;
            let title = newData.title;
            let deadline = newData.deadline;
            let description = newData.description;
            let status = newData.status;
            let message =
              'Your task status has been updated to ' + status + '!';
            let instructions =
              'Your submission was approved! Visit the mobile app to view your accomplished submission.';

            params.set('email', email);
            params.set('uploadedBy', uploadedBy);
            params.set('title', title);
            params.set('deadline', deadline);
            params.set('description', description);
            params.set('status', status);
            params.set('message', message);
            params.set('instructions', instructions);

            this.http
              .post(
                `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                {
                  email,
                  uploadedBy,
                  title,
                  deadline,
                  description,
                  status,
                  message,
                  instructions,
                  pushToken,
                },
                {
                  headers,
                }
              )
              .toPromise()
              .then(() => {
                this.toastService.publish(
                  'Email has been sent to ' + email,
                  'formSuccess'
                );
              })
              .catch((err) => {
                console.log(err);
              });
          } else if (newData.pushToken != '') {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            const params: URLSearchParams = new URLSearchParams();

            // console.log(newData.email);
            let pushToken = newData.pushToken;
            let email = newData.email;
            let uploadedBy = newData.uploadedBy;
            let title = newData.title;
            let deadline = newData.deadline;
            let description = newData.description;
            let status = newData.status;
            let message =
              'Your task status has been updated to ' + status + '!';
            let instructions =
              'Your submission was approved! Visit the mobile app to view your accomplished submission.';

            params.set('email', email);
            params.set('uploadedBy', uploadedBy);
            params.set('title', title);
            params.set('deadline', deadline);
            params.set('description', description);
            params.set('status', status);
            params.set('message', message);
            params.set('instructions', instructions);
            params.set('pushToken', pushToken);

            this.http
              .post(
                `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                {
                  email,
                  uploadedBy,
                  title,
                  deadline,
                  description,
                  status,
                  message,
                  instructions,
                  pushToken,
                },
                {
                  headers,
                }
              )
              .toPromise()
              .then(() => {
                this.toastService.publish(
                  'Email has been sent to ' + email,
                  'formSuccess'
                );
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public updateMultipleStudentStatus(id: string, newData: any, oldData: any) {
    console.log(newData);
    console.log(oldData);
    newData.forEach((element: any) => {
      oldData.forEach((data: any) => {
        return this.afs
          .collection('tasks')
          .doc(id)
          .update({
            recipients: firebase.firestore.FieldValue.arrayRemove(data),
          })
          .then(() => {
            this.afs
              .collection('tasks')
              .doc(id)
              .update({
                recipients: firebase.firestore.FieldValue.arrayUnion(element),
              });
          })
          .then((res) => {
            if (element.status == 'Pending') {
              if (element.pushToken == '') {
                const headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                const params: URLSearchParams = new URLSearchParams();

                // console.log(newData.email);
                let email = element.email;
                let uploadedBy = element.uploadedBy;
                let title = element.title;
                let deadline = element.deadline;
                let description = element.description;
                let status = 'Rejected';
                let message =
                  'Your task status has been updated to ' + status + '!';
                let instructions =
                  'Your submission was rejected! Please re-submit your proof of completion and follow the proper instructions of the given task.';

                params.set('email', email);
                params.set('uploadedBy', uploadedBy);
                params.set('title', title);
                params.set('deadline', deadline);
                params.set('description', description);
                params.set('status', status);
                params.set('message', message);
                params.set('instructions', instructions);

                this.http
                  .post(
                    `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                    {
                      email,
                      uploadedBy,
                      title,
                      deadline,
                      description,
                      status,
                      message,
                      instructions,
                    },
                    {
                      headers,
                    }
                  )
                  .toPromise()
                  .then(() => {
                    this.toastService.publish(
                      'Email has been sent to ' + email,
                      'formSuccess'
                    );
                  });
              } else if (element.pushToken != '') {
                const headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                const params: URLSearchParams = new URLSearchParams();

                // console.log(newData.email);
                let pushToken = element.pushToken;
                let email = element.email;
                let uploadedBy = element.uploadedBy;
                let title = element.title;
                let deadline = element.deadline;
                let description = element.description;
                let status = 'Rejected';
                let message =
                  'Your task status has been updated to ' + status + '!';
                let instructions =
                  'Your submission was rejected! Please re-submit your proof of completion and follow the proper instructions of the given task.';

                params.set('email', email);
                params.set('uploadedBy', uploadedBy);
                params.set('title', title);
                params.set('deadline', deadline);
                params.set('description', description);
                params.set('status', status);
                params.set('message', message);
                params.set('instructions', instructions);
                params.set('pushToken', pushToken);

                this.http
                  .post(
                    `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                    {
                      email,
                      uploadedBy,
                      title,
                      deadline,
                      description,
                      status,
                      message,
                      instructions,
                      pushToken,
                    },
                    {
                      headers,
                    }
                  )
                  .toPromise()
                  .then(() => {
                    this.toastService.publish(
                      'Email has been sent to ' + email,
                      'formSuccess'
                    );
                  });
              }
            }

            if (element.status == 'Accomplished') {
              if (element.pushToken == '') {
                const headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                const params: URLSearchParams = new URLSearchParams();

                // console.log(newData.email);
                let email = element.email;
                let uploadedBy = element.uploadedBy;
                let title = element.title;
                let deadline = element.deadline;
                let description = element.description;
                let status = element.status;
                let message =
                  'Your task status has been updated to ' + status + '!';
                let instructions =
                  'Your submission was approved! Visit the mobile app to view your accomplished submission.';

                params.set('email', email);
                params.set('uploadedBy', uploadedBy);
                params.set('title', title);
                params.set('deadline', deadline);
                params.set('description', description);
                params.set('status', status);
                params.set('message', message);
                params.set('instructions', instructions);

                this.http
                  .post(
                    `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                    {
                      email,
                      uploadedBy,
                      title,
                      deadline,
                      description,
                      status,
                      message,
                      instructions,
                    },
                    {
                      headers,
                    }
                  )
                  .toPromise()
                  .then(() => {
                    this.toastService.publish(
                      'Email has been sent to ' + email,
                      'formSuccess'
                    );
                  });
              } else if (element.pushToken != '') {
                const headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                const params: URLSearchParams = new URLSearchParams();

                // console.log(newData.email);
                let pushToken = element.pushToken;
                let email = element.email;
                let uploadedBy = element.uploadedBy;
                let title = element.title;
                let deadline = element.deadline;
                let description = element.description;
                let status = element.status;
                let message =
                  'Your task status has been updated to ' + status + '!';
                let instructions =
                  'Your submission was approved! Visit the mobile app to view your accomplished submission.';
                submittedAt: element.submittedAt, params.set('email', email);
                params.set('uploadedBy', uploadedBy);
                params.set('title', title);
                params.set('deadline', deadline);
                params.set('description', description);
                params.set('status', status);
                params.set('message', message);
                params.set('instructions', instructions);
                params.set('pushToken', pushToken);

                this.http
                  .post(
                    `https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`,
                    {
                      email,
                      uploadedBy,
                      title,
                      deadline,
                      description,
                      status,
                      message,
                      instructions,
                      pushToken,
                    },
                    {
                      headers,
                    }
                  )
                  .toPromise()
                  .then(() => {
                    this.toastService.publish(
                      'Email has been sent to ' + email,
                      'formSuccess'
                    );
                  });
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  }

  public deleteTask(id: string): Promise<any> {
    return this.afs
      .collection('tasks')
      .doc(id)
      .delete()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public verifyStudent(id: string, data: any, course: string) {
    console.log(data);
    // let course = data.proposedSection.slice(1,3);

    return this.afs
      .collection('users')
      .doc(id)
      .update({
        course: course,
        section: data.proposedSection,
        verified: 'Enrolled',
      })
      .then(() => {
        this.toastService.publish(
          data.displayName + ' has been successfully verified!',
          'formSuccess'
        );
      })
      .then(() => {
        return this.afs
          .collection('verificationTasks')
          .doc('60ThDEIPXLwWD8aHYs8E')
          .update({
            recipients: firebase.firestore.FieldValue.arrayRemove(data),
          });
      });
  }

  public verifyStudentByRegForm(id: string, user: any, regId: string) {

    this.afs
      .collection('registration_forms')
      .doc(regId)
      .set(
        {
          acceptedAt: new Date().getTime(),
          acceptedBy: user,
          isAccepted: true,
        },
        { merge: true }
      )
      .then((res) => {
        this.afs
          .collection('users')
          .doc(id)
          .set(
            {
              isVerified: true,
              verifiedBy: user,
              verifiedAt: new Date(),
            },
            { merge: true }
          )
          .then(() =>
            this.toastService.publish(
              'Student Successfully verified',
              'formSuccess'
            )
          )
          .catch((err) => {
            console.log(err);

            this.afs.collection('registration_forms').doc().set({
              acceptedAt: '',
              acceptedBy: '',
              isAccepted: false,
            });

            this.toastService.publish('Failed to verify student', 'formError');
          });
      })
      .catch((err) => {
        console.log(err);
        this.toastService.publish(
          'Failed to verify registration form',
          'formError'
        );
      });
  }

  public deleteRegform(id: string) {
    return this.afs
      .collection('registration_forms')
      .doc(id)
      .delete()
  }

  public deleteStudentVerification(id: string, data: any) {
    console.log(data);

    return this.afs
      .collection('verificationTasks')
      .doc('60ThDEIPXLwWD8aHYs8E')
      .update({
        recipients: firebase.firestore.FieldValue.arrayRemove(data),
      });
  }

  public getCompletedTask(): Observable<any> {
    return this.afs
      .collection('tasks', (ref) =>
        ref.where('status', '==', 'Completed').orderBy('deadline', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }
}
