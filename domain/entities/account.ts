import { User } from "@/domain/entities/users";

export class Account{
    constructor(readonly IBAN:string,readonly user:User,readonly name:string){

    }
}