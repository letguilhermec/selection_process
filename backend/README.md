# NG.CASH | Processo Seletivo | Backend

O servidor, dockerizado, roda na porta [8000](http://127.0.0.1:8000).

## IMPORTANTE

### A documentação completa da API pode ser acessada [neste site](https://documenter.getpostman.com/view/18687173/2s8YmPs1Uk). Documentação gerada através do Postman

## Sobre

O servidor tem como endpoint necessário '/api/v1', ou seja, toda requisiçāo deve ser feita a URL http://127.0.0.1:8000/api/v1/\<endpointfinal>/.

### Rota 'users'
- POST users/signup -> cadastro de novos usuários
- POST users/signin -> acesso à contas já cadastradas
- GET users/signout -> endpoint destinado à retirada do cookie contendo um JSONWebToken do documento (document.cookies), retornando o usuário ao status de não logado.

### Rota 'balance'
- GET balance/check -> consulta ao saldo atual do usuário logado

### Rota 'transactions'
- GET transactions/check -> consulta ao extrato completo do usuário logado. O endpoint aceita parâmetros URL para filtrar a busca por período ou por transações em que o usuário tenha sido o remetente **ou** o destinatário
- POST transactions/exchange -> realiza transferência de valor entre o usuário logado e outro usuário cadastrado

---
## Exemplos de request e respoonse, detalhamento dos parâmetros e demais especificidades, sāo encontradas [aqui](https://documenter.getpostman.com/view/18687173/2s8YmPs1Uk)