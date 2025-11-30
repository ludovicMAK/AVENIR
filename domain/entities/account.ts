import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class Account{
    constructor(readonly accountType:AccountType,readonly IBAN:string,readonly accountName:string,readonly authorizedOverdraft:boolean,readonly status:StatusAccount,readonly idOwner:string){

    }
}