import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  
  
  
  
  @ViewChild('content', {static: false}) el!: ElementRef;
  searchBar: any;
  dateToday = new Date();
  userData:any;
  fsData: any;
  id!: any;
  taskData: any;
  totalRecipients = 0;
  pendingRecipients = 0;
  lateRecipients = 0;
  forApprovalRecipients = 0;
  accomplishedRecipients = 0;
  pendingRecipientsPct = 0;
  lateRecipientsPct = 0;
  forApprovalRecipientsPct = 0;
  accomplishedRecipientsPct = 0;
  mgaPasaway: any;
  diPaNagpapasa: any;
  forApprovalPa: any;
  nagpasaNa: any;
  chart: any;
  data: any;
  type: any;
  options: any;
  taskId:any;
  p: number = 1;
  term!: string;
  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    private storage: AngularFireStorage) { }

  ngOnInit(): void {
    var d = new Date();
    var y = d.getFullYear()
    var n = d.getMonth();
    console.log(n)
    console.log(y)
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1))
      this.term = '2nd Term SY ' + y + '-' + (y + 1);
    }
    else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1))
      this.term = '1st Term SY ' + y + '-' + (y + 1);
    }
    else {
      console.log('Summer Term' + y + '-' + (y + 1))
      this.term = 'Summer Term' + y + '-' + (y + 1);
    }
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })

    this.route.params.pipe(
      switchMap((params: Params) => {
        console.log(params['id']);
        this.taskId = params['id'];
        return this.taskService.getTask(params['id'])
      })
    ).subscribe((res) => {
      this.taskData = res;
      console.log(res);

      this.totalRecipients = res.recipients.length;

      console.log('Pending recipients length');
      console.log(res.recipients)
      this.pendingRecipients = 0;
      this.forApprovalRecipients = 0;
      this.lateRecipients = 0;
      this.accomplishedRecipients = 0;
      this.diPaNagpapasa = [];
      this.mgaPasaway = [];
      this.nagpasaNa = [];
      this.forApprovalPa = [];

      res.recipients.forEach((element: any) => {
        if(Object.values(element).includes("Pending")) {
          this.mgaPasaway.push(element)
          this.diPaNagpapasa.push(element)
          this.pendingRecipients += 1;
        }
        if(Object.values(element).includes("For Approval")) {
          this.forApprovalRecipients += 1;
          this.forApprovalPa.push(element)
        }
        if(Object.values(element).includes("No Submission")) {
          this.lateRecipients += 1;
          this.mgaPasaway.push(element)
        }
        if(Object.values(element).includes("Accomplished")) {
          this.accomplishedRecipients += 1;
          this.nagpasaNa.push(element)
        }
      });
      this.pendingRecipientsPct = (this.pendingRecipients / this.totalRecipients) * 100;
      this.lateRecipientsPct = (this.lateRecipients / this.totalRecipients) * 100;
      this.forApprovalRecipientsPct = (this.forApprovalRecipients / this.totalRecipients) * 100;
      this.accomplishedRecipientsPct = (this.accomplishedRecipients / this.totalRecipients) * 100;

      this.type = 'doughnut';
      this.data = {
        labels: ["Pending", "For Approval", "Accomplished", "No Submission",],
        datasets: [
          {
            label: "My First dataset",
            data: [this.pendingRecipientsPct , this.forApprovalRecipientsPct, this.accomplishedRecipientsPct, this.lateRecipientsPct],
            backgroundColor: [
              '#ffff00',
              '#FF640D',
              '#00B633',
              '#F00000'

            ],
            borderCplor: [
              '#ffff00',
              '#FF640D',
              '#00B633',
              '#F00000'
            ],
              hoverOffset: 4
          },
        ],

      };
      this.options = {
        title: {
              display: true,
              text: 'Task Status Report',
              fontSize: 25,
              fontFamily: 'Antonio',
              fontColor: '#35414F'
        },
        responsive: true,
        maintainAspectRatio: false
      };

    })
  }

  // var headers = createHeaders([
  //   "id",
  //   "coin",
  //   "game_group",
  //   "game_name",
  //   "game_version",
  //   "machine",
  //   "vlt"
  // ]);
  
  // var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
  // doc.table(1, 1, generateData(100), headers, { autoSize: true });

  public generateData(amount:any) {
    var result = [];
    var data = {
      Name: "100",
      Course: "GameGroup",
      Section: "XPTO2",
      Status: "25",
    };
    for (var i = 0; i < amount; i += 1) {
      result.push(Object.assign({}, data));
    }
    return result;
  };
  
  public createHeaders(keys:any) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
      result.push({
        name: keys[i],
        prompt: keys[i],
        width: 65,
        align: "center",
        padding: 10
      });
    }
    return result;
  }

  

  downloadPdf() {
    let resultPending: { [key: string]: string; }[] | { Name: any; Email: any; Section: any; }[] = [];
    let resultLate: { [key: string]: string; }[] | { Name: any; Email: any; Section: any;  }[] = [];
    let resultForApproval: { [key: string]: string; }[] | { Name: any; Email: any; Section: any;  }[] = [];
    let resultAccomplished: { [key: string]: string; }[] | { Name: any; Email: any; Section: any; }[] = [];

    console.log('pdf')
      const test = new jsPDF('portrait')
      const headers = [
        'Name',
        'Email',
        'Section',
      ]
      // const invoiceObjectTableRows = [
      //   {
      //     Name: 'testing',
      //     Student_Date_Of_Birth: 'testing',
      //     Student_ID_No_Course: 'testing',
      //     Course: 'testing',
      //     Course_Total_Tuition_Fee: 'testing',
      //   }
      // ]
      test.setFont("times", "normal");
      test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);
      test.setFontSize(12);

      test.text(`Task Name: ${this.taskData.title}`, 35, 50);
      test.text(`Uploaded By: ${this.taskData.uploadedBy}`, 35, 57);
      test.text(`Report Generated By: ${this.userData.displayName}`, 35, 64);

      test.text(`Task Creation Date: ${this.taskData.createdAt}`, 35, 80);
      test.text(`Task Deadline: ${this.taskData.deadline}`, 35, 87);

      test.text(`Task Scope: ${this.taskData.scope}`, 35, 103,{maxWidth:133});

     

      test.text(`Pending Recipients Percentage: ${this.pendingRecipientsPct.toFixed(2)}%`, 35, 137);
      test.text(`No Submission Recipients Percentage: ${this.lateRecipientsPct.toFixed(2)}%`, 35, 144);
      test.text(`For Approval Recipients Percentage: ${this.forApprovalRecipientsPct.toFixed(2)}%`, 35, 151);
      test.text(`Accomplished Recipients Percentage: ${this.accomplishedRecipientsPct.toFixed(2)}%`, 35, 158);


      test.addPage('portrait');

      if (this.taskData.status == 'Pending') {
        this.diPaNagpapasa.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultPending.push(Object.assign({}, data));
        });
  
        this.forApprovalPa.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultForApproval.push(Object.assign({}, data));
        });
  
        this.nagpasaNa.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultAccomplished.push(Object.assign({}, data));
        });
  
        if (resultPending.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);
          test.text("Pending Recipients", 36, 60);
          test.table(36, 65, resultPending, headers, { autoSize: true,padding: 3,fontSize:10})
          test.addPage('portrait');
        }
        
       
        if (resultForApproval.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);

          test.text("For Approval Recipients", 36, 60);
          test.table(36, 65, resultForApproval, headers,  { autoSize: true,padding: 3,fontSize:10})
        test.addPage('portrait');
        }
        
        if (resultAccomplished.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);

          test.text("Accomplished Recipients", 36, 60);
          test.table(36, 65, resultAccomplished, headers,  { autoSize: true,padding: 3,fontSize:10})
        test.addPage('portrait');
        }
        
      }

      else if (this.taskData.status == 'Completed') {
     
        this.mgaPasaway.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultLate.push(Object.assign({}, data));
        });
  
        this.forApprovalPa.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultForApproval.push(Object.assign({}, data));
        });
  
        this.nagpasaNa.forEach((element: any) => {
          var data = {
            Name: element.displayName,
            Email: element.email,
            Section: element.section,
          }
          resultAccomplished.push(Object.assign({}, data));
        });
    
        if (resultLate.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);

          test.text("No Submission Recipients", 36, 60);
          test.table(36, 65, resultLate, headers, { autoSize: true,padding: 3,fontSize:10})
          test.addPage('portrait');
        }
       
        if (resultForApproval.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);

          test.text("For Approval Recipients", 36, 60);
          test.table(36, 65, resultForApproval, headers,  { autoSize: true,padding: 3,fontSize:10})
        test.addPage('portrait');
        }
        
        if (resultAccomplished.length != 0) {
          test.addImage("../../../assets/report_header.PNG", "PNG", 5, 10, 200, 30);

          test.text("Accomplished Recipients", 36, 60);
          test.table(36, 65, resultAccomplished, headers,  { autoSize: true,padding: 3,fontSize:10})
        test.addPage('portrait');
        }
        
      }
      

      // test.table(5, 80, invoiceObjectTableRows, headers, { autoSize: true })
      test.save()
    
    

  

    // this.router.navigate(['/task/reports-download/',this.taskId])
    // const quality = 1 // Higher the better but larger file
    // html2canvas(this.el.nativeElement,
    //     { scale: quality }
    // ).then(canvas => {
    //     const pdf = new jsPDF('l', 'mm', 'a4');
    //     pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
    //     pdf.save();
    // }).then(() => {
    //   this.router.navigate(['/task/reports/',this.taskId])
    // })
  }

}
