import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClientModule } from '@angular/common/http';
import {HttpClient} from "@angular/common/http";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { stringify } from '@angular/compiler/src/util';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';

declare function showInput():any;

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  msg!:string;
  msg1!:string;
  poststartdate: string;
  postperiodlength: number;

  clickEvent(){
    this.msg='Data Successfully Saved.';
    return this.msg;
  }

  clickEvent1(){
    this.msg1='CSV Data Successfully Saved.';
    return this.msg1;
  }
 
 
  constructor(private http:HttpClient, private httpService:HttpService) {
    msg:String;
    this.poststartdate = "";
    this.postperiodlength = 0;
   }
  

  ngOnInit(): void {
    // showInput();
    
  }

  public makeFirstDataSet(): void {
    this.http.post<Cycle>('http://localhost:3000/tracking',{ title: 'Angular POST Request' }).subscribe((data) => {
      this.poststartdate=data.startdate;
      this.postperiodlength=data.periodlength
      console.log(data);
    })
  }
  public makeCSV(): void {
    this.httpService.sendGetRequest('/trackerCSV').subscribe((data) => {
      console.log(data);
    })
  }

  public getvisualization(): void {
    this.httpService.sendGetRequest('/trackerimage').subscribe((data) => {
      console.log(data);
    })
  }


}

interface Cycle {
  startdate: string;
  periodlength: number;
}


