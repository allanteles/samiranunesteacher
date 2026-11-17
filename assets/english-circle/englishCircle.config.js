/*
 * English Circle: configuração da página aulas-em-turma.html
 * ------------------------------------------------------------
 * Este é o ÚNICO arquivo que você precisa editar no dia a dia.
 * Tudo que estiver como "[DEFINIR]" é tratado como vazio: a página
 * continua funcionando e os botões caem numa mensagem de WhatsApp.
 * Veja o passo a passo em assets/english-circle/README.md
 */
window.EC_CONFIG = {
  // Estado da página: "prelaunch" (captação), "open" (matrículas abertas) ou "closed" (encerradas)
  // Se spotsLeft chegar a 0, a página vira "closed" sozinha.
  state: "prelaunch",

  // Vagas: atualize spotsLeft À MÃO a cada matrícula confirmada. Nunca é alterado automaticamente.
  spotsTotal: 8,
  spotsLeft: 8,

  // Datas (formato AAAA-MM-DD, horário de Brasília)
  openingDate: "2027-01-12",          // abertura das matrículas
  enrollmentDeadline: "2027-01-27",   // [DEFINIR] confirmar a data limite
  classStart: "2027-02-02",
  classEnd: "2027-12-14",
  totalClasses: 80,

  // Terças e quintas SEM aula (feriados e recessos). O calendário e a contagem de aulas usam esta lista.
  noClassDates: [
    { date: "2027-02-09", reason: "Recesso de Carnaval" },
    { date: "2027-02-11", reason: "Recesso de Carnaval" },
    { date: "2027-05-27", reason: "Corpus Christi" },
    { date: "2027-07-20", reason: "Recesso de julho" },
    { date: "2027-07-22", reason: "Recesso de julho" },
    { date: "2027-07-27", reason: "Recesso de julho" },
    { date: "2027-07-29", reason: "Recesso de julho" },
    { date: "2027-09-07", reason: "Independência do Brasil" },
    { date: "2027-10-12", reason: "Semana das Crianças" },
    { date: "2027-10-14", reason: "Semana das Crianças" },
    { date: "2027-11-02", reason: "Finados" }
  ],

  // Links
  whatsappGroupLink: "https://chat.whatsapp.com/JF6XZ03iSFvHiu3374mOgd", // grupo de interesse (o mesmo da home)
  waitlistLink: "[DEFINIR]",              // lista de espera (se vazio, usa o WhatsApp direto e depois o grupo)
  whatsappNumber: "[DEFINIR]",            // contato direto da Samira, só números com DDI 55. Ex.: "5533999999999"
  paymentLinkInstallments: "[DEFINIR]",   // link das 12x
  paymentLinkUpfront: "[DEFINIR]",        // link do pagamento à vista
  calendarPdfUrl: "[DEFINIR]",            // PDF do calendário letivo. Ex.: "assets/english-circle/calendario-2027.pdf"
  contractPdfUrl: "[DEFINIR]",            // modelo do contrato para leitura
  instagramUrl: "https://www.instagram.com/samiranunes_teacher/",
  contactEmail: "contato@samiranunes.com",

  // Preços
  priceInstallment: 300,
  installments: 12,
  priceUpfront: 3000,

  // Dados do MEI para o rodapé
  business: {
    name: "[DEFINIR]",   // razão social
    cnpj: "[DEFINIR]",
    city: "Governador Valadares, MG"
  },

  // Blocos opcionais (ligue com true SOMENTE se for verdade)
  showTestimonials: false,   // os depoimentos ficam em aulas-em-turma.html, seção #depoimentos
  optionalOffer: {
    enabled: false,          // garantia, aula experimental ou condição de turma pioneira
    title: "",
    text: ""
  },
  certificate: null,         // true = tem certificado, false = não tem, null = ainda não decidido (a pergunta fica oculta)

  // Analytics: só carregam depois que a pessoa aceita os cookies
  analytics: {
    ga4Id: "[DEFINIR]",        // ex.: "G-XXXXXXXXXX"
    metaPixelId: "[DEFINIR]"   // ex.: "123456789012345"
  },

  // Mensagens pré-preenchidas do WhatsApp (uma por botão, para saber de onde veio a conversa)
  messages: {
    hero: "Oi, Samira! Vi a página do English Circle e quero saber mais.",
    float: "Oi, Samira! Estou na página do English Circle e tenho uma dúvida.",
    final: "Oi, Samira! Prefiro conversar antes de me matricular no English Circle.",
    faq: "Oi, Samira! Li as perguntas frequentes do English Circle e ainda tenho uma dúvida.",
    group: "Oi, Samira! Quero entrar no grupo de interesse do English Circle e ser avisada(o) quando abrir.",
    enrollInstallments: "Oi, Samira! Quero garantir minha vaga no English Circle no plano 12x de R$ 300.",
    enrollUpfront: "Oi, Samira! Quero garantir minha vaga no English Circle no pagamento à vista de R$ 3.000.",
    waitlist: "Oi, Samira! Quero entrar na lista de espera do English Circle."
  }
};
