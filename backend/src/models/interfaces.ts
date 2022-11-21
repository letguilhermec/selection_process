import { SigningKeyCallback } from "jsonwebtoken"

export interface Payload {
  id: string
  iat: string
  exp: string
}

declare module "express-serve-static-core" {
  export interface Request {
    user?: UserSchema
    username?: string
    pass?: string
    start?: string | undefined
    end?: string | undefined
    cashin?: string | undefined
    cashout?: string | undefined
    cashInUserId: string
    amount?: string
  }
}

export interface UserSchema {
  id: string
  username: string
  password?: string | undefined
  accountid: string
}

export interface AccountSchema {
  id: string
  balance: number
}

export interface InformationalError {
  status: string;
  statusCode: number;
  isOperational: boolean;
  name: string;
  message: string;
  stack?: string | undefined
}

export type NewUserSchema = UserSchema & AccountSchema
