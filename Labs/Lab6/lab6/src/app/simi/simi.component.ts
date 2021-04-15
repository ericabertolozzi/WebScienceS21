import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-simi',
  templateUrl: './simi.component.html',
  styleUrls: ['./simi.component.css']
})
export class SimiComponent implements OnInit {

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
  }

  public makeCSV(): void {
    this.httpService.sendGetRequest('/display').subscribe((data) => {
      console.log(data);
    })
  }

}
