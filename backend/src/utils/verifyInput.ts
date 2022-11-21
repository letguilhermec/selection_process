import bcrypt from 'bcrypt'

let upperRegex = /[A-Z]/g
let numRegex = /[0-9]/g

const checkPassword = (pass: string) => {
  if (pass.length >= 8 && pass.match(upperRegex) && pass.match(numRegex)) {
    return true
  }
  return false
}

const compare = async (candidate: string, correct: string) => {
  return await bcrypt.compare(candidate, correct)
}

const checkDecimals = (value: number | string) => {
  if (typeof value !== 'string') {
    value = value.toString()
  }

  if (value.indexOf('e-') > -1) {
    let [base, trail] = value.split('e-')
    let deg = parseInt(trail, 10)
    return deg
  }

  if (Math.floor(Number(value)) !== Number(value)) {
    return value.split('.')[1].length || 0
  }

  return 0;

}

export {
  checkPassword,
  compare,
  checkDecimals
}
