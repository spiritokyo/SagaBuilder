import type { OnModuleInit } from '@nestjs/common'
import { Global, Module } from '@nestjs/common'

import { initializeBookingDomainSubscribers } from '@booking-infra/domain-subscriptions'
import { BookingRepoModule } from '@booking-infra/repository-impls'

@Module({
  imports: [BookingRepoModule],
  exports: [BookingRepoModule],
})
export class BookingModule implements OnModuleInit {
  onModuleInit(): void {
    initializeBookingDomainSubscribers()
  }
}
