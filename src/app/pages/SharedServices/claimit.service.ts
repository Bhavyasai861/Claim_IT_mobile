
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/enivonment.dev';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaimitService {
  public loginResponse = new BehaviorSubject<any>(false);
  loginResponse_Triggered = this.loginResponse.asObservable();
  constructor(private http: HttpClient) { }
  public adminLogin(email: string, password: string) {
    const loginData = { email, password };
    return this.http.post(environment.adminLogin, loginData);
  }
}
