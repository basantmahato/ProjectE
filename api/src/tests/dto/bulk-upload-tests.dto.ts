import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTestDto } from './create-test.dto';

export class BulkUploadTestsDto {
  @ApiProperty({
    description: 'Array of tests to create',
    type: [CreateTestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestDto)
  tests: CreateTestDto[];
}
