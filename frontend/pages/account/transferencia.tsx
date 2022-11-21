import axios from 'axios'
import Router from 'next/router'
import React, {useState, useEffect} from 'react'
import { toast } from 'react-toastify'
import { PropsIsAuth, Transfer } from '../../src/utils/interfaces'

const AccountTransfer = ({isAuthenticated}: PropsIsAuth): React.ReactNode => {

    const initialState: Transfer = {
        cashInUser: '',
        amount: ''
    }

    const sanitizeAmount = (str: string) => {
        return str.replace(',','.')
    }
    
    const [inputs, setInputs] = useState<Transfer>(initialState)

    const {cashInUser, amount} = inputs

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name == 'amount') {
            setInputs({...inputs, [e.target.name]: sanitizeAmount(e.target.value)})
        } else {
            setInputs({...inputs, [e.target.name]: e.target.value})
        }
    }
    
    const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
        const body = {cashInUser, amount}
        let response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/transactions/exchange',
            data: body,
            withCredentials: true
        })     


        if (response.data.status == 'success') {
            toast.success('Transferência realizada com sucesso.')
            setInputs(initialState)
        }
  
      } catch (err: any) {
        setInputs(initialState)
        if (err.response.data.message) {
          toast.error(err.response.data.message)
        } else {
          toast.error('Não foi possível realizar a transferência. Por favor, tente novamente.')
        }
      }
    }

    useEffect(() => {
      if (!isAuthenticated) {
            toast.error('Você nāo está logado. Por favor, faça o login.')
            Router.push('http://127.0.0.1:3000/')
      } else {
        return
      }
    }, [])
    

    return (
        <main className='sign_main'>
          <div className='nav_bg'></div>
          <section className='sign_hero'>
            <div className='sign_hero-card'>
              <div className='sign_hero-card--header'>
                <h2 className='sign_hero-main'>Transferir</h2>
                <p className='sign_hero_secondary'>Informe o nome do usuário de quem vai receber a transferência e o valor a ser transferido</p>
              </div>
              <form 
                className='form'
                onSubmit={onSubmitForm}
              >
                <div className='form_container'>
                  <div className='form_container-area'>
                    <label htmlFor='cashInUser' className='form_container-label'>Nome do usuário</label>
                    <input type='text'
                      placeholder='Quem vai receber a transferência'
                      required
                      name='cashInUser'
                      value={cashInUser}
                      onChange={e => onChange(e)}
                      className='form_container-input' />
                  </div>
                  <div className='form_container-area'>
                    <label htmlFor='amount' className='form_container-label'>Valor</label>
                    <input type='number'
                      placeholder='Valor'
                      required
                      name='amount'
                      min='0'
                      step='any'
                      value={amount}
                      onChange={e => onChange(e)}
                      className='form_container-input' />
                  </div>
                  <div className='form_container-area'>
                    <button
                      className='sign_hero-btn'
                      type='submit'
                      value='signup'
                    >
                      enviar
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
          </section>
        </main>
      )
}

export default AccountTransfer