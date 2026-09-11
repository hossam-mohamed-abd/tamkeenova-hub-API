import { IsString, MinLength } from 'class-validator';

// -- Add a Comment on a Task --
export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body: string;
}
