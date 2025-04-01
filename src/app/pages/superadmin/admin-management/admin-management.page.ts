import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IonicModule ,ToastController} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { LoaderComponent } from '../../admin/loader/loader.component';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.page.html',
  styleUrls: ['./admin-management.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule,LoaderComponent]
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
  constructor(private http: HttpClient, private fb: FormBuilder, private service: ClaimitService,private toastController: ToastController) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      organization: ['', Validators.required] 
    });
  }

  ngOnInit() {
    this.initializeAdminForm();
    this.loadSelectedOrganization()
    this.orgId = localStorage.getItem('organizationId');
    this.adminManagement()
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
    this.http.get<any[]>('http://172.17.12.101:8081/api/users/organisation').subscribe(
      (response) => {
        this.organizations = response;
        const storedOrgId = localStorage.getItem('organizationId');
        if (storedOrgId) {
          const matchedOrg = this.organizations.find(org => org.orgId == storedOrgId);
          if (matchedOrg) {
            this.selectedOrgId = matchedOrg.orgId;
          }
        }
      },
      (error) => {
        console.error('Error fetching organizations:', error);
      }
    );
  }
  onOrganizationChange(event: any) {
    const selectedOrg = this.organizations.find(org => org.orgId == event.detail.value);
    if (selectedOrg) {
      localStorage.setItem('organizationId', selectedOrg.orgId);
      localStorage.setItem('organizationName', selectedOrg.orgName);
    }
    this.orgId = localStorage.getItem('organizationId');

  }

  clearSearch() {
    this.orgId = localStorage.getItem('organizationId');
    this.searchQuery = '';
    this.adminManagement();
  }
  adminManagement() {
    this.isLoading = true; 
    this.noRecord = false;   
    this.orgId = localStorage.getItem('organizationId');
    let email = '';
    let status = '';
  
    if (this.searchQuery.includes('@')) {
      email = this.searchQuery.trim();
    } else if (this.statusList.includes(this.searchQuery.trim())) {
      status = this.searchQuery.trim();
    }
  
    const reqBody = {
      email: email,
      status: status,
      orgId: this.orgId,
    };
  
    this.service.adminManagement(reqBody).subscribe(
      (res: any) => {
        this.isLoading = false; // Hide loader
        this.adminResults = res;
        this.noRecord = this.adminResults.length === 0 && this.searchQuery.trim().length > 0;
      },
      (error: any) => {
        this.isLoading = false; // Hide loader even if request fails
        console.error('Search failed:', error);
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
      const requestBody = { ...this.userForm.value };
      const apiUrl = 'http://172.17.12.101:8081/auth/register';
      console.log('Submitting request:', requestBody);
  
      this.http.post(apiUrl, requestBody).subscribe(
        (res: any) => { 
          if (res && res.success) {
            this.showToast('Admin successfully created');
            this.isLoading = false;  
            this.isItemModalOpen = false; 
            this.adminManagement(); 
          } else {
            this.showToast(res.message || 'Failed to create admin'); 
          }
        },
        (error) => {
          console.error('Error adding user:', error);
          this.showToast('Error adding user. Please try again.');
        }
      );
    } else {
      this.showToast('Please fill out all required fields correctly.');
    }
  }
  
}
