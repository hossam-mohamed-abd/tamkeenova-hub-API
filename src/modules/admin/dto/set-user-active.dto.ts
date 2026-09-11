import { IsBoolean } from 'class-validator';

// -- Activate or Deactivate a User Account --
export class SetUserActiveDto {
  @IsBoolean()
  is_active: boolean;
}
