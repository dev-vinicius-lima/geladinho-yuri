import { PrismaClient } from 'generated/prisma';

type keysPrismaClientType = Extract<keyof PrismaClient, string>;

export type nameModelsPrismaType = Exclude<
  keysPrismaClientType,
  | '$connect'
  | '$disconnect'
  | '$executeRaw'
  | '$extends'
  | '$on'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$transaction'
  | '$use'
  | '$executeRawUnsafe'
>;
