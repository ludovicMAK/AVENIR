
export interface GenerateAmortizationService {
    generate(email: string, token: string, firstname: string, lastname: string): Promise<void>
}