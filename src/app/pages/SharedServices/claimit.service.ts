
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
  public approveOrRejectClaim(reqbody:any){
    return this.http.put(environment.approveOrRejectClaim+'?itemId='+reqbody.itemId+'&status='+reqbody.status+'&rejectedReason='+reqbody.reasonForReject,'')
  }
  public adminRemoveItem(itemId: number): Observable<any> {
    const url = `${environment.adminRemoveItem}?itemId=${itemId}`;
    return this.http.put(url, {});
  }

  public markASClaimed(reqbody:any){
    return this.http.post(environment.markASClaimed,reqbody)
  }
  
  public categoryItems(month: string, year: number) {
    const url = `${environment.categoryItems}?month=${year}-${month}`;
    return this.http.get(url);
  }
  public listOfItemsAddItem(query: any) {
    const url = `${environment.listOfItemsAddItem}?orgId=${query}`;
    return this.http.get(url);
  }
  public getExpiredItems(url: any) {
    return this.http.get(url);
  }
  
  public updateDate(reqbody:any){
    return this.http.put(environment.updateDate+'?fromDate='+reqbody.fromDate+'&toDate='+reqbody.toDate+'&expirationDate='+reqbody.expirationDate,'')
  }

  //List of itetems
  public listOfItems(page: number) {
    const url = `${environment.listOfItems}?offset=0&size=${page}`;
    return this.http.get(url);
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
      username:params.name,
      mail: params.mail,
      status: params.status,
      date: params.date,
      orgId:params.organizationId
    });
  
    return this.http.get(`${environment.adminSearch}?${queryParams.toString()}`);
  }
  public getcategories(): Observable<any> {
    return this.http.get(environment.getCategories)
  }
  public getOrgId(): Observable<any> {
    return this.http.get(environment.getOrgId)
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
  public deleteCategory(res:any) {
    return this.http.delete(environment.DeleteCategory+'?id='+res.id);
  }
  public updateCategory(url: string, body: any) {
    return this.http.put(url, body).toPromise();
  }
  public uploadCategory(reqbody:any) {
    return this.http.post(environment.uploadCategory,reqbody)
  }
  
  searchItems(query: string): Observable<any[]> {
    const url = `${environment.searchItems}?query=${encodeURIComponent(query)}`;
    return this.http.get<any[]>(url);
  }
}
