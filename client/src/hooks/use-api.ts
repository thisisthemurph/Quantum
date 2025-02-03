interface UseApiOptions {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
}

interface ErrorResponse {
  error: string;
}

interface HttpSuccessResponse<T> {
  ok: true;
  status: number;
  data: T;
  error?: undefined;
}

interface HttpErrorResponse {
  ok: false;
  status: number;
  data: undefined;
  error: string;
}

type HttpResponse<T> = HttpSuccessResponse<T> | HttpErrorResponse;

export const useApi = (base?: string) => {
  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }
  if (base !== undefined && !base.startsWith("/")) {
    throw new Error("Base must start with a /");
  }
  if (base !== undefined && base.endsWith("/")) {
    throw new Error("Base must not end with a /");
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL + (base ?? "");

  return async <T = unknown>(
    endpoint: string,
    options?: UseApiOptions
  ): Promise<HttpResponse<T extends void ? void : T> | HttpErrorResponse> => {
    if (!endpoint.startsWith("/")) {
      throw new Error("Endpoint must start with a /");
    }

    const headers = {
      // Only include the Content-Type header if the body is not an instance of FormData
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (response.status === 204) {
      return {
        ok: true,
        status: response.status,
        data: undefined as T extends void ? void : T,
      };
    }

    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      return {
        ok: false,
        status: response.status,
        data: undefined,
        error: errorResponse.error ?? "An error occurred fetching data",
      };
    }

    try {
      const result = await response.json() as T extends void ? void : T;

      return {
        ok: true,
        status: response.status,
        data: result,
      };
    } catch (ex) {
      if (ex instanceof SyntaxError) {
        // Unexpected end of JSON body, no content returned.
        console.warn("No content returned from the API");
        return {
          ok: response.ok,
          status: response.status,
          data: undefined as T extends void ? void : T,
        };
      }

      return {
        ok: false,
        status: response.status,
        data: undefined,
        error: "There has been an unexpected error parsing data from the API",
      };
    }
  };
}