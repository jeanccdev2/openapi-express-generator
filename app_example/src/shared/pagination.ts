export class PaginationParams {
  public limit: number = 25;
  public offset: number = 0;

  constructor(limit?: number | null, page?: number | null) {
    if (limit) {
      this.limit = limit;
    }
    if (page) {
      this.offset = (page - 1) * this.limit;
    }
  }
}

export class PaginationResponse<T> {
  data: T[];
  limit: number;
  offset: number;
  totalPages: number;
  totalItems: number;

  constructor(data: T[], limit: number, offset: number, totalPages: number, totalItems: number) {
    this.data = data;
    this.limit = limit;
    this.offset = offset;
    this.totalPages = totalPages;
    this.totalItems = totalItems;
  }
}
