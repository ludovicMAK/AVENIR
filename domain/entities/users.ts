import { Role } from "../object-value/role";

export class User{
    constructor(readonly id:string,readonly lastname:string, readonly firstname:string,readonly mail:string,readonly role:Role,readonly password:string){

    }
}