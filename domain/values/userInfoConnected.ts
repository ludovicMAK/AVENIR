import { Role } from "./role";

export class UserInfoConnected {
    constructor(
        readonly lastname: string,
        readonly firstname: string,
        readonly email: string,
        readonly role: Role,
        readonly status: string,
      ) {}
    
      
}