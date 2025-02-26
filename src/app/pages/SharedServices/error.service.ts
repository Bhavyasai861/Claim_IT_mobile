import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  
  private errorImageMap: { [key: number]: string } = {
    400: 'assets/images/bad-request.PNG',
    404: 'assets/images/not-found.gif',
    500: 'assets/images/server-error.gif',
    503: 'assets/images/service-unavailable.PNG'
  };

  getErrorImage(status: number): string {
    if (!navigator.onLine) {
      return 'assets/images/network-error.png'; // No internet
    }

    return this.errorImageMap[status] || 'assets/images/unknown-error.png'; // Default error image
  }

  getErrorMessage(status: number): string {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }

    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 404:
        return 'Requested resource not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}
