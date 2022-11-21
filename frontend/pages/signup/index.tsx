import React, { FormEventHandler, useState } from 'react'
import axios from 'axios'
import Router from 'next/router'
import { toast } from 'react-toastify'
import { Inputs, PropsIsAuth } from '../../src/utils/interfaces'

const SignUp = ({isAuthenticated, setAuth, isAuth}: PropsIsAuth): React.ReactNode => {

  const initialState = {
    username: '',
    password: ''
  }

  const [inputs, setInputs] = useState<Inputs>(initialState)
  const [validUsername, setValidUsername] = useState<'userValid' | ''>('')

  const {username, password} = inputs

  const passRegex = new RegExp('^(.*)?([A-Z]+.*[0-9]+)|([0-9]+.*[A-Z]+)(.*?)$')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({...inputs, [e.target.name]: e.target.value})
  }

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let messages = []

    if (username.length < 3) {
      messages.push('Nome do usuário deve conter, pelo menos, 3 caracteres.')
    }

    if (password.length < 8) {
      messages.push('A senha deve conter, pelo menos, 8 caracteres.')
    }

    if (!passRegex.test(password)) {
      messages.push('A senha deve conter, pelo menos, um número e uma letra maiúscula.')
    }

    if (messages.length !== 0) {
      for (let i = 0; i <= messages.length - 1; i++) {
        toast.error(messages[i], {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
      return
    }

    try {

      const response = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/signup',
        data: {
          username,
          password
        },
        withCredentials: true
      })

    if (response.request.status == 201) {
      // setAuth!(true)
      toast.success('Usuário criado com sucesso.')
      isAuth!()
      window.setTimeout(() => {
        Router.push('/account')
      }, 2000)
    }

    } catch (err: any) {
      console.log(err)
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
            <h2 className='sign_hero-main'>Cadastre-se</h2>
            <p className='sign_hero_secondary'>Informe um nome de usuário e uma senha!</p>
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
                <label htmlFor='username' className='form_container-label'>Senha</label>
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

export default SignUp