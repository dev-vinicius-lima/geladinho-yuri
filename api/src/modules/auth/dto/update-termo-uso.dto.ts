import { IsNumber } from 'class-validator';
export class UpdateTermoUsoDto {
  @IsNumber()
  status: number;
}
