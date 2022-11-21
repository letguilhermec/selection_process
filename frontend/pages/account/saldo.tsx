import axios from 'axios'
import Router from 'next/router'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { PropsIsAuth } from '../../src/utils/interfaces'
import banner2 from '../../public/Banner2.png'

const AccountSaldo = ({isAuth, isAuthenticated, setAuth }: PropsIsAuth) => {
    const [saldo, setSaldo] = useState<string | null>('')

    const getBalance = async () => {
        try {
            let response = await axios({
                method: 'GET',
                url: 'http://127.0.0.1:8000/api/v1/balance/check',
                withCredentials: true
            })
            if (response.status == 200) {
                setSaldo(response.data.data.balance)
            }
        } catch (err) {
            toast.error('Erro. Por favor, tente novamente.')
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você nāo está logado. Por favor, faça o login.')
            Router.push('http://127.0.0.1:3000/')
        } else {
            getBalance()
        }
    }, [])

    return (
        <main>
          <section className='first'>
          <div className='bg_wrap'>
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
            <div className='hero'>
            <h2 className='hero_text-main'>Saldo:</h2>
            <p className='hero_text-secondary balance'>{saldo}</p>
            </div>
          </section>
        </main>
      )
}

export default AccountSaldo