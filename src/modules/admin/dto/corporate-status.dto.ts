import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

// -- Update a Corporate (B2B) Request Status by an Admin --
export class CorporateStatusDto {
  @IsEnum(['UNDER_REVIEW', 'ASSIGNED', 'APPROVED', 'REJECTED', 'COMPLETED'])
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;

  @IsOptional()
  @IsUUID()
  assigned_to?: string;
}
