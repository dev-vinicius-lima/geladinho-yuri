import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { nameModelsPrismaType } from 'src/@types/prismaTypes';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const [model, field] = validationArguments!.constraints as [string, string];

    // eslint-disable-next-line
    const exists = await this.prismaService[model].count({
      where: {
        [field]: value,
      },
    });

    return exists ? true : false;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    const [model] = validationArguments!.constraints as [string, string];

    return `${model} Não Encotrado`;
  }
}

export function IsExist(
  model: nameModelsPrismaType,
  field: string,
  validationOptions?: ValidationOptions,
) {
  //eslint-disable-next-line
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'IsExist',
      async: true,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [model, field],
      options: validationOptions,
      validator: IsExistConstraint,
    });
  };
}
