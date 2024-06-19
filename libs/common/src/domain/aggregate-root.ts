import type { EntityProps } from './entity'
import { Entity } from './entity'
import type { IDomainEvent } from './events/domain-event.type'
import { DomainEvents } from './events/domain-events'
import type { UniqueEntityID } from './unique-entity-id'

export class AggregateRoot<T extends EntityProps> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = []

  constructor(props: T, id?: UniqueEntityID) {
    super(props, id)
  }

  get id(): UniqueEntityID {
    return this._id
  }

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length)
  }

  public addDomainEvent(domainEvent: IDomainEvent): void {
    // Add the domain event to this aggregate's zlist of domain events
    this._domainEvents.push(domainEvent)
    // Add this aggregate instance to the domain event's list of aggregates who's
    // events it eventually needs to dispatch.
    DomainEvents.markAggregateForDispatch(this)
    // Log the domain event
    // this.logDomainEventAdded(domainEvent)
  }

  // private _logDomainEventAdded(domainEvent: IDomainEvent): void {
  //   const thisClass = Reflect.getPrototypeOf(this)
  //   const domainEventClass = Reflect.getPrototypeOf(domainEvent)
  //   console.info(
  //     '[Domain Event Created]:',
  //     thisClass?.constructor.name,
  //     '==>',
  //     domainEventClass?.constructor.name,
  //   )
  // }
}
