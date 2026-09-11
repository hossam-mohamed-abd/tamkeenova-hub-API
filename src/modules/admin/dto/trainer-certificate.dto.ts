import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

// -- Add a Certificate (URL) to a Trainer Profile --
export class TrainerCertificateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsUrl()
  certificate_url: string;
}
