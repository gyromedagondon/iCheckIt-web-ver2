import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { Params } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
})
export class ArchiveComponent implements OnInit {
  completedTasks$: any;

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

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    readonly fire: AngularFireAuth,
    public auth: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    var d = new Date();
    var y = d.getFullYear();
    var n = d.getMonth();
    console.log(n);
    console.log(y);
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1));
      this.term = '2nd Term SY ' + y + '-' + (y + 1);
    } else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1));
      this.term = '1st Term SY ' + y + '-' + (y + 1);
    } else {
      console.log('Summer Term' + y + '-' + (y + 1));
      this.term = 'Summer Term' + y + '-' + (y + 1);
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
      });
    });
    this.taskService.getCompletedTask().subscribe((res) => {
      this.taskData = res;
      console.log(this.taskData);
    });
  }
}
