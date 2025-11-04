export class Role {
  private constructor(private readonly value: 'customer' | 'bankManager' | 'bankAdvisor') {}

  static CUSTOMER: Role = new Role('customer');
  static MANAGER: Role = new Role('bankManager');
  static ADVISOR: Role = new Role('bankAdvisor');

  getValue(): string {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
