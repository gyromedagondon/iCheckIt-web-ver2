import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  callbacks: ((message: string, type:string) => void)[] = [];

  constructor() { }

  publish(message: string, type: string) {
    this.callbacks.forEach(callback => {
        callback(message, type);
    });
  }

  subscribe(callback: (message: string, type: string) => void) {
    this.callbacks.push(callback)
  } 

}
