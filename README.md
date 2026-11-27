# LCNXMAS · Evento de Natal 2026

Bot de Discord da LCN, desenvolvido em TypeScript na branch `bot-natal`. O painel dá acesso às atividades do evento. As cenouras ganhas na plantação ficam guardadas no MongoDB.

## Estado atual

O levantamento compara as três fotografias do caderno com o código em `ce12827`. O `git pull` confirmou que esse era também o commit mais recente de `origin/bot-natal` no momento da verificação.

| Funcionalidade | Estado | Comportamento atual |
| --- | --- | --- |
| Painel | Implementado no código | Publica os oito botões com o banner e o divisor de Natal. Ao arrancar, procura uma mensagem anterior do próprio bot e atualiza-a. Se não encontrar uma, publica o painel. |
| 1. Participar | Implementado no código | Atribui o cargo de participante e confirma no mesmo canal com uma resposta efémera. Se o membro já tiver o cargo, recebe uma mensagem a indicá-lo. O acesso aos outros canais depende das permissões configuradas no Discord. |
| 2. Plantação | Implementado no código | O botão abre o canal da plantação. Há uma colheita no arranque e novas colheitas a intervalos aleatórios de 30 a 180 minutos. Só um participante, o primeiro a reclamar a colheita, recebe entre 100 e 1000 cenouras. O anúncio público aparece depois de 10 segundos. O MongoDB guarda o saldo e permite recuperar anúncios pendentes no arranque. |
| 3. Coleção | Parcial | Mostra saldo, boosts e ranking numa resposta efémera aos participantes. O ranking usa o saldo atual e, em caso de empate, o total ganho e a antiguidade no servidor. O campo de boosts mostra sempre «Nenhum». |
| 4. Loja | Pendente | O botão mostra uma mensagem de teste. |
| 5. Rena | Pendente | O botão mostra uma mensagem de teste. |
| 6. Querido Pai Natal… | Pendente | O botão mostra uma mensagem de teste. |
| 7. Missões Diárias | Pendente | O botão mostra uma mensagem de teste. |
| 8. Converter Moedas | Pendente | O botão mostra uma mensagem de teste. |

## Próximos passos

1. **Validar o que já existe.** Num servidor de teste, confirmar que o bot reutiliza o painel após reiniciar, que o cargo abre os canais previstos e que o segundo clique em **Entrar** recebe uma resposta privada. Testar dois cliques na mesma colheita, confirmar que só há um crédito e verificar o saldo e o ranking na coleção.
2. **Loja.** Mostrar o catálogo numa resposta efémera e permitir compras em cenouras. O esboço indica cargos de Natal antigos, cargos de nível e o cargo Xmas26. Confirmar o catálogo completo, os preços, os cargos e as condições de compra antes de implementar o débito e a entrega.
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
