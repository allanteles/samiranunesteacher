<?php
/**
 * Arquivo de configuração de exemplo para a API de Nivelamento.
 * 
 * INSTRUÇÕES:
 * 1. Na Hostinger (ou ambiente de produção), crie um arquivo chamado 'config.php'
 *    UM NÍVEL ACIMA do diretório 'public_html' (ex: /home/uXXXXX/domains/samiranunes.com/config.php).
 * 2. Preencha os valores reais abaixo.
 * 3. NUNCA envie o 'config.php' com credenciais reais para o repositório git ou dentro do 'public_html'.
 */
return [
    // URL do Web App gerada no Google Apps Script (terminando em /exec)
    'apps_script_url'  => 'https://script.google.com/macros/s/XXXX/exec',

    // Segredo compartilhado com o Google Apps Script (definido em Propriedades do Script como SHARED_SECRET)
    'shared_secret'    => 'string-longa-e-aleatoria',

    // Opcional: Secret Key do Cloudflare Turnstile (deixe vazio '' para operar sem captcha, apenas com Honeypot e Rate Limit)
    'turnstile_secret' => '',

    // Origens HTTP permitidas para requisições à API
    'allowed_origins'  => [
        'https://samiranunes.com',
        'https://www.samiranunes.com',
    ],
];
