import { IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsIn(['basic', 'premium'])
  planId: string;
}
