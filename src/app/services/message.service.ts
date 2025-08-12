// src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://your-api-url/messages'; // Update with your API URL

  constructor(private http: HttpClient) {}

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count/${userId}`);
  }

  getMessages(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/user/${userId}`);
  }

  markAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/read`, {});
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, {
      ...message,
      timestamp: new Date().toISOString(),
      isRead: false
    });
  }
}