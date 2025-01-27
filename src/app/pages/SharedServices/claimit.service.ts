
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/enivonment.dev';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaimitService {

  role = new BehaviorSubject<string | null>(localStorage.getItem('role')); // Default to stored role

  updateRole(newRole: string) {
    localStorage.setItem('role', newRole);
    this.role.next(newRole);
  }


  public loginResponse = new BehaviorSubject<any>(false);
  private notificationCountSource = new BehaviorSubject<number>(0);
  notificationCount$ = this.notificationCountSource.asObservable();


  private pendingClaimsSubject = new BehaviorSubject<number>(0);

  // Observable for components to subscribe to
  pendingClaimsCount$ = this.pendingClaimsSubject.asObservable();
  loginResponse_Triggered = this.loginResponse.asObservable();
  constructor(private http: HttpClient) { }
  public adminLogin(email: string, password: string) {
    const loginData = { email, password };
    return this.http.post(environment.adminLogin, loginData);
  }
  public statusCount(month: string, year: number) {
    const url = `${environment.statusCount}?month=${year}-${month}`;
    return this.http.get(url);
  }
  
  public categoryItems(month: string, year: number) {
    const url = `${environment.categoryItems}?month=${year}-${month}`;
    return this.http.get(url);
  }
  //List of itetems
  public listOfItems(query: any) {
    return this.http.get(environment.listOfItems);
  }
  public getAllItems(query: any) {
    return this.http.get(environment.getAllItems + 
      `?email=${query.email}&userName=${query.userName}`);
  }
  
  public createClaimRequest(REQBODY: any) {
    return this.http.post(environment.createClaimRequest, REQBODY)
  }
  public adminSearch(params: any) {
    const queryParams = new URLSearchParams({
      mail: params.mail,
      status: params.status,
      date: params.date
    });
  
    return this.http.get(`${environment.adminSearch}?${queryParams.toString()}`);
  }
  
  public getNotifications(): Observable<any> {
    return this.http.get(environment.getNotifications)
  }
  pendingClaims: any[] = [];

  addClaim(claim: any) {
    this.pendingClaims.push(claim);
    this.pendingClaimsSubject.next(this.pendingClaims.length); 
  }

  getClaims() {
    return this.pendingClaims;
  }
  setNotificationCount(count: number): void {
    this.notificationCountSource.next(count);
  }
  public updateNotification(reqbody: any) {
    return this.http.put(environment.updateNotification, reqbody);
  }
}
