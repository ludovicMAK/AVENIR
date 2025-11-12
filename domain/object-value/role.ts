export class Role {
    private constructor(private readonly value: 'customer' | 'bankManager' | 'bankAdvisor') {}

    static readonly CUSTOMER: Role = new Role('customer');
    static readonly MANAGER: Role = new Role('bankManager');
    static readonly ADVISOR: Role = new Role('bankAdvisor');

    getValue(): string {
        return this.value;
    }

    equals(other: Role): boolean {
        return this.value === other.value;
    }
}
