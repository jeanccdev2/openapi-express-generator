import type { PaginationResponse } from "@shared/pagination.js";

export class ApiResponse<T> {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly response: T,
    public readonly code?: string,
  ) {}
}

export class ApiResponsePaginated<T> {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly response: T,
    public readonly pagination: PaginationResponse<T>,
    public readonly code?: string,
  ) {}
}
