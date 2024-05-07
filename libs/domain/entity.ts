import { UniqueEntityID } from './unique-entity-id'

export type EntityProps = Record<string, unknown>

const isEntity = <T extends EntityProps = EntityProps>(v: unknown): v is Entity<T> =>
  v instanceof Entity

export abstract class Entity<T extends EntityProps> {
  public readonly props: T
  protected readonly _id: UniqueEntityID

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id ? id : new UniqueEntityID()
    this.props = props
  }

  public equals(object?: Entity<T>): boolean {
    if (!object || !isEntity(object)) {
      return false
    }

    if (this === object) {
      return true
    }

    return this._id.equals(object._id)
  }
}
