// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { Module } from '@nestjs/common'
// import type { DynamicModule } from '@nestjs/common'

// import type { Booking } from '@booking-domain/booking.aggregate'
// import { BookingDomainService } from '@booking-domain/index'

// import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'
// import { BookingRepositoryImplDatabase } from '@booking-infra/repository-impls'

// import { getConnection } from '@shared/infra/database/client'

// import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'
// import { SagaRepositoryImplDatabase } from '@libs/common/saga/repo'

// import { ReserveBookingUsecase } from './usecases/reserve-booking.usecase'

// @Module({
//   providers: [
//     {
//       provide: BookingRepositoryImplDatabase,
//       useFactory: async (): Promise<BookingRepositoryImplDatabase> =>
//         new BookingRepositoryImplDatabase(await getConnection()),
//     },
//     {
//       inject: [BookingRepositoryImplDatabase],
//       provide: SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>,
//       useFactory: async (
//         bookingRepository: SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>,
//       ): Promise<SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>> => {
//         const a = SagaRepositoryImplDatabase.initialize<Booking, BookingPersistenceEntity>(
//           await getConnection(),
//           bookingRepository,
//         )

//         return a
//       },
//     },
//   ],
// })
// class ReserveBookingSagaRepoModule {}

// @Module({
//   imports: [ReserveBookingSagaRepoModule],
// })
// export class UsecasesProxyModule {
//   static RESERVE_BOOKING_USECASE = 'RESERVE_BOOKING_USECASE'
//   static register(): DynamicModule {
//     return {
//       module: UsecasesProxyModule,
//       providers: [
//         {
//           inject: [SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>],
//           provide: UsecasesProxyModule.RESERVE_BOOKING_USECASE,
//           useFactory: (
//             reserveBookingSagaRepository: SagaRepositoryImplDatabase<
//               Booking,
//               BookingPersistenceEntity
//             >,
//           ) =>
//             ReserveBookingUsecase.initialize(
//               new BookingDomainService(),
//               reserveBookingSagaRepository,
//             ),
//         },
//       ],
//       exports: [UsecasesProxyModule.RESERVE_BOOKING_USECASE],
//     }
//   }
// }
