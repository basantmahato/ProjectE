import { Test, TestingModule } from '@nestjs/testing';
import { DashbaordController } from './dashbaord.controller';
import { DashbaordService } from './dashbaord.service';

describe('DashbaordController', () => {
  let controller: DashbaordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashbaordController],
      providers: [DashbaordService],
    }).compile();

    controller = module.get<DashbaordController>(DashbaordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
