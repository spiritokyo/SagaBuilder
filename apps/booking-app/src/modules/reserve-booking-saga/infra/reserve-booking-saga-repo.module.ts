// // import { BookingRepositoryImplDatabase } from '@booking-infra/repository-impls'

// import { Module } from '@nestjs/common'

// // import { getConnection } from '@shared/infra/database/client'

// // import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'

// // @Module({
// // imports: [],
// // providers: [

// // ],
// // })

// @Module({
//   imports: [],
//   providers: [
//     {
//       provide: BookingRepositoryImplDatabase,
//       useFactory: async () => new BookingRepositoryImplDatabase(await getConnection()),
//     },
//   ],
// })
// export class SagaReserveBookingRepoModule {}
