# English Circle: página aulas-em-turma.html

Página de vendas do English Circle. Tudo que muda no dia a dia fica em um arquivo só:
`assets/english-circle/englishCircle.config.js`.

Arquivos: `aulas-em-turma.html` (copy e estrutura), `assets/english-circle/ec.css` (visual), `ec.js` (comportamento), `privacidade.html` (LGPD).

## Trocar o estado da página
Em `englishCircle.config.js`, mude `state`:
- `"prelaunch"`: captação. CTA leva ao grupo de interesse, mostra contagem até `openingDate`, esconde pagamento.
- `"open"`: matrículas abertas. CTA "Garantir minha vaga", mostra vagas, prazo e botões de pagamento.
- `"closed"`: encerrado. CTA "Lista de espera".

A página vira `closed` sozinha se `spotsLeft` for 0 ou se `enrollmentDeadline` já passou (no estado `open`).

## Vagas e datas
- `spotsLeft`: atualize **à mão** a cada matrícula confirmada. Nada diminui sozinho.
- `openingDate`, `enrollmentDeadline`, `classStart`, `classEnd`: formato `AAAA-MM-DD`. A data limite (27/01/2027) ainda precisa da sua confirmação.
- `noClassDates`: feriados e recessos (terças e quintas sem aula). O mini calendário gera as 80 aulas a partir daí.

## Links reais
Troque cada `"[DEFINIR]"`:
- `whatsappNumber`: só números com DDI, ex. `"5533999999999"`. Ativa o botão flutuante e todos os "Falar com a Samira".
- `paymentLinkInstallments` / `paymentLinkUpfront`: links de pagamento. Enquanto vazios, os botões abrem uma mensagem pré-preenchida no WhatsApp.
- `waitlistLink`: lista de espera (se vazio, usa o WhatsApp e depois o grupo).
- `calendarPdfUrl` / `contractPdfUrl`: coloque o PDF em `assets/english-circle/` e informe o caminho. O botão e o link só aparecem quando preenchidos.
- `business`: razão social e CNPJ do MEI, para o rodapé.

## Analytics (GA4 e Meta Pixel)
Preencha `analytics.ga4Id` e `analytics.metaPixelId`. Só carregam depois do "Aceitar" no banner de cookies. Sem IDs, o banner nem aparece. Eventos: `view_item`, `click_whatsapp_group`, `click_whatsapp_direct`, `click_enroll`, `click_cta`, `faq_open`, `scroll_50`, `scroll_90`, `download_calendar` (documentados no topo da seção de analytics em `ec.js`). UTMs da URL são guardadas e anexadas às mensagens de WhatsApp.

Para ver os eventos sem IDs: abra a página em localhost ou com `?ecdebug=1` e olhe o console.

## Depoimentos, certificado e oferta opcional
- Depoimentos: só com relatos reais e autorizados. Preencha os cartões em `aulas-em-turma.html` (seção `#depoimentos`, há um modelo comentado) e ponha `showTestimonials: true`.
- Certificado: `certificate: true` ou `false` faz a pergunta aparecer no FAQ. Com `null`, ela fica oculta.
- Garantia, aula experimental ou turma pioneira: `optionalOffer.enabled: true` com título e texto.

## Modo de desenvolvimento
Em localhost (ou `?ecdebug=1`) aparece uma caixa amarela listando o que ainda está `[DEFINIR]`. Em produção ela nunca aparece.
