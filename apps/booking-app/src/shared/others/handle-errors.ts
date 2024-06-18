import type { Server } from 'http'

export function handleErrors(server: Server): void {
  /**
   * Handling critical error events
   */
  process
    .on('SIGTERM', shutdownZero('SIGTERM'))
    .on('SIGINT', shutdownZero('SIGINT'))
    .on('unhandledRejection', shutdownOne('unhandledRejection'))
    .on('uncaughtException', shutdownOne('uncaughtException'))

  function shutdownZero(signal: string): (err: Error) => void {
    return (err: Error) => {
      console.warn(`${signal} RECEIVED. Shutting down gracefully...`, {
        name: err.name,
        message: err.message,
      })

      server.close(() => {
        console.error('Process terminated...')
        process.exit(0)
      })
    }
  }

  function shutdownOne(typeException: string): (err: Error) => void {
    return (err: Error) => {
      console.error(
        { name: err.name, message: err.message, trace: err.stack },
        `${typeException}! 💥 Shutting down...`,
      )

      server.close(() => {
        console.error('Process terminated...')
        process.exit(1)
      })
    }
  }
}
