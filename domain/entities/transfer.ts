import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { StatusTransfer } from "@domain/values/statusTransfer";

export class Transfer{
    constructor(readonly id:string,readonly amount:number,readonly dateRequested:Date,readonly dateExecuted:Date,readonly description:string,readonly statusTransfer: StatusTransfer){

    }
}