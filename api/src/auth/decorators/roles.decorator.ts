import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';

export const Role = (role: 'user' | 'admin') => SetMetadata(ROLE_KEY, role);
