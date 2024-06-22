/* eslint-disable no-restricted-syntax */
import { CronJob } from 'cron'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import type { TSagaRepository } from '@libs/saga/repo'

export class RestoreFailedReserveBookingSagaCron {
  public static client: PoolClient
  public static job: CronJob
  public static reserveBookingSagaRepository: TSagaRepository<Booking>

  static initialize(
    client: PoolClient,
    reserveBookingSagaRepository: TSagaRepository<Booking>,
  ): typeof RestoreFailedReserveBookingSagaCron {
    this.client = client
    this.reserveBookingSagaRepository = reserveBookingSagaRepository

    this.job = new CronJob(
      '1 * * * * *', // cronTime
      async () => {
        const { rows: failedReserveBookingSagas } = await this.client.query(
          `
          SELECT * FROM "Saga"
          WHERE state ->> 'is_error_saga' = 'true'
          LIMIT 1
          `,
        )
        console.log(
          '🚀 ~ RestoreFailedReserveBookingSagaCron ~ failedReserveBookingSagas:',
          failedReserveBookingSagas,
        )
        // for (const saga of failedReserveBookingSagas) {
        //   const reserveBookingSaga = await this.reserveBookingSagaRepository.restoreSaga(
        //     saga as ReserveBookingSagaPersistenceEntity,
        //   )
        //   if (!reserveBookingSaga) {
        //     continue
        //   }
        //   await reserveBookingSaga.execute()
        // }
        // console.log(failedReserveBookingSagas)
      }, // onTick
      null, // onComplete
      true, // start
    )
    return this
  }

  static run(): void {
    this.job.start()
  }

  static stop(): void {
    this.job.stop()
  }
}
