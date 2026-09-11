import { IsEnum } from 'class-validator';

// -- Change a User Role --
export class ChangeRoleDto {
  @IsEnum([
    'STUDENT',
    'TRAINER',
    'CLIENT',
    'EMPLOYEE',
    'ADMIN',
    'SUPER_ADMIN',
    'VOLUNTEER',
  ])
  role: string;
}
