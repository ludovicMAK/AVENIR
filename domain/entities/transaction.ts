import { Direction } from  "@domain/values/direction";
import { StatusTransaction } from "@domain/values/statusTransaction";
    



export class Transaction{
    constructor(readonly id:string,readonly accountIBAN:string,readonly direction:Direction,readonly amount:number,readonly reason:string,readonly accountDate:Date,readonly status:StatusTransaction,readonly transferId:string){

    }
}