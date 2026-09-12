import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';

// -- Normalize a Link That May Be a Markdown Link [text](url) --
function normalizeLink(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();

  // Extract the URL from a Markdown link like: [http://x](http://x)
  const match = trimmed.match(/\]\(\s*(https?:\/\/[^\s)]+)\s*\)/);
  if (match) {
    return match[1];
  }

  return trimmed;
}

// -- Submit a Task (text and/or link; files are sent as multipart) --
export class SubmitTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeLink(value))
  @IsUrl({ require_protocol: true })
  link_url?: string;
}
