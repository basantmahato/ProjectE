import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Expo push token from the device' })
  @IsString()
  @IsNotEmpty()
  expoPushToken: string;

  @ApiPropertyOptional({ description: 'Optional device identifier' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
