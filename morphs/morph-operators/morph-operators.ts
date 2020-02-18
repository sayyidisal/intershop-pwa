export class MorphOperators {
  static standardizeIdentifier(identifier: string) {
    return identifier.includes('.')
      ? identifier.split('.')[1].replace(/^\w/, c => c.toLowerCase())
      : identifier.replace(/^\w/, c => c.toLowerCase());
  }
}
