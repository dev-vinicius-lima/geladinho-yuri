import { DataTokenType } from 'src/modules/auth/@types/token';

export type HttpRequestType = Request & { user: DataTokenType };
