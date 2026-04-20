import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2, { message: 'Project name must be at least 2 characters' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  name: string;

  // ⚠️ userId is intentionally NOT here — it is always extracted from the JWT.
  // Never accept userId from the request body.
}
