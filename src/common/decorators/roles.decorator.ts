import { SetMetadata } from '@nestjs/common';

// -- Declare Which Roles May Access a Given Route --
export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
