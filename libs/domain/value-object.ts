type ValueObjectProps = Record<string, unknown>

/**
 * @desc ValueObjects are objects that we determine their
 * equality through their structrual property.
 */

export abstract class ValueObject<T extends ValueObjectProps> {
  public props: T

  constructor(props: T) {
    const baseProps = {
      ...props,
    }

    this.props = baseProps
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (!vo?.props) {
      return false
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
