import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"

export function auth(req: Request, res:Response, next:NextFunction){
    const token = req.headers["authorization"]

    const decodedInformation = jwt.verify(token as string, JWT_SECRET)

    if (decodedInformation) {
        
        // @ts-ignore
        req.userId = decodedInformation.id
        next()
    } else {
        res.status(403).json({
            msg:"you are not logged in"
        })
    }
}