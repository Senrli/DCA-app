export interface oboRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
  assertion: string;
  scope: string;
  requested_token_use: string;
}

export interface oboSuccessRespnse {
  token_type: string;
  scope: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface oboFailResponse {
  error: string;
  error_description?: string;
  error_codes?: [number];
  timestamp?: string;
  trace_id?: string;
  correlation_id?: string;
  claims?: string;
}
