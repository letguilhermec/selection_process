import axios from 'axios'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { PropsIsAuth, Exchange, PropsExchange, UserData } from '../../src/utils/interfaces'

const removeParenthesis = (str: string) => {
let removedChars = /["]|[)]|[(]/g
   str = str.replace(removedChars, '')
   return str
}

const formatDate = (date: Date) => {
    let newDate = new Date(date)
    let day = newDate.getDate()
    let month = newDate.getMonth()
    let year = newDate.getFullYear()
    return `${day}/${month + 1}/${year}`
}

const formatMaxDate = (date: Date) => {
    let newDate = new Date(date)
    let day = newDate.getDate()
    let month = newDate.getMonth()
    let year = newDate.getFullYear()
    return `${year}-${month + 1}-${day}`
}

const AccountExtrato = ({isAuth, userData, isAuthenticated}: PropsIsAuth) => {
    const [transferencias, setTransferencias] = useState<Exchange[]>([])
    const [inputs, setInputs] = useState<PropsExchange>({
        start: '',
        end: '',
        cashin: false,
        cashout: false
    })

    const {start, end, cashin, cashout} = inputs

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.type == 'checkbox') {
            setInputs({...inputs, [e.target.name]: e.target.checked})
        } else {
            setInputs({...inputs, [e.target.name]: e.target.value})
        }
    }

    let url = 'http://127.0.0.1:8000/api/v1/transactions/check'

    const formatUrl = (url: string, {start, end, cashin, cashout}: PropsExchange): string => {
        if (!start && !end && !cashin && !cashout) {
            return url
        }

        if (start) {
            url += `?start=${start}`
            if (end) {
                url += `&end=${end}`
            }
            if (cashin) {
                url += '&cashin=true'
            }
            if (cashout) {
                url += '&cashout=true'
            }
            return url
        }

        if (end) {
            url += `?end=${end}`
            if (start) {
                url += `&start=${start}`
            }
            if (cashin) {
                url += '&cashin=true'
            }
            if (cashout) {
                url += '&cashout=true'
            }
            return url
        }

        if (cashin) {
            url += '?cashin=true'
            if (start) {
                url += `&start=${start}`
            }
            if (end) {
                url += `&end=${end}`
            }
            if (cashout) {
                url += '&cashout=true'
            }
            return url
        } 

        if (cashout) {
            url += '?cashout=true'
            if (start) {
                url += `&start=${start}`
            }
            if (end) {
                url += `&end=${end}`
            }
            if (cashin) {
                url += '&cashin=true'
            }
            return url
        }

        return url
    }

    const getExchanges = async () => {
        try {
            let response = await axios({
                method: 'GET',
                url,
                withCredentials: true
            })
            setTransferencias(response.data.data.transactions)
        } catch (err) {
            toast.error('Nāo foi possível acessar o extrato. Por favor, tente novamente.')
        }
    }

    const getFilteredExhanges = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        let newUrl: string = formatUrl(url, inputs)
        try {
            let response = await axios({
                method: 'GET',
                url: newUrl,
                withCredentials: true
            })
            setTransferencias(response.data.data.transactions)
        } catch (err) {
            toast.error('Nāo foi possível acessar o extrato. Por favor, tente novamente.')
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você nāo está logado. Por favor, faça o login.')
            Router.push('http://127.0.0.1:3000/')
        } else {
            getExchanges()
        }
    }, [])

    return (
        <main>
            <div className='nav_bg'></div>
          <section className='white_bg'>
            <div className='hero white_bg transactions'>
            <h2 className='hero_text-main'>Extrato</h2>
            <form className='exchanges_params' onSubmit={getFilteredExhanges}>
                <div className='exchanges_main'>
                <div className='column1'>
                    <label htmlFor='start' className='input-title'>Início</label>
                    <input type='date' name='start' id='start' className='checkbox-container' min='2022-01-01' max={formatMaxDate(Date.now() as unknown as Date)} onChange={onChange} />
                    <label htmlFor='end' className='input-title'>Fim</label>
                    <input type='date' name='end' id='end' className='checkbox-container' min='2022-01-01' max={formatMaxDate(Date.now() as unknown as Date)} value={end} onChange={onChange} />
                </div>
                <div className='column2'>
                    <p className='input-title'>Destinatário</p>
                    <div className='slideTwo'>
                        <input type='checkbox' name='cashin' id='cashin' checked={cashin} onChange={onChange} />
                        <label htmlFor='cashin'></label>
                    </div>
                    <p className='input-title'>Remetente</p>
                    <div className='slideTwo'>
                        <input type='checkbox' name='cashout' id='cashout' checked={cashout} onChange={onChange} />
                        <label htmlFor='cashout'></label>
                    </div>
                </div>
                </div>
                <div className='exchanges-btn center'>
                    <button type='submit' className='sign_hero-btn search'>Pesquisar</button>
                </div>
            </form>
            <div className='exchanges_container'>
                <div className='exchanges_container-item'>
                    <p className='exchanges_container-header'>Usuário</p>
                    <p className='exchanges_container-header'>Data</p>
                    <p className='exchanges_container-header'>Valor</p>
                </div>
                {transferencias.length > 0 && transferencias.map(e =>  (

                    userData!.username == removeParenthesis(e.remetente) ? (
                        <div className='exchanges_container-item' key={e.horário}>
                            <p className='exchanges_container-row'>{removeParenthesis(e.destinatário)}</p>
                            <p className='exchanges_container-row'>{formatDate(e.horário as unknown as Date)}</p>
                            <p className='exchanges_container-row value_red'>R$ {e.valor.replace('$', '')}</p>
                        </div>
                    ) : (
                        <div className='exchanges_container-item' key={e.horário}>
                            <p className='exchanges_container-row'>{removeParenthesis(e.remetente)}</p>
                            <p className='exchanges_container-row'>{formatDate(e.horário as unknown as Date)}</p>
                            <p className='exchanges_container-row value_green'>R$ {e.valor.replace('$', '')}</p>
                        </div>
                    )
                )
                )}
                {transferencias.length == 0 && (
                    <p className='exchanges_container-row'>Não há transferências a serem exibidas</p>
                )}      
            </div>
            </div>
          </section>
        </main>
      )
}

export default AccountExtrato