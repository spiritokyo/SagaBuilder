export type UseCase<IRequest, IResponse> = {
  execute(request?: IRequest): Promise<IResponse>
}
