import {Component, ElementRef, ViewChild} from '@angular/core';
import io from 'socket.io-client';
import JSMpeg from 'jsmpeg-player';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('time') time: ElementRef;
  @ViewChild('pressure') pressure: ElementRef;
  @ViewChild('height') height: ElementRef;
  @ViewChild('verticalSpeed') verticalSpeed: ElementRef;
  @ViewChild('horizontalSpeed') horizontalSpeed: ElementRef;
  @ViewChild('horizontalAcceleration') horizontalAcceleration: ElementRef;
  @ViewChild('verticalAcceleration') verticalAcceleration: ElementRef;
  @ViewChild('lowestTemp') lowestTemp: ElementRef;
  @ViewChild('highestTemp') highestTemp: ElementRef;
  @ViewChild('battery') battery: ElementRef;
  @ViewChild('timeInFlying') timeInFlying: ElementRef;
  @ViewChild('distanceOfFlying') distanceOfFlying: ElementRef;
  @ViewChild('elevationPitch') elevationPitch: ElementRef;
  @ViewChild('elevationRoll') elevationRoll: ElementRef;
  @ViewChild('speed') speed: ElementRef;
  @ViewChild('videoCanvas') videoCanvas: ElementRef;


  timer;
  timer2;
  socket = io('http://localhost:7777');
  speedValue: any;

  private wsUrl: string;
  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.time.nativeElement.innerHTML = new Date();
    }, 1000);

    this.timer2 = setInterval(() => {
      this.time.nativeElement.innerHTML = new Date();
      this.socket.on('stateOfTheDrone', dronestate => {
        this.battery.nativeElement.innerHTML =  'BATTERY: ' + dronestate.bat.toString() + '%';
        this.height.nativeElement.innerHTML =  'Height(cm): ' + dronestate.h.toString();
        this.verticalSpeed.nativeElement.innerHTML =  'Vertical Speed: ' + dronestate.vgy.toString();
        this.horizontalSpeed.nativeElement.innerHTML =  'Horizontal Speed: ' +
          Math.sqrt((dronestate.vgx * dronestate.vgx) + (dronestate.vgz * dronestate.vgz)).toString();
        this.verticalAcceleration.nativeElement.innerHTML =  'Vertical Acceleration: ' + dronestate.agy.toString();
        this.horizontalAcceleration.nativeElement.innerHTML =  'Horizontal Acceleration: ' +
          Math.sqrt((dronestate.agx * dronestate.agx) + (dronestate.agz * dronestate.agz)).toString();
        this.lowestTemp.nativeElement.innerHTML =  'Lowest Temperature Detected: ' + dronestate.templ.toString();
        this.highestTemp.nativeElement.innerHTML =  'Highest Temperature Detected: ' + dronestate.temph.toString();
        this.pressure.nativeElement.innerHTML =  ('Air Pressure(mmHg): ' + (+dronestate.baro * 3.23).toString()).substring(0, 25);
        this.timeInFlying.nativeElement.innerHTML =  ('Total Flying Time: ' + dronestate.time.toString());
        this.distanceOfFlying.nativeElement.innerHTML =  ('Total Flying Distance: ' + dronestate.tof.toString());
        this.elevationPitch.nativeElement.innerHTML =  ('Elevation Pitch in Degrees: ' + dronestate.pitch.toString());
        this.elevationRoll.nativeElement.innerHTML =  ('Elevation Roll in Degrees: ' + dronestate.roll.toString());
      });

    }, 2500);
  }

   videoFunction = async () => {
     this.wsUrl = 'ws://localhost:3000/';
     const player = new JSMpeg.Player(this.wsUrl, {
       canvas: this.videoCanvas.nativeElement,
       audio: false,
       videoBufferSize: 512 * 1024,
       preserveDrawingBuffer: true,
       onPlay: p => {}
     });
  }

   performAction(command): void {
    console.log(command);
    if (command === 'streamon') {
      this.videoFunction();
    }
    this.socket.emit('command', command);
  }

  changeSpeed(): void {
    this.speedValue = this.speed.nativeElement.value;
    if (this.speedValue < 10 || this.speedValue > 100) {
      console.log('Speed out of range');
      return;
    }
    console.log(this.speedValue);
    this.socket.emit('command', 'speed ' + this.speedValue.toString());
  }

}



