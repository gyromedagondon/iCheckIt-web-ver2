import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';
import firebase from 'firebase/app';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  userData: any;
  fsData: any;
  taskData: any;
  taskList: any;
  dateToday = new Date();
  p: number = 1;
  totalRecipients = 0;
  accomplishedRecipients = 0;
  accomplishedRecipientsPct = 0;
  term!: string;
  editForm!: any;
  showEditModal = false;
  calendar: any;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    readonly fire: AngularFireAuth,
    public auth: AuthService,
    private taskService: TaskService,
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private toastService: ToastService
  ) {}

  public getCalendar(): Observable<any> {
    return this.afs.collection('calendar').doc('image').valueChanges();
  }

  ngOnInit(): void {
    var d = new Date();
    var y = d.getFullYear();
    var n = d.getMonth();
    console.log(n);
    console.log(y);
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ');
      this.term = '2nd Term SY ';
    } else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ');
      this.term = '1st Term SY ';
    } else {
      console.log('Summer Term');
      this.term = 'Summer Term';
    }
    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
      });
    });
    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
        console.log(res);
      });
    });
    this.taskService.getCompletedTask().subscribe((res) => {
      this.taskData = res;
      console.log(this.taskData);
    });

    this.editForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });

    this.getCalendar().subscribe((res) => {
      console.log('CAL', res);
      this.calendar = res;
    });
  }

  public closeEditModal() {
    this.showEditModal = false;
    this.preview = '';
  }

  public editCalendar() {
    return 0;
  }

  file = '';
  filename = '';
  type = '';
  extension = '';
  preview = '';

  public handleOnChangeFile(event: any) {
    console.log('EV', event.target.files[0]);
    this.preview = '';
    const files = event.target.files;
    this.extension = files[0].type;
    this.file = files[0];
    this.filename = files[0].name;
    if (event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.preview = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  public editCalendarSubmit() {
    if (this.file && this.filename && this.extension) {
      if (
        this.editForm.controls['start'].value >
        this.editForm.controls['end'].value
      ) {
        this.toastService.publish(
          'Year start must not be greater than year end',
          'formError'
        );
        return;
      }
      if (this.editForm.valid) {
        this.handleUpload(
          this.filename,
          this.editForm.controls['end'].value,
          this.editForm.controls['start'].value,
          this.file,
          this.extension,
          this.calendar.url
        );
      } else {
        this.editForm.controls['end'].markAsTouched();
        this.editForm.controls['start'].markAsTouched();
        this.toastService.publish(
          'Please fill up all required fields properly',
          'formError'
        );
      }
    } else {
      if (this.editForm.valid) {
        if (
          this.editForm.controls['start'].value >
          this.editForm.controls['end'].value
        ) {
          this.toastService.publish(
            'Year start must not be greater than year end',
            'formError'
          );
          return;
        }
        if (
          this.editForm.controls['end'].value !== this.calendar.yearEnd ||
          this.editForm.controls['start'].value !== this.calendar.yearStart
        ) {
          this.afs
            .collection('calendar')
            .doc('image')
            .set(
              {
                yearEnd: this.editForm.controls['end'].value,
                yearStart: this.editForm.controls['start'].value,
              },
              { merge: true }
            )
            .then(() =>
              this.toastService.publish(
                'Academic year has been updated',
                'formSuccess'
              )
            )
            .catch((err) => console.log(err));
        } else {
          this.toastService.publish('No change detected', 'formError');
        }
      } else {
        this.toastService.publish('No change detected', 'formError');
      }
    }
  }

  public uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  public handleUpload(
    filename: string,
    yearEnd: number,
    yearStart: number,
    photo: any,
    extension: any,
    photoUrl: any
  ) {
    //delete first

    if (photoUrl) {
      const oldUrl = photoUrl;

      const oldFile =
        'calendar/' +
        oldUrl
          .replace(
            'https://firebasestorage.googleapis.com/v0/b/icheckit-6a8bb.appspot.com/o/calendar%2F',
            ''
          )
          .split('?')[0];

      const deleteRef = firebase.storage().ref(oldFile);
      deleteRef
        .delete()
        .then(() => {
          console.log('Deleted file');
        })
        .catch((error) => {
          console.log(error);
        });
    }

    var metadata = {
      contentType: extension,
    };

    const refUrl = `calendar/${this.uuidv4()}.${extension.replace(
      /(.*)\//g,
      ''
    )}`;
    const ref = firebase.storage().ref(refUrl);

    ref.put(photo, metadata).then((snapshot) => {
      console.log('UPLOADED');
      firebase
        .storage()
        .ref(refUrl)
        .getDownloadURL()
        .then((url: any) => {
          if (url) {
            this.afs
              .collection('calendar')
              .doc('image')
              .set(
                {
                  extension: extension,
                  filename: filename,
                  url: url,
                  yearEnd: yearEnd,
                  yearStart: yearStart,
                },
                { merge: true }
              )
              .then(() =>
                this.toastService.publish(
                  'Term calendar and year has been updated',
                  'formSuccess'
                )
              )
              .catch((err) => console.log(err));
          }
        });
    });
  }

  public openEditModal() {
    this.showEditModal = true;
    this.editForm.controls.start.setValue(this.calendar.yearStart);
    this.editForm.controls.end.setValue(this.calendar.yearEnd);
  }

  public openFileDialog() {
    const file = document.getElementById('file');
    file?.click();
  }
}
