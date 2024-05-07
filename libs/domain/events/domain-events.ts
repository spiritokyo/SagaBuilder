import type { IDomainEvent } from './domain-event.type'
import type { AggregateRoot } from '../aggregate-root'
import type { UniqueEntityID } from '../unique-entity-id'
import type { EntityProps } from '../entity'

export class DomainEvents {
  // eslint-disable-next-line @typescript-eslint/ban-types
  private static handlersMap: Record<string, Function[]> = {}
  private static markedAggregates: AggregateRoot<EntityProps>[] = []

  /**
   * @method markAggregateForDispatch
   * @static
   * @desc Called by aggregate root objects that have created domain
   * events to eventually be dispatched when the infrastructure commits
   * the unit of work.
   */

  public static markAggregateForDispatch(aggregate: AggregateRoot<EntityProps>): void {
    const aggregateFound = Boolean(this.findMarkedAggregateByID(aggregate.id))

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register(callback: (event: IDomainEvent) => void, eventClassName: string): void {
    if (!Object.hasOwn(this.handlersMap, eventClassName)) {
      this.handlersMap[eventClassName] = []
    }
    this.handlersMap[eventClassName].push(callback)
  }

  public static clearHandlers(): void {
    this.handlersMap = {}
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates = []
  }

  private static dispatch(event: IDomainEvent): void {
    const eventClassName: string = event.constructor.name

    if (Object.hasOwn(this.handlersMap, eventClassName)) {
      const handlers = this.handlersMap[eventClassName]
      for (const handler of handlers) {
        handler(event)
      }
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<EntityProps>): void {
    aggregate.domainEvents.forEach((event: IDomainEvent) => this.dispatch(event))
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<EntityProps>,
  ): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))
    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(id: UniqueEntityID): AggregateRoot<EntityProps> | null {
    const foundAggregate = this.markedAggregates.find((aggregate) => aggregate.id.equals(id))

    return foundAggregate ? foundAggregate : null
  }
}
