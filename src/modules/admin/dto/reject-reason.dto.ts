import { IsString, MinLength } from 'class-validator';

// -- Rejection Reason for Trainer / Volunteer Applications --
export class RejectReasonDto {
  @IsString()
  @MinLength(5)
  reason: string;
}
