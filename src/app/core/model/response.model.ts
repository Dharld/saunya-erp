import { User } from './user.model';

export interface ApiResponse {
  success: number;
  pages: number;
  curr_page: number;
  size: number;
  data: any;
}
