import { ResponseMessage } from './response-message';

type ConstructorType<T> = {
  message: string;
  data?: T;
  take: number;
  page: number;
  totalItems: number;
  informacoes_extras?: Record<string, any>;
};

class ResponsePagination<T> extends ResponseMessage<T> {
  public readonly meta: ReturnType<ResponsePagination<T>['formatePaginate']>;

  constructor({
    message,
    data,
    page,
    take,
    totalItems,
    informacoes_extras,
  }: ConstructorType<T>) {
    super(message, data);
    this.meta = this.formatePaginate(
      take,
      page,
      totalItems,
      informacoes_extras || {},
    );
  }

  formatePaginate(
    take: number,
    page: number,
    totalItems: number,
    informacoes_extras: Record<string, any>,
  ) {
    const division = totalItems / take;

    return {
      currentPage: page,
      total: totalItems,
      numberPages:
        totalItems % take === 0 ? division : Math.trunc(division) + 1,
      perPage: take,
      informacoes_extras: informacoes_extras,
    };
  }

  public static fail(message = 'Falha na consulta') {
    return new ResponsePagination({
      message,
      data: [],
      totalItems: 0,
      take: 10,
      page: 1,
      informacoes_extras: {},
    });
  }
}

export { ResponsePagination };
