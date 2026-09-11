import { IsOptional, IsString, IsUrl } from 'class-validator';

// -- Submit a Task (text and/or link; files are sent as multipart) --
export class SubmitTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  link_url?: string;
}
