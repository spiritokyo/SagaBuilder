/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Policy } from 'cockatiel'
import { wrap, handleWhen, retry, ExponentialBackoff } from 'cockatiel'

export function emulateChaosError(error: Error, chaosChancePercentage?: number): void {
  const _chaosChancePercentage = chaosChancePercentage ?? 50

  if (Math.random() * 100 < _chaosChancePercentage) {
    throw error
  }
}

// BookingRepoInfraError
export const buildCircuitBreaker = (
  errors: (new (...args: any[]) => Error)[],
  context: string,
): ReturnType<typeof wrap> => {
  const handleInfraExceptions: Policy =
    errors.length === 1
      ? handleWhen((err) => err instanceof errors[0])
      : errors.slice(1).reduce<Policy>(
          (policyConstructor, cur) => policyConstructor.orWhen((err) => err instanceof cur),
          handleWhen((err) => err instanceof errors[0]),
        )

  const retryPolicy = retry(handleInfraExceptions, {
    maxAttempts: 3,
    // backoff: new ConstantBackoff(3000),
    // ! How long to wait between attempts.
    backoff: new ExponentialBackoff({ initialDelay: 1000, maxDelay: 10 * 1000 }),
  })

  retryPolicy.onRetry(({ delay }) => {
    console.log('------------------------------------------------------------')
    console.log(`[Circuit Breaker] [Retrying] [${context}]`, delay)
    console.log('------------------------------------------------------------')
  })

  return wrap(retryPolicy /* circuitBreakerPolicy */)
}
