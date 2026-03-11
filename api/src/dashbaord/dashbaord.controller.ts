import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DashbaordService } from './dashbaord.service';

@Controller('dashbaord')
export class DashbaordController {
  constructor(private readonly dashbaordService: DashbaordService) {}

 
}
