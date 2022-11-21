import Image from 'next/image'
import Router from 'next/router'
import { PropsIsAuth } from '../../src/utils/interfaces'
import {useEffect} from 'react'
import banner2 from '../../public/Banner2.png'

const AccountMain = ({isAuthenticated, userData}: PropsIsAuth) => {

  useEffect(() => {
    if (!isAuthenticated) {
      Router.push('http://localhost:3000/')
    }
  }, [])

    return (
        <main>
          <section className=''>
          <div className='bg_wrap .banner1'>
            <Image
                alt='background image'
                src={banner2}
                placeholder='blur'
                fill
                sizes='100vw'
                style={{
                    objectFit: 'cover'
                }}
            />
          </div>
            <div className='hero pt-3'>
            <h2 className='hero_text-main'>Olá, {userData!.username}</h2>
            <div>
            <p className='hero_text-secondary left'>No menu acima você pode:</p>
            <ul className='account_list'>
                <li className='account_list-item'>Verificar seu saldo</li>
                <li className='account_list-item'>Verificar seu extrato</li>
                <li className='account_list-item'>Realizar transferências</li>
            </ul>
            </div>
            </div>
          </section>
        </main>
      )
}

export default AccountMain