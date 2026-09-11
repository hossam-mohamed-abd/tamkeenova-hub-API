import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// -- Review a Task Submission (APPROVE / REJECT, optional score for volunteers) --
export class ReviewSubmissionDto {
  @IsEnum(['APPROVE', 'REJECT'])
  action: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
