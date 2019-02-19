# Instruções de como rodar projeto

## Requisitos

1 - Necessário ter Node.js instalado.
2 - Necessário ter MongoDB instalado.
3 - Necessário ter Insomnia instalado.
4 - NoSQLBooster for MongoDB, caso queira ver os resgistros no banco de dados.

## Iniciar API

1 - Faça o download do projeto e descompacte, caso tenha baixado como .zip.
2 - Abra o Prompt de comando e entre na pasta do projeto.
3 - Execute a linha de código "npm install" para instalar os pacotes necessários.
4 - Após o download dos pacotes, basta apenas executar a linha de código "npm start".
5 - Quando aparecer a mensagem 'Express server listening on port 3001 in development mode', está pronto pra ser utilizado.

Obs.: O projeto está configurado pra rodar na porta 3001 do localhost.

![Subtitles in action](https://imgur.com/Lq4eHZh)

## Testes

1 - Abra o Insomia e clique na seta para abrir o menu. (fica no header de fundo roxo, ao lado do nome do programa)
2 - Escolha a opção _Import/Export_.
3 - Na view que irá aparecer, Clique em _Import Data > From File_.
4 - Vá até a pasta do projeto, entre na pasta **insomia/** e selecione o arquivo **insomnia_workspace** e clique no botão _Import_.
5 - Após isso você terá em mãos as 3 requests: Find (GET), FindById (GET) e Create (POST).

### POST /book (Create) - Refere-se ao primeiro item do desafio 

- Você pode passar os dados que desejar através do JSON que já está montado no formato necessário.
- Para executar basta apenas clicar em _'Send'_ que fica no canto superior direito, ao lado da url.
- Caso os dados estejam de acordo com o que o projeto precisa, será retornado o registro salvo no banco de dados.
- Copie o valor do campo "_id_" retornado, pois será necessário para o próximo teste.

![Subtitles in action](https://imgur.com/rpLxntC)

### GET /books/{id} (FindById) - Refere-se ao segundo item do desafio 

- Com o id do item desejado em mãos, insira ou substitua o valor na url do request após 'books/'. (ex: /books/*_ID AQUI*)
- Para executar basta apenas clicar em _'Send'_ que fica no canto superior direito, ao lado da url.
- Caso o id seja válido, será retornado o registro salvo no banco de dados.

![Subtitles in action](https://imgur.com/qtqa3Oh)

### GET /books (Find) - Refere-se ao terceiro item do desafio 

- Para executar basta apenas clicar em _'Send'_ que fica no canto superior direito, ao lado da url.
- O resultado será retornado com a mesma estrutura especificada no desafio.

![Subtitles in action](https://imgur.com/zqAzwXi)
