import { Component, OnInit} from '@angular/core';
import { ToastService } from './services/toast.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'iCheckit';
  notifMessage!:string;
  notifType!:string;
  notifBoolean!:boolean;
  constructor(
    public toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.notifBoolean = false;
    this.toastService.subscribe((message,type) => {
      //alert(message);
      this.notifMessage = message;
      this.notifType = type;
      setTimeout(() => {
          this.notifBoolean = true;
          setTimeout(() => {
              this.notifBoolean = false;
          }, 2500);
      }, 300);
  })
  }
}
console.log('a')

 