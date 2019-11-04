import fetchPonyfill from 'fetch-ponyfill'
import cfg from '../../config.yaml'
import {ChainId} from '../common'

const {fetch} = fetchPonyfill()

export type ApiServiceConfigEndpoints = Record<string, string>

export interface ApiServiceConfig {
  url?: string
  apiBase?: string
  timeout?: number
  chainId?: ChainId
  maxPagesize?: number
  endpoints?: ApiServiceConfigEndpoints
}

export interface DefaultApiServiceConfig extends ApiServiceConfig {
  url: string
  apiBase: string
  chainId: ChainId
  maxPagesize: number
}

export interface CommonSuccessResponseBody {
  ok: true
  data: any
}

export interface CommonErrorResponseBody {
  ok: false
  error: string
}

export type CommonResponseBody =
  | CommonSuccessResponseBody
  | CommonErrorResponseBody

export abstract class ApiServiceBase {
  public config: DefaultApiServiceConfig = {
    url: cfg.api.url,
    apiBase: cfg.api.base,
    chainId: ChainId.Mainnet,
    maxPagesize: cfg.api.maxPagesize,
  }

  public constructor(config: ApiServiceConfig) {
    this.config = {...this.config, ...config}
  }

  protected resolvePath(path: string, replacements?: Record<string, string>) {
    let url = `${this.config.url}${this.config.apiBase}${path}`
    if (replacements) {
      Object.keys(replacements).forEach(rep => {
        url = url.replace(`$${rep}`, replacements[rep])
      })
    }
    return url
  }

  protected async _get(url: string): Promise<CommonResponseBody> {
    const options: RequestInit = {
      method: 'GET',
    }

    const response = await fetch(url, options)
    return this.handleResponse(response)
  }

  protected async _post(url: string, body: any): Promise<CommonResponseBody> {
    const headers = this.getDefaultHeaders()

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }

    const response = await fetch(url, options)
    return this.handleResponse(response)
  }

  protected async _put(url: string, body: any): Promise<CommonResponseBody> {
    const headers = this.getDefaultHeaders()

    const options: RequestInit = {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    }

    const response = await fetch(url, options)
    return this.handleResponse(response)
  }

  protected async _patch(url: string, body: any): Promise<CommonResponseBody> {
    const headers = this.getDefaultHeaders()

    const options: RequestInit = {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    }

    const response = await fetch(url, options)
    return this.handleResponse(response)
  }

  protected async _delete(url: string): Promise<CommonResponseBody> {
    const options: RequestInit = {
      method: 'DELETE',
    }

    const response = await fetch(url, options)
    return this.handleResponse(response)
  }

  protected getDefaultHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    return headers
  }

  protected async handleErrorResponse(
    response: Response,
  ): Promise<CommonErrorResponseBody> {
    try {
      const error = await response.json()
      return {ok: false, error}
    } catch (e) {
      return {ok: false, error: 'Unknown error'}
    }
  }

  protected async handleSuccessResponse(
    response: Response,
  ): Promise<CommonSuccessResponseBody> {
    if (response.status !== 204) {
      const data = await response.json()
      return {ok: true, data}
    } else {
      return {ok: true, data: null}
    }
  }

  protected async handleResponse(
    response: Response,
  ): Promise<CommonResponseBody> {
    if (response.status >= 200 && response.status < 400) {
      return this.handleSuccessResponse(response)
    } else {
      return this.handleErrorResponse(response)
    }
  }
}
