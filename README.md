# LCNXMAS · Evento de Natal 2026

Bot de Discord da LCN, desenvolvido em TypeScript na branch `bot-natal`. O painel dá acesso às atividades do evento. As cenouras ganhas na plantação ficam guardadas no MongoDB.

## Fluxo de trabalho no GitHub

1. Antes de cada alteração, lê este README e executa `git pull --ff-only origin bot-natal` na branch `bot-natal`. Se o pull atualizar o README, relê-o.
2. Verifica a alteração e faz um commit por cada alteração lógica concluída.
3. Logo após cada commit, executa `git push origin bot-natal` para publicar todos os commits locais pendentes da branch. Confirma que o push terminou com sucesso. Se houver um bloqueio, comunica-o.

## Estado atual

O levantamento compara as três fotografias do caderno com o código em `ce12827`. O `git pull` confirmou que esse era também o commit mais recente de `origin/bot-natal` no momento da verificação.

| Funcionalidade | Estado | Comportamento atual |
| --- | --- | --- |
| Painel | Implementado no código | Publica os oito botões com o banner e o divisor de Natal. Ao arrancar, procura uma mensagem anterior do próprio bot e atualiza-a. Se não encontrar uma, publica o painel. |
| 1. Participar | Implementado no código | Atribui o cargo de participante e confirma no mesmo canal com uma resposta efémera. Se o membro já tiver o cargo, recebe uma mensagem a indicá-lo. O acesso aos outros canais depende das permissões configuradas no Discord. |
| 2. Plantação | Implementado no código | O botão abre o canal da plantação. Há uma mensagem pública no arranque e novas colheitas a intervalos aleatórios de 30 a 180 minutos. Cada participante pode colher uma vez na mensagem atual e recebe entre 100 e 1000 cenouras, com confirmação privada no próprio canal. Quando sai a próxima colheita, a mensagem anterior perde o botão e fica encerrada. O MongoDB guarda o saldo e impede créditos repetidos. |
| 3. Coleção | Parcial | Mostra saldo, boosts e ranking numa resposta efémera aos participantes. O ranking usa o saldo atual e, em caso de empate, o total ganho e a antiguidade no servidor. O campo de boosts mostra sempre «Nenhum». |
| 4. Loja | Parcial | Abre um catálogo efémero com sete artigos. As compras de cargos de Natal antigos, dos cargos de Level e do cargo Xmas 26 estão ligadas ao saldo em cenouras. Os outros artigos estão desativados. |
| 5. Rena | Pendente | O botão mostra uma mensagem de teste. |
| 6. Querido Pai Natal… | Pendente | O botão mostra uma mensagem de teste. |
| 7. Missões Diárias | Pendente | O botão mostra uma mensagem de teste. |
| 8. Converter Moedas | Pendente | O botão mostra uma mensagem de teste. |

## Próximos passos

1. **Validar o que já existe.** Num servidor de teste, confirmar que o bot reutiliza o painel após reiniciar, que o cargo abre os canais previstos e que o segundo clique em **Entrar** recebe uma resposta privada. Confirmar que dois participantes conseguem colher na mesma mensagem, que cada um recebe apenas um crédito e que uma mensagem anterior não permite colher. Verificar o saldo e o ranking na coleção.
2. **Loja.** Verificar as compras de cargos num servidor de teste. O pacote de Level custa 3.000 cenouras e contém os 20 cargos da roleta da `main`, do Level 1 ao Level 500. O Level 600 fica excluído. O bot recusa a compra sem cobrar se o membro já tiver um cargo do artigo. Se uma entrega ficar pendente, voltar a clicar no mesmo artigo retoma-a sem novo débito.
   - **Boosts por concluir.** Podem ser comprados várias vezes e acumulam efeitos. Por agora, a duração definida é permanente, sem expiração. Rever esta regra e confirmar o cálculo da acumulação antes de fechar a funcionalidade.
   - **Pets por concluir.** A referência da LCN é o catálogo de 20 espécies do UnbelievaBoat, com descoberta por raridade (Common 60%, Uncommon 28%, Rare 10%, Legendary 2%). A compra «Pet à escolha» permite escolher a espécie, e «Pet no nível máximo» destina-se a um pet que o membro já tem. A equipa pode fazer estas entregas com `/pet-manage give` e `/pet-manage set-level` do UnbelievaBoat. Falta decidir como encaminhar os pedidos da Loja para a equipa, ou se o bot de Natal terá pets próprios provisórios, sem ligação à coleção do UnbelievaBoat. [Guia de administração de pets](https://faq.unbelievaboat.com/dashboard/pets/)
3. **Rena.** Mostrar um painel efémero com a imagem da rena, o saldo do membro, as cenouras que já deu e botões para a alimentar. Debitar as cenouras, guardar o total por participante e apurar quem mais contribuiu para atribuir as recompensas, incluindo o cargo Xmas26. Confirmar os valores dos botões, a imagem, a data de apuramento, as recompensas e a regra de desempate.
4. **Querido Pai Natal…** Permitir que o participante escreva uma carta e escolha uma prenda para o dia de Natal. O painel atual anuncia uma única carta por participante. Confirmar as prendas disponíveis e como e quando a entrega deve ocorrer.
5. **Missões Diárias.** Mostrar as missões, acompanhar o progresso e atribuir o bónus em cenouras. Confirmar as tarefas, as recompensas e a hora de renovação.
6. **Converter Moedas.** Permitir trocar moedas por cenouras e aplicar o limite de 1000 cenouras por dia mostrado no esboço. Confirmar a origem do saldo de moedas, a taxa de câmbio e quando o limite reinicia.
7. **Completar os boosts da Coleção.** Mostrar os boosts ativos reais. O esboço sugere exemplos ligados às cenouras e à conversão. Confirmar como se obtêm, quanto duram e o efeito de cada um antes de os aplicar.

## Configuração e verificação local

- Define `DISCORD_TOKEN` no ambiente ou num ficheiro `.env`. Define `MONGODB_URI` se usares uma instância diferente de `mongodb://127.0.0.1:27017/bot-natal`.
- Os IDs do canal do painel, do canal da plantação e do cargo de participante estão em `src/painel.ts`, `src/buttons/plantacao.ts` e `src/buttons/entrar.ts`, respetivamente. Confirma estes IDs e as permissões do bot e do cargo antes de testar num servidor.
- Com as dependências instaladas, usa `npm run dev` para arrancar em desenvolvimento. Para executar a versão compilada, usa `npm run build` e depois `npm start`.
- A verificação de tipos com `npm.cmd run build -- --noEmit` passou. O comportamento no Discord e no MongoDB foi revisto pelo código e fica por testar num servidor.
