import {
  ApiServiceBase,
  DefaultApiServiceConfig,
  ApiServiceConfig,
  CommonResponseBody,
} from './api'
import cfg from '../../config.yaml'
import {ChainId} from '../common'

type RpcParam = string | number | boolean

export class RpcApiService extends ApiServiceBase {
  protected static defaultConfig: DefaultApiServiceConfig = {
    url: cfg.api.url,
    apiBase: cfg.api.rpc.base,
    chainId: ChainId.Mainnet,
    maxPagesize: cfg.api.maxPagesize,
  }

  public config!: DefaultApiServiceConfig
  protected id: number = 0
  protected version: string = '2.0'

  public constructor(config?: ApiServiceConfig) {
    super({...RpcApiService.defaultConfig, ...config})
  }

  public async call(
    method: string,
    params: RpcParam[],
  ): Promise<CommonResponseBody> {
    const url = `${this.config.url}${this.config.apiBase}`
    const body = this.getDefaultBody(method, params, this.config.chainId)
    const res = await this._post(url, body)
    if (res.ok) {
      if (res.data.error) {
        return {ok: false, error: res.data.error}
      } else {
        return {ok: true, data: res.data.result}
      }
    } else {
      return res
    }
  }

  private getDefaultBody(
    method: string,
    params: RpcParam[],
    chainId: ChainId = ChainId.Mainnet,
  ) {
    const id = this.id++
    params.unshift(chainId)
    return {jsonrpc: this.version, method, params, id}
  }
}
