import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { LoaderComponent } from '../../admin/loader/loader.component';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.page.html',
  styleUrls: ['./admin-management.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule, LoaderComponent]
})
export class AdminManagementPage implements OnInit {
  organizations: any[] = [];
  orgId: any
  orgName: any
  userRole: any
  selectedOrgId: string = 'Miracle';
  adminSearch!: FormGroup
  adminResults: any
  isItemModalOpen = false
  userForm: FormGroup;
  searchQuery: string = '';
  statusList: string[] = ['active', 'inactive', 'pending'];
  isLoading: boolean = false;
  noRecord: boolean = false;
  showNewOrgInput = false;
  isAddingNewOrg = false;
  selectedOrgIds: string[] = [];
  constructor(private http: HttpClient, private fb: FormBuilder, private service: ClaimitService, private toastController: ToastController) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      organization: [[], Validators.required],
      newOrganization: [''] 
    });
  }

  ngOnInit() {
    this.initializeAdminForm();
    this.loadSelectedOrganization()
    this.orgId = localStorage.getItem('organizationId');
    this.adminManagement(this.orgId)
  }
  initializeAdminForm() {
    this.adminSearch = this.fb.group({
      email: (''),
      status: (''),
    })
  }
  loadSelectedOrganization() {
    this.orgId = localStorage.getItem('organizationId');
    this.orgName = localStorage.getItem('organizationName');
    this.userRole = localStorage.getItem('role');
    this.selectedOrgId = this.orgId ? this.orgId : ''; // Set initially selected orgId
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this.http.get<any[]>('http://52.45.222.211:8081/api/users/organisation').subscribe(
      (response) => {
        this.organizations = response;
      },
      (error) => console.error('Error fetching organizations:', error)
    );
  }
  onOrganizationChanging(event: any) {
    const selectedValues = event.detail.value.filter((id: string) => id !== 'addNew');
    
    if (event.detail.value.includes('addNew')) {
      this.showNewOrgInput = true;
    } else {
      this.showNewOrgInput = false;
    }
  
    this.userForm.patchValue({ organization: selectedValues });
    this.selectedOrgIds = selectedValues;
  }
  
  onOrganizationChange(event: any) {
    const selectedOrgId = event.detail.value;  
    if (selectedOrgId === 'addNew') {
      this.showNewOrgInput = true;
      this.userForm.patchValue({ organization: '' }); 
      this.adminManagement(''); 
    } else {
      this.showNewOrgInput = false;
      this.selectedOrgId = selectedOrgId;
      this.userForm.patchValue({ organization: selectedOrgId });
      this.adminManagement(selectedOrgId);
    }
  }
  
  addNewOrganization() {
    const newOrgName = this.userForm.get('newOrganization')?.value?.trim();  
    if (newOrgName) {
      const reqBody = [{ orgName: newOrgName }];  
      this.service.adminManagementOrg(reqBody).subscribe({
        next: (response: any) => {
          const newOrg = { id: response.id || `org_${Date.now()}`, orgName: response.orgName };
          this.fetchOrganizations()
          this.organizations.push(newOrg);
          this.selectedOrgIds.push(newOrg.id);
          this.userForm.patchValue({ organization: this.selectedOrgIds });  
          this.userForm.patchValue({ newOrganization: '' });
          this.showNewOrgInput = false;
        },
        error: (err) => {
          console.error('Error adding organization:', err);
        }
      });
    }
  }
  
  cancelNewOrganization() {
    this.showNewOrgInput = false;
    this.userForm.patchValue({ newOrganization: '' });
  }
  
  
  clearSearch() {
    this.orgId = localStorage.getItem('organizationId');
    this.searchQuery = '';
    this.adminManagement(this.orgId);
  }
  adminManagement(orgId:any) {
    this.isLoading = true;
    this.noRecord = false;
    let email = '';
    let status = '';
    if (this.searchQuery.trim().includes('@')) {
      email = this.searchQuery.trim();
    } else if (this.statusList.includes(this.searchQuery.trim())) {
      status = this.searchQuery.trim();
    }
    const reqBody = {
      email: email,
      status: status,
      orgId: orgId,
    };

    this.service.adminManagement(reqBody).subscribe(
      (res: any) => {
        this.isLoading = false;

        if (Array.isArray(res) && res.length === 0) {
          this.noRecord = true;
          this.adminResults = [];
        } else {
          this.adminResults = res;
          this.noRecord = this.adminResults.length === 0;
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Search failed:', error);
        this.noRecord = true;
      }
    );
  }



  getStatusColor(status: string): { backgroundColor: string; textColor: string } {
    switch (status) {
      case 'INACTIVE':
        return { backgroundColor: '#FFCCCC', textColor: '#991B1B' }; // Red
      case 'ACTIVE':
        return { backgroundColor: '#CCFFCC', textColor: '#4A683E' }; // Green (Fixed background)
      default:
        return { backgroundColor: '#FFFFFF', textColor: '#000000' }; // Default white bg & black text
    }
  }

  getTextColor(status: string): string {
    if (status === 'UNCLAIMED' || status === 'REJECTED') {
      return '#fff';
    }
    return '#333';
  }
  addAdmin() {
    this.isItemModalOpen = true;
    this.userForm.reset(); // Reset form on modal open
  }
  onModalDismiss() {
    this.isItemModalOpen = false;
  }
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
  onSubmit() {
    this.isLoading = true;
    if (this.userForm.valid) {
      const requestBody = {
        userName: this.userForm.value.username,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        orgName: this.userForm.value.organization.map((orgId:any) => 
          this.organizations.find(org => org.id === orgId)?.orgName || orgId
        ),
        password: this.userForm.value.password
      };
  
      const apiUrl = 'http://52.45.222.211:8081/auth/register';
      this.http.post(apiUrl, requestBody).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res && res.success) {
            this.showToast('Admin successfully created');
            this.isItemModalOpen = false;
            this.adminManagement('');
          } else {
            this.isItemModalOpen = false;
            this.showToast(res.message || 'Failed to create admin');
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Error adding user:', error);
          this.showToast('Error adding user. Please try again.');
        }
      );
    } else {
      this.showToast('Please fill out all required fields correctly.');
    }
  }
  

  getOrganizationName(orgId: string): string {
    const org = this.organizations.find(o => o.id === orgId);
    return org ? org.orgName : orgId;
  }


}
