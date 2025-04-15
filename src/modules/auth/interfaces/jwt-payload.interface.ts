export interface JwtPayload {
    userId: string; // từ payload.sub
    username: string;
    role: 'PATIENT' | 'DOCTOR' | 'EMPLOYEE' | 'ADMIN';
  }
