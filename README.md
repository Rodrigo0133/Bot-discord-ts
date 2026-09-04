# Bot de Discord em TypeScript

Este projeto nasceu da vontade de criar um sistema de recompensas para uma comunidade no Discord. Em vez de ser apenas um conjunto de respostas automáticas, o bot guarda dados de cada membro, controla tickets e permite trocá-los por recompensas através de uma roleta.

Foi também a forma que encontrei de praticar TypeScript num projeto real, trabalhar com uma base de dados e perceber melhor como diferentes serviços comunicam entre si. O bot liga a API do Discord, o MongoDB e a economia do UnbelievaBoat num único fluxo.

## O que o bot faz

Cada membro pode tentar obter um ticket através do comando `/ticket`. A tentativa tem um intervalo de duas horas e uma probabilidade de sucesso de 10%. Os tickets ficam guardados no MongoDB e podem depois ser usados na roleta.

Ao executar `/roleta`, o bot apresenta uma imagem de espera, sorteia uma recompensa com base em pesos definidos no código e desconta um ticket. A recompensa pode ser dinheiro na economia do servidor, um cargo de nível, um cargo VIP ou um cargo exclusivo.

O projeto inclui ainda comandos para consultar o saldo de tickets e para permitir que membros autorizados adicionem ou retirem tickets manualmente.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `/ola` | Confirma que o bot está online e a responder. |
| `/help` | Mostra uma explicação resumida dos principais comandos. |
| `/ticket` | Faz uma tentativa para obter um ticket. |
| `/stock [utilizador]` | Consulta os tickets do próprio membro ou de outro utilizador. |
| `/roleta` | Gasta um ticket e sorteia uma recompensa. |
| `/recompensas` | Apresenta as recompensas e respetivas probabilidades. |
| `/add ticket` | Adiciona tickets a um utilizador. Requer um dos cargos autorizados. |
| `/remove ticket` | Retira tickets a um utilizador sem permitir um saldo negativo. Requer um dos cargos autorizados. |
| `/pity` | Consulta o progresso do sistema de garantia associado aos cargos de evento. |

## Tecnologias utilizadas

- TypeScript, com verificação de tipos em modo `strict`
- Node.js
- Discord.js
- MongoDB e Mongoose
- UnbelievaBoat API
- dotenv para carregar variáveis de ambiente

## Como executar o projeto

### Requisitos

Antes de começar, é necessário ter:

- Node.js instalado
- uma instância local do MongoDB em execução
- uma aplicação criada no Discord Developer Portal
- um servidor de Discord onde seja possível instalar e testar o bot
- um token da API do UnbelievaBoat

### Instalação

Clona o repositório e instala as dependências:

```bash
git clone https://github.com/Rodrigo0133/Bot-discord-ts.git
cd Bot-discord-ts
npm install
```

Cria um ficheiro `.env` na raiz do projeto com estas variáveis:

```env
DISCORD_TOKEN=token_do_bot
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor
UNB_API_TOKEN=token_da_api_unbelievaboat
```


Os IDs dos cargos usados nas permissões e nas recompensas pertencem ao servidor para o qual o projeto foi criado. Para usar o bot noutro servidor, é necessário substituir esses IDs em `src/config/constants.ts` e na configuração da roleta.

### Registo dos comandos

Compila primeiro o projeto e regista os slash commands no servidor indicado por `GUILD_ID`:

```bash
npm run build
npm run registrar
```

O registo só precisa de ser repetido quando a definição de um comando muda, por exemplo o nome, a descrição ou as opções.

### Arranque

Durante o desenvolvimento:

```bash
npm run dev
```

Para executar a versão compilada:

```bash
npm run build
npm start
```

Por predefinição, o bot tenta ligar-se ao MongoDB em `mongodb://127.0.0.1:27017/Discord`. Para alterar o nome da base de dados, basta substituir `Discord` pelo nome pretendido.

## Estrutura do projeto

```text
assets/
  content.png             imagem apresentada durante a roleta
src/
  commands/               definição e execução dos slash commands
  config/
    constants.ts          cooldown e cargos com permissões especiais
  database/
    database.ts           ligação ao MongoDB e modelo dos utilizadores
  deploy-commands.ts      registo dos comandos no servidor de Discord
  index.ts                arranque do bot e encaminhamento das interações
```

Cada comando mantém no mesmo ficheiro a definição enviada ao Discord e a função responsável pela sua execução. O `index.ts` recebe as interações e encaminha-as para o comando correto através de um mapa de handlers.

## Dados guardados

O MongoDB guarda um documento por utilizador e servidor. Atualmente, cada documento contém:

- o ID do utilizador
- o ID do servidor
- a data da última tentativa de obter um ticket
- o número de tickets disponíveis
- o progresso do sistema de garantia da roleta

Esta separação permite que o mesmo utilizador tenha dados diferentes em servidores diferentes.

## Decisões que tomei durante o desenvolvimento

Escolhi TypeScript não só como forma de aprendizagem, mas também pelas vantagens da tipagem estática.

Escolhi MongoDB por ser a base de dados com que tenho mais experiência e familiaridade.

Usei pesos inteiros na roleta para evitar trabalhar diretamente com vários valores decimais. O sorteio gera um número entre 0 e 99 999 e percorre as recompensas até encontrar o intervalo correspondente.

O cooldown fica guardado na base de dados em vez de existir apenas em memória. Assim, reiniciar o bot não permite contornar o tempo de espera.

Nos comandos administrativos, a autorização é verificada através dos cargos do membro. A remoção de tickets também valida o resultado antes de guardar, para impedir saldos negativos.

As recompensas monetárias são atribuídas através da API do UnbelievaBoat. As restantes recompensas usam o sistema de cargos do Discord, o que significa que o cargo do bot precisa de estar acima dos cargos que vai atribuir.

## Estado atual

Considero o bot concluído dentro dos objetivos que defini para este projeto pessoal.

## Licença

Distribuído sob a licença MIT. Consulta o ficheiro [LICENSE](LICENSE) para mais informação.
