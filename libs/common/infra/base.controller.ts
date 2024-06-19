import type { Response } from 'express'

export class BaseController {
  public static jsonResponse(res: Response, code: number, message: string): Response {
    return res.status(code).json({ message })
  }

  // public async execute(req: Request, res: Response): Promise<void> {
  //   try {
  //     await this.executeImpl(req, res)
  //   } catch (err) {
  //     console.error(
  //       '[BaseController]: Uncaught controller error',
  //       (err as Error).constructor.name,
  //       (err as Error).stack,
  //     )

  //     this.fail(res, err as Error)
  //   }
  // }

  public ok<T>(res: Response, dto?: T): Response {
    if (dto) {
      res.type('application/json')
      return res.status(200).json(dto)
    }
    return res.sendStatus(200)
  }

  public created(res: Response): Response {
    return res.sendStatus(201)
  }

  public clientError(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 400, message ? message : 'Unauthorized')
  }

  public unauthorized(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 401, message ? message : 'Unauthorized')
  }

  public paymentRequired(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 402, message ? message : 'Payment required')
  }

  public forbidden(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 403, message ? message : 'Forbidden')
  }

  public notFound(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 404, message ? message : 'Not found')
  }

  public conflict(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 409, message ? message : 'Conflict')
  }

  public tooMany(res: Response, message?: string): Response {
    return BaseController.jsonResponse(res, 429, message ? message : 'Too many requests')
  }

  public wrongInput<T>(res: Response, dto: T): Response {
    res.type('application/json')
    return res.status(400).json(dto)
  }

  public fail(res: Response, error: Error | string): Response {
    return BaseController.jsonResponse(res, 500, error.toString())
  }
}
