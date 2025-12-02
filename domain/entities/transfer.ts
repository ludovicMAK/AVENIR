import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class Transfer{
    constructor(readonly id:string,readonly amount:number,readonly dateRequested:Date,readonly dateExecuted:Date,readonly description:string){

    }
}