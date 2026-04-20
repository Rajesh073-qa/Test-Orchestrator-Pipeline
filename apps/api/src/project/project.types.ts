/** Consistent shape returned on every project endpoint — no internal DB fields exposed */
export interface ProjectResponse {
  id: string;
  name: string;
  createdAt: Date;
}
