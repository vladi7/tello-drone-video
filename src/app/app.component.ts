import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  @ViewChild('myDiv') myDiv: ElementRef;
  timer;

  ngOnInit() {
    this.timer = setInterval(() => {
      this.myDiv.nativeElement.innerHTML = new Date();
    }, 1000);
  }
  //title = 'DroneVideoRecognition';
   move(direction) {
    console.log(direction);
  }


}



