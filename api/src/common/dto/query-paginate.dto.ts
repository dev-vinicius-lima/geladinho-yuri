import { ApiProperty } from '@nestjs/swagger';
import { QuerySearchDto } from './query-search.dto';
import { IsNotEmpty } from 'class-validator';
import { QuerySortDto } from './query-sort.dto';

class Pagination {
  @IsNotEmpty()
  pageIndex: string | number;
  @IsNotEmpty()
  pageSize: string | number;
}

class QueryPagination {
  @ApiProperty({
    required: true,
    type: Pagination,
    example: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  })
  @IsNotEmpty()
  pagination: Pagination;
}

class QueryOnlyPagination extends QueryPagination {
  @ApiProperty({
    required: false,
    type: [QuerySortDto],
    isArray: true,
  })
  sort?: QuerySortDto[];
}

class QueryPaginateDto extends QueryOnlyPagination {
  @ApiProperty({
    required: false,
    type: [QuerySearchDto],
    isArray: true,
  })
  query?: QuerySearchDto[];
  descricao?: string;
}

export {
  QueryPaginateDto,
  Pagination,
  QueryOnlyPagination,
  QuerySortDto,
  QueryPagination,
};
