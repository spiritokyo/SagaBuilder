type IUseCaseError = {
  message: string
}

export abstract class UseCaseError extends Error implements IUseCaseError {
  constructor(message: string) {
    super(message)
  }
}
