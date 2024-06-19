/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
import type { NextFunction, Request, Response } from 'express'

const catchAsync =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): void =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    fn(req, res, next).catch((e: { message: string }) => {
      console.log('intercepts in catchAsync', e.message)
      return next(e)
    })

export { catchAsync }
