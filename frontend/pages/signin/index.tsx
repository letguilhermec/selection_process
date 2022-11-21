import axios from 'axios'
import React, {useState} from 'react'
import {toast} from 'react-toastify'
import Router from 'next/router'
import { Inputs, PropsIsAuth } from '../../src/utils/interfaces'

const SignIn = ({isAuth, setAuth}: PropsIsAuth): React.ReactNode => {

  const initialState = {
    username: '',
    password: ''
  }
    
    const [inputs, setInputs] = useState<Inputs>(initialState)

    const {username, password} = inputs

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({...inputs, [e.target.name]: e.target.value})
    }
    
    const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {

        const response = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/signin',
        data: {
          username,
          password
        },
        withCredentials: true
    })

    if (response.request.status == 200) {
        setAuth!(true)
        toast.success('Acesso bem sucedido.')
        isAuth!()
        window.setTimeout(() => {
          Router.push('/account')
        }, 2000)
      }
  
      } catch (err: any) {
        if (err.response.data.message) {
          toast.error(err.response.data.message)
        } else {
          toast.error('Falha. Por favor, tente novamente.')
        }
        setInputs(initialState)
      }
    }

    return (
        <main className='sign_main'>
          <div className='nav_bg'></div>
          <section className='sign_hero'>
            <div className='sign_hero-card'>
              <div className='sign_hero-card--header'>
                <h2 className='sign_hero-main'>Login</h2>
                <p className='sign_hero_secondary'>Informe o seu nome de usuário e sua senha!</p>
              </div>
              <form 
                className='form'
                onSubmit={onSubmitForm}
              >
                <div className='form_container'>
                  <div className='form_container-area'>
                    <label htmlFor='username' className='form_container-label'>Nome do usuário</label>
                    <input type='text'
                      placeholder='Usuário'
                      required
                      name='username'
                      value={username}
                      onChange={e => onChange(e)}
                      className='form_container-input' />
                  </div>
                  <div className='form_container-area'>
                    <label htmlFor='password' className='form_container-label'>Senha</label>
                    <input type='password'
                      placeholder='********'
                      required
                      name='password'
                      value={password}
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

export default SignIn