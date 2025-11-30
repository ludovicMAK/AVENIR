
import { randomBytes } from "node:crypto";
const COUNTRY_CODE = 'FR';
const BBAN_LENGTH = 23; 


function charToNumeric(char: string): string {
    const code = char.charCodeAt(0);
    // 0-9
    if (code >= 48 && code <= 57) {
        return char;
    }
    // A-Z
    if (code >= 65 && code <= 90) {
        return (code - 55).toString(); 
    }
    throw new Error(`Caractère invalide dans l'IBAN : ${char}`);
}


function mod97(numericString: string): number {
    let remainder = 0;
    
    for (let i = 0; i < numericString.length; i++) {
        const char = numericString[i];
        
        remainder = remainder * 10 + parseInt(char, 10);

        if (remainder >= 97) {
            remainder = remainder % 97;
        }
    }
    return remainder;
}


function generateRandomBBAN(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomBytesBuffer = randomBytes(BBAN_LENGTH); 
    let bban = '';

    for (let i = 0; i < BBAN_LENGTH; i++) {
        const randomIndex = randomBytesBuffer[i] % chars.length;
        bban += chars[randomIndex];
    }
    return bban;
}


export class NodeIBANGenerator {
    public generate(): string {
        const bban = generateRandomBBAN();

        const structureForCheck = bban + COUNTRY_CODE + '00';

        let numericStructure = '';
        for (const char of structureForCheck) {
            numericStructure += charToNumeric(char);
        }

        const remainder = mod97(numericStructure);

        const checkDigits = 98 - remainder;
        const checkDigitsPadded = checkDigits.toString().padStart(2, '0');

        const iban = COUNTRY_CODE + checkDigitsPadded + bban;


        return iban.match(/.{1,4}/g)!.join(' ');
    }
}