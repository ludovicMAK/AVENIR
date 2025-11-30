import { Request, Response } from "express"
import { AccountController } from "@express/controllers/AccountController"
import { sendSuccess } from "../responses/success"
import { mapErrorToHttpResponse } from "../responses/error"

export class AccountHttpHandler {
    constructor(private readonly controller: AccountController) {}
        public async listByOwnerId(request: Request, response: Response) {
            try {
                const ownerId = request.body.id; 

                
                if (!ownerId) {
                    return response.status(400).send({ 
                        code: "MISSING_ID", 
                        message: "L'ID du propriétaire est requis dans le corps de la requête." 
                    });
                }
                
                const accounts = await this.controller.listByOwnerId(ownerId)
                
                return sendSuccess(response, {
                    status: 200,
                    code: "ACCOUNTS_RETRIEVED",
                    message: "Accounts successfully retrieved.",
                    data: { accounts : accounts },
                })
            } catch (error) {
                return mapErrorToHttpResponse(response, error)
            }
        }
    
}