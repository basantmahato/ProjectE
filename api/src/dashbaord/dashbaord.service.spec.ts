import { Test, TestingModule } from '@nestjs/testing';
import { DashbaordService } from './dashbaord.service';

describe('DashbaordService', () => {
  let service: DashbaordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashbaordService],
    }).compile();

    service = module.get<DashbaordService>(DashbaordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
