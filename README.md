# NG.CASH | Processo Seletivo

Este é um repositório contendo uma aplicação web _fullstack_, dockerizada, para o processo seletivo da NG.

## Sobre

A aplicaçāo contém um servidor em Node.js com express comunicando-se com um banco de dados postgreSQL e uma webpage para possibilitar a interaçāo com o servidor.

Nas pastas (backend e frontend), há um README.md com maiores informações sobre elas.

## Como usar

- (No terminal de comando)

1. Clone este repositório em uma pasta de sua preferência

```bash
git clone https://github.com/letguilhermec/selection_process.git <pasta de sua preferência>
```

2. Vá até a pasta onde o repositório foi clonado

```bash
cd <pasta de sua preferência>
```

3. Construa e rode as imagens / contêineres via Docker

```bash
docker compose-up --build -d
```
| A flag '-d' rodará os contêineres em modo 'desanexado', deixando o teminal livre

4. Para semear o banco de dados, com as tabelas e funções necessárias

```bash
docker exec -it ng_cash-backend bash
```
| Isto permitirá que você acesse o bash do servidor
```bash
npm run createDB
```
| Se tudo der certo, você deverá ver a seguinte mensagem:
```bash
> ng-backend@1.0.0 createDB
> node ./dist/scripts/createDB.js
```

### Pronto! O servidor estará disponível na porta 8000 e o website na porta 8000

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Prerequisito

Instale [Docker Desktop](https://docs.docker.com/get-docker) para Mac, Windows, ou Linux. Docker Desktop inclui Docker Compose como parte da instalaçāo.


## Após o uso

Quando terminar de utilizar a aplicação

```bash
docker-compose down
```
| Este comando parará os contêineres automaticamente

Para apagar as images geradas (normalmente com os nomes de \<pasta>-front e \<pasta>-server)

``` bash
docker rmi <pasta>-front e <pasta>-server
```