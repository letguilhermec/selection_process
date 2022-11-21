import '../styles/globals.css'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app'
import NavFooterLayout from '../src/components/NavFooterLayout'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {AuthOptions, UserData, } from '../src/utils/interfaces'
import Router from 'next/router'

export default function App({ Component, pageProps }: AppProps) {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData>({
    username: '',
    id: '',
    accid: ''
  })
  const [offset, setOffset] = useState<number>(0)

  const setAuth = (boolean: boolean) => {
    setIsAuthenticated(boolean)
  }

  const isAuth = async () => {
    try {
      const response = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/v1/users/verify',
        withCredentials: true
      })
      
      response.status == 200 ? setIsAuthenticated(true) : setIsAuthenticated(false)

      console.log(response)

      if (response.status == 200) {
        setUserData({
          username: response.data.username,
          id: response.data.id,
          accid: response.data.accid
        })
        setAuth(true)
        Router.push('/account')
      } else {
        setAuth(false)
      }

    } catch (err) {
      console.log(err)
      console.log('Usuário nāo está logado.')
    }
  }

  useEffect(() => {
    isAuth()
    const onScroll = () => setOffset(window.pageYOffset);
    
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [])

  return (
    <div className='app'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
        limit={3}
      />
    <NavFooterLayout isAuthenticated={isAuthenticated} setAuth={setAuth} isAuth={isAuth} userData={userData} offset={offset}>
      <Component {...pageProps} isAuth={isAuth} isAuthenticated={isAuthenticated} setAuth={setAuth} userData={userData} />
    </NavFooterLayout>
  </div>
  )
}
