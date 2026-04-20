import { IsString, IsUrl, IsEmail, MinLength } from 'class-validator';

export class ConnectJiraDto {
  @IsUrl({ require_tld: false }, { message: 'baseUrl must be a valid URL' })
  baseUrl: string;

  @IsEmail({}, { message: 'Please provide a valid Jira account email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Jira API token seems too short' })
  apiToken: string;

  // ⚠️ userId is intentionally NOT here — always extracted from JWT.
  // Security: NEVER trust userId from request body.
}
