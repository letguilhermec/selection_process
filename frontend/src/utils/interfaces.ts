import React from 'react'

export interface Inputs {
    username: string
    password: string
}

export interface PropsIsAuth {
    children: React.ReactNode
    isAuth: () => void
    isAuthenticated: boolean
    setAuth: (a: boolean) => void
    userData: UserData
    offset?: number
}

export interface PropsExchange {
  start: string
  end: string
  cashin: boolean
  cashout: boolean
}

export interface AuthOptions {
  method: string
  url: string
  data?: {
    jwt: string | null
  }
}

export interface UserData {
  username: string
  id: string
  accid: string
}

export interface Transferencia {
  
}

export interface Exchange {
  destinatário: string
  remetente: string
  valor: string
  horário: string
}

export interface Transfer {
  cashInUser: string
  amount: string
}