import { User } from "./users";

export class Account{
    constructor(readonly IBAN:string,readonly user:User,readonly name:string){

    }
}