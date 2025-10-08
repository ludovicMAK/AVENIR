export class Role {
  private constructor(private readonly value: 'customer' | 'bankManager' | 'bankAdvisor') {}

  static CUSTOMER = new Role('customer');
  static MANAGER = new Role('bankManager');
  static ADVISOR = new Role('bankAdvisor');

  getValue(): string {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
