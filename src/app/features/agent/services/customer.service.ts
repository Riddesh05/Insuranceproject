
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

const API_URL = 'http://localhost:8086/api/v1/customers';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(API_URL);
  }

  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${API_URL}/${customerId}`);
  }
}
