import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";

    



export class Transaction{
    constructor(readonly id:string,readonly accountIBAN:string,readonly transactionDirection:TransactionDirection,readonly amount:number,readonly reason:string,readonly accountDate:Date,readonly status:StatusTransaction,readonly transferId:string){

    }
}