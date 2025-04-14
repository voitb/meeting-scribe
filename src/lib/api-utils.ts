import { NextResponse } from "next/server";
import { ApiErrorResponse, ApiResponseOptions } from "@/types/api";

/**
 * Standard API response headers to prevent caching
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Creates a standardized API response with proper headers
 */
export function createApiResponse<T>(
  data: T, 
  options: ApiResponseOptions = {}
): NextResponse<T> {
  const { status = 200, headers = {} } = options;
  
  return NextResponse.json(data, {
    status,
    headers: {
      ...NO_CACHE_HEADERS,
      ...headers
    }
  });
}

/**
 * Creates a standardized error API response
 */
export function createErrorResponse(
  message: string, 
  status: number = 500
): NextResponse<ApiErrorResponse> {
  return createApiResponse<ApiErrorResponse>(
    { error: message },
    { status }
  );
} 