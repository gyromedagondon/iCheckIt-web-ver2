import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { forkJoin, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from './toast.service';
import db from 'firebase.config';

// import { countReset } from 'console';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private afs: AngularFirestore,
    readonly fire: AngularFireAuth,
    private http: HttpClient,
    public toastService: ToastService
  ) {}

  public getDeptHeadUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Department Head').orderBy('createdAt', 'desc')
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

  public getAdmin(id: string): Observable<any> {
    // return this.afs.collection('users')
    // .doc(id)
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return { id: doc.payload.id, ...doc.payload.data() };
    //   })
    // );
    return this.afs.collection('users').doc(id).valueChanges();
  }


  public updateAllUsers(array: Array<any>) {
    array.map((user: any) => {
      if (user?.uid) {
        let newUser = {
          ...user,
          displayName: user?.firstName + ' ' + user?.lastName,
        };

        let splitName = user?.displayName.split(' ');

        let newUser2 = {
          ...user,
          firstName: splitName[0],
          lastName: splitName[1],
        };

        if (user?.firstName && user?.lastName) {
          this.afs.collection('users').doc(user?.uid).set(newUser);
        } else if (splitName[1] != null && splitName[1] != null) {
          this.afs.collection('users').doc(user?.uid).set(newUser2);
        } else {
          this.afs.collection('users').doc(user?.uid).delete();
        }
      }
    });
  }
  
  public getStudent(id: string): Observable<any> {
    // return this.afs.collection('users')
    // .doc(id)
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return { id: doc.payload.id, ...doc.payload.data() };
    //   })
    // );
    return this.afs.collection('users').doc(id).valueChanges();
  }

  public getStudent2(id: string): Observable<any> {
    // return this.afs.collection('users')
    // .doc(id)
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return { id: doc.payload.id, ...doc.payload.data() };
    //   })
    // );
    return this.afs
      .collection('users', (ref) => ref.where('uid', '==', id))
      .snapshotChanges();
  }

  public getStudentUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Student').orderBy('createdAt', 'desc')
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

  public getRegistrationForms(): Observable<any> {
    return this.afs
      .collection('registration_forms', (ref) =>
        ref.where('isAccepted', '==', false)
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;

              const finalData = {
                uid: id,
                ...data,
              };

              return finalData;
            }
          );
        })
      );
  }

  public getArchivedUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Archived').orderBy('createdAt', 'desc')
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

  public getAdminUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref
          .where('role', '==', 'CICS Office Staff')
          .orderBy('createdAt', 'desc')
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
  //https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent

  adminCreateStudent(
    firstName: string,
    lastName: string,
    displayName: string,
    section: string,
    course: string,
    contactNumber: string,
    email: string
  ): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('email', email);
    params.set('displayName', displayName);

    return (
      this.http
        .post(
          `https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent`,
          {
            email,
            displayName,
          },
          {
            headers,
          }
        )
        .toPromise()
        .then((cred: any) => {
          const uid = cred.userRecord.uid;
          const data = {
            uid: uid,
            firstName: firstName.toString(),
            lastName: lastName.toString(),
            contactNumber: `0${contactNumber.toString()}`,
            email: email,
            section: section,
            createdUsing: 'webapp',
            isVerified: true,
            pushToken: '',
            course: course,
            displayName: displayName,
            createdAt: new Date().getTime(),
            role: 'Student',
          };
          this.afs
            .collection('users')
            .doc(uid)
            .set(data)
            .catch((error) => console.log(error));
        })
        .then(() => {
          this.toastService.publish(
            'Student account with the email ' +
              email +
              ' has been successfully created',
            'formSuccess'
          );
        })
        // .catch(() => {
        //   this.toastService.publish('The student account creation was not successful. The user email might have been already existing in our database,','userDoesNotExist');
        // });
        .catch((err) => {
          this.toastService.publish(
            'The student account creation was not successful. The user email might have been already existing in our database,',
            'userDoesNotExist'
          );
        })
    );
  }

  adminImportUsers(users: any): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('users', users);

    return (
      this.http
        .post(
          `https://us-central1-icheckit-6a8bb.cloudfunctions.net/importUsers`,
          {
            users: users,
          },
          {
            headers,
          }
        )
        .toPromise()
        .then((cred: any) => {
          console.log(cred);

          try {
            let promises = cred?.res.map((student: any, idx: number) => {
              console.log(student);

              const data = {
                uid: student?.uid,
                firstName: users[idx].firstName.toString(),
                lastName: users[idx].lastName.toString(),
                contactNumber: `0${users[idx].contactNumber.toString()}`,
                email: users[idx]?.email,
                section: users[idx]?.section,
                createdUsing: 'webapp',
                isVerified: true,
                pushToken: '',
                course: users[idx]?.course,
                displayName: users[idx]?.firstName + ' ' + users[idx]?.lastName,
                createdAt: new Date().getTime(),
                role: 'Student',
              };
              return this.afs.collection('users').doc(student?.uid).set(data);
            });

            if (promises) {
              Promise.all(promises).then((res) => {
                console.log(res);
                this.toastService.publish(
                  'Successfully imported users',
                  'formSuccess'
                );
              });
            } else {
              console.log('Promises not ofund');
            }
          } catch (err) {
            console.log(err);
          }
        })

        // .catch(() => {
        //   this.toastService.publish('The student account creation was not successful. The user email might have been already existing in our database,','userDoesNotExist');
        // });
        .catch((err) => {
          console.log(err);
          this.toastService.publish(
            'The import was not successful. There might be a user email might have been already existing in our database,',
            'userDoesNotExist'
          );
        })
    );
  }

  adminCreateDeptHead(
    displayName: string,
    department: string,
    contactNumber: string,
    email: string
  ): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('email', email);
    params.set('displayName', displayName);

    return this.http
      .post(
        `https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent`,
        {
          email,
          displayName,
        },
        {
          headers,
        }
      )
      .toPromise()
      .then((cred: any) => {
        const uid = cred.userRecord.uid;
        const data = {
          uid: uid,
          contactNumber: contactNumber.toString(),
          email: email,
          department: department,
          verified: 'Enrolled',
          displayName: displayName,
          createdAt: Date.now(),
          role: 'Department Head', //just recycled the code for create student
        };
        this.afs
          .collection('users')
          .doc(uid)
          .set(data)
          .catch((error) => console.log(error));
      })
      .then(() => {
        this.toastService.publish(
          'Student account with the email ' +
            email +
            ' has been successfully created',
          'formSuccess'
        );
      })
      .catch((err) => {
        console.log(err);
        this.toastService.publish(
          'The admin account creation was not successful. The user email might have been already existing in our database,',
          'userDoesNotExist'
        );
      });
  }

  adminCreateAdmin(
    displayName: string,
    department: string,
    contactNumber: string,
    email: string
  ): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('email', email);
    params.set('displayName', displayName);

    return this.http
      .post(
        `https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent`,
        {
          email,
          displayName,
        },
        {
          headers,
        }
      )
      .toPromise()
      .then((cred: any) => {
        const uid = cred.userRecord.uid;
        const data = {
          uid: uid,
          contactNumber: contactNumber.toString(),
          email: email,
          department: department,
          verified: 'Verified',
          displayName: displayName,
          createdAt: Date.now(),
          role: 'CICS Office Staff', //just recycled the code for create student
        };
        this.afs
          .collection('users')
          .doc(uid)
          .set(data)
          .catch((error) => console.log(error));
      })
      .then(() => {
        this.toastService.publish(
          'New admin account with the email ' +
            email +
            ' has been successfully created',
          'formSuccess'
        );
      })
      .catch((err) => {
        console.log(err);
        this.toastService.publish(
          'The admin account creation was not successful. The user email might have been already existing in our database,',
          'userDoesNotExist'
        );
      });
  }

  deleteUserAccount(id: string, email: string): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .delete()
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully deleted',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the deletion of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }

  archiveUserAccount(
    id: string,
    email: string,
    yearGraduated: number
  ): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .update({
        role: 'Archived',
        yearGraduated: yearGraduated,
      })
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully archived',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the archiving of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }

  updateUserAccount(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    displayName: string,
    contactNumber: string,
    course: string,
    section: string
  ): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .update({
        firstName: firstName,
        lastName: lastName,
        email: email,
        displayName: displayName,
        contactNumber: contactNumber.toString(),
        course: course,
        section: section,
        //  department: department
      })
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully updated',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the update of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }

  updateAdminAccount(
    id: string,
    email: string,
    displayName: string,
    contactNumber: string,
    department: string
  ): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .update({
        email: email,
        displayName: displayName,
        contactNumber: contactNumber.toString(),
        department: department,

        //  department: department
      })
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully updated',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the update of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }
}
