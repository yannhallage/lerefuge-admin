import type { ApiMethod } from "@/api/types"

export type RequestInterceptorInput = {
  path: string
  method: ApiMethod
  init: RequestInit
}

export type RequestInterceptor = (
  input: RequestInterceptorInput,
) => RequestInterceptorInput | Promise<RequestInterceptorInput>

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>

export const requestInterceptors: RequestInterceptor[] = []
export const responseInterceptors: ResponseInterceptor[] = []
