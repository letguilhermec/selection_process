import React, { useState } from 'react'
import Image from 'next/image'
import mockPhone from '../public/MockPhone.png'
import googlePlay from '../public/GooglePlay.png'
import appStore from '../public/AppStore.png'
import banner1 from '../public/Banner1.jpeg'
import banner3 from '../public/Banner3.png'

const Home = (): React.ReactNode => {
  return (
    <main>
      <section className='first'>
        <div className='bg_wrap'>
        <Image
          alt='background image'
          src={banner1}
          placeholder='blur'
          fill
          sizes='100vw'
          style={{
            objectFit: 'cover'
          }}
          />
          </div>
        <div className='hero'>
        <div className='hero_column1'>
        <h2 className='hero_text-main'>A carteira da nova geração.</h2>
        <p className='hero_text-secondary'>É para todas as idades!</p>
        <div className='hero_buttons'>
          <Image
            src={googlePlay}
            alt='Google Play Badge'
            className='hero_buttons-badge'
          />
          <Image
            src={appStore}
            alt='App Store Badge'
            className='hero_buttons-badge'
          />
        </div>
        </div>
        <div className='hero_column2'>
          <div className='hero_column2_image-container'>
          <Image
            src={banner3}
            alt='Imagem com um celular acessando o aplicativo NG.CASH'
            className='column2_image'
          />
          </div>
        </div>
        </div>
      </section>
      <section className='white'>
        <div className='hero hero-secondary'>
        <div className='hero_secondary_image'>
        <Image
          src={mockPhone}
          alt='mock phone'
          className='hero_image'
        />
        </div>
        <div className='hero_expanded'>
          <h2 className='hero_text-main expanded'>Sobre</h2>
          <p className='hero_text-subtitle text-400'>Somos a carteira digital da Nova Geração.</p>
          <p className='hero_text-subtitle'>Viemos te ajudar a construir a sua independência financeira.</p>
          <p className='hero_text-subtitle'>Vivemos o novo, transformando o futuro. Afinal, depois do ponto, vem um novo começo.</p>
        </div>
        </div>
      </section>
    </main>
  )
}

export default Home
