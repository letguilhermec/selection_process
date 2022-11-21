import React, {useEffect, useState} from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import whiteLogo from '../../public/whiteLogo.svg'
import axios from 'axios'
import { PropsIsAuth } from '../utils/interfaces'
import Router from 'next/router'
import { toast } from 'react-toastify'

export default function NavFooterLayout({children, isAuthenticated, setAuth, offset}: PropsIsAuth)  {
  const [active, setActive] = useState<'isActive' | ''>('')

  const handleOpenCloseHamburger = () => {
    setActive(prev => prev == '' ? 'isActive' : '')
  }

  const handleCloseHamburger = () => {
    setActive(prev => prev = 'isActive' ? '' : prev)
  }

  const handleLogout = async () => {
    await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/signout',
      withCredentials: true
    })
    setAuth!(false)
    toast.success('Desconectado.')
    Router.push('/')
  }

  

  return (
    <div>
      <Head>
        <title>NG.CASH</title>
        <meta name='description' content="Mock Website for NG.CASH's selection process" />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header className={`header ${offset! > 7 ? 'black' : ''}`}>
        <nav className='header_nav'>
          <div className='header_logo'>
            <Link href='/' onClick={handleCloseHamburger}>
            <Image
              src={whiteLogo}
              alt='Logo image'
              className='header_logo-image'
              />
              </Link>
          </div>
          {isAuthenticated ? (
            <ul className={`header_list acc-list list-${active}`}>
              <Link href='/account/saldo' onClick={handleOpenCloseHamburger} className='header_list-a a-auth'>
                <li className='header_list-btns a-btns'>Saldo</li>
              </Link>
              <Link href='/account/extrato' onClick={handleOpenCloseHamburger} className='header_list-a a-auth'>
                <li className='header_list-btns a-btns'>Extrato</li>
              </Link>
              <Link href='/account/transferencia' onClick={handleOpenCloseHamburger} className='header_list-a a-auth'>
                <li className='header_list-btns a-btns'>Transferir</li>
              </Link>
              <Link href='/' onClick={() => {handleLogout(); handleCloseHamburger()}} className='header_list-a a-auth exit'>
                <li className='header_list-btns btn-sair a-btns'>Sair</li>
              </Link>
            </ul>
          ) : (
            <ul className={`header_list list-${active}`}>
              <Link href='/signup' onClick={handleOpenCloseHamburger} className='header_list-a cta'>
              <li className='header_list-btns'>Cadastrar</li>
              </Link>
              <Link href='/signin' onClick={handleOpenCloseHamburger} className='header_list-a'>
              <li className='header_list-btns'>Acessar</li>
              </Link>
            </ul>
          )}
          <button className={`header_hamburger ${active}`} onClick={handleOpenCloseHamburger}>
            <span className='header_hamburger-bar'></span>
            <span className='header_hamburger-bar'></span>
            <span className='header_hamburger-bar'></span>
          </button>
        </nav>
      </header>

      <main className='main_container'>{children}</main>

      <footer className='footer'>
        <div className='footer_text'>
          <h3 className='footer_text-main'>NG.CASH é a carteira digital da Nova Geração.</h3>
          <p className='footer_text-secondary'>Viemos te ajudar a construir a sua independência financeira.</p>
          <p className='footer_text-secondary'>Vamos transformar o futuro juntos.</p>
        </div>
        <div className='footer_text'>
          <h3 className='footer_text-main'>Contato</h3>
          <p className='footer_text-secondary bold'>suporte@ng.cash</p>
          <p className='footer_text-secondary'>
            NG.CASH
            <br></br>
            Rua Marquês de São Vicente, 225 - Gávea Rio de Janeiro - RJ Brasil
            - CEP 22451-900
          </p>
        </div>
        <div className='footer_text'>
            <p className='footer_text-terciary'>&copy; Guilherme de Carvalho Correa | NG.CASH</p>
          </div>
      </footer>
    </div>
  )
}
