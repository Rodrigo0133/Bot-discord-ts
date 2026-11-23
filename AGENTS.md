# Regras do projeto

- Desenvolve o bot de Natal na branch `bot-natal`, em TypeScript com `discord.js`. Mantém o arranque em `src/index.ts` e a lógica dos botões em `src/buttons/`. Concentra a ligação, modelos e operações do MongoDB em `src/db/`, usando Mongoose.
- Antes de executar uma instalação com npm, indica os pacotes envolvidos, explica o que fazem e por que são necessários para o pedido. Aguarda autorização explícita do utilizador. Esta regra inclui dependências de desenvolvimento.
- Faz um commit local por cada alteração lógica concluída e verificada.
- Implementa apenas a funcionalidade pedida. Quando tiveres qualquer dúvida, mesmo que pareça trivial, pergunta ao programador antes de assumir uma regra ou inventar funcionalidades.
- Segue o exemplo visual e usa as imagens fornecidas. Ao arrancar, o bot deve reutilizar o painel existente no canal configurado. As confirmações privadas dos botões aparecem no próprio canal através de respostas efémeras.
- Se uma tentativa falhar, remove o que criaste nessa tentativa quando fizer sentido. Preserva o trabalho anterior do utilizador.

## Documentação com Context7

- Consulta o Context7 para perguntas sobre bibliotecas, frameworks, SDKs, APIs, ferramentas de linha de comandos ou serviços cloud, incluindo sintaxe, configuração, migração, instalação e erros específicos. Dá preferência ao Context7 para documentação de bibliotecas.
- Começa por `resolve-library-id` com o nome e a questão, salvo quando o utilizador indicar o ID exato no formato `/org/project`. Escolhe pela correspondência do nome, relevância, exemplos, reputação e pontuação. Usa a versão pedida e reformula a pesquisa se os resultados forem inadequados.
- Usa `query-docs` com o ID escolhido. Faz uma consulta por conceito, juntando conceitos apenas quando a questão for sobre a interação entre eles. Baseia a resposta na documentação obtida.
- Dispensa esta consulta para refatoração, scripts de raiz, depuração de lógica de negócio, revisão de código e conceitos gerais de programação.
