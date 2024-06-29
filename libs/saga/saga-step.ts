import type { EventEmitter } from 'node:events'

import type { AggregateRoot } from '@libs/common/domain'
import type { TSagaStepContext } from '@libs/saga/saga.types'

export abstract class SagaStep<
  A extends AggregateRoot<Record<string, unknown>>,
  DTO extends Record<string, unknown> = Record<string, unknown>,
> {
  stepName: string
  stepCompensationName: string

  constructor(
    public eventBus: EventEmitter,
    { stepName, stepCompensationName }: { stepName: string; stepCompensationName: string },
  ) {
    this.stepName = stepName
    this.stepCompensationName = stepCompensationName
  }

  async invokeUpgraded(ctx: TSagaStepContext<A, DTO>): Promise<void> {
    await this.invoke(ctx)
    this.eventBus.emit('update:saga-state', this.stepName)
  }

  async withCompensationUpgraded(ctx: TSagaStepContext<A, DTO>): Promise<void> {
    await this.withCompensation(ctx)
    this.eventBus.emit('update:saga-state', this.stepCompensationName)
  }

  addChildAggregate(childAggregate: A): void {
    this.eventBus.emit('update:child-aggregate-persistence', childAggregate)
  }

  abstract invoke(ctx: TSagaStepContext<A, DTO>): Promise<void> | void
  abstract withCompensation(ctx: TSagaStepContext<A, DTO>): Promise<void> | void
}

export type SagaStepClassInheritor<A extends AggregateRoot<Record<string, unknown>>> = new (
  eventBus: EventEmitter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...additionalArgs: any[]
) => SagaStep<A>
