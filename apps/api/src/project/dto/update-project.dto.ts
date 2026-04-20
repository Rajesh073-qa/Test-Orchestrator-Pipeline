import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Project name must be at least 2 characters' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  name?: string;

  // ⚠️ userId and id are intentionally NOT here — ownership is always enforced
  // server-side by comparing JWT userId against the stored project.userId.
}
