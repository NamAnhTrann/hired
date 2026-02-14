import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root',
})

export class Contact_Service {
  private local_url = 'http://54.252.159.167:2020/api';

  constructor(private http: HttpClient) {}

  send_contact(contact_data:any){
    return this.http.post(`${this.local_url}/add/contact`, contact_data)
  }

  list_contact(){
    return this.http.get(`${this.local_url}/list/contact`)
  }

  list_single_contact(contact_id:string){
    return this.http.get(`${this.local_url}/list/single/contact/${contact_id}`)
  }
}
