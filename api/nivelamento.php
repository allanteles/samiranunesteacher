<?php
/**
 * API Segura para Processamento do Teste de Nivelamento
 * Teacher Samira Nunes
 * 
 * Requisitos: PHP 8.1+ com cURL e mbstring habilitados.
 */

declare(strict_types=1);

// 1. Cabeçalhos fundamentais e método HTTP
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Localização e carregamento de configurações fora do public_html
$configCandidates = [
    dirname(__DIR__, 2) . '/config.php', // Hostinger / Produção (acima de public_html)
    dirname(__DIR__) . '/config.php',    // Ambiente local de testes / desenvolvimento
];

$configFile = null;
foreach ($configCandidates as $candidate) {
    if (file_exists($candidate)) {
        $configFile = $candidate;
        break;
    }
}

if ($configFile === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Erro interno de configuração do servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configFile;
if (!is_array($config)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Arquivo de configuração inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Diretórios base para logs, rate limit e armazenamento de pendências (fora de public_html)
$baseDir = dirname($configFile);
$logFile = $baseDir . '/nivelamento.log';
$ratelimitDir = $baseDir . '/ratelimit';
$storageDir = $baseDir . '/storage';

// Configuração segura de logs: nunca expor erros ao navegador
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', $logFile);
error_reporting(E_ALL);

// 3. Validação de Origem (CORS / Origin Header)
if (isset($_SERVER['HTTP_ORIGIN']) && !empty($config['allowed_origins'])) {
    $origin = rtrim(trim($_SERVER['HTTP_ORIGIN']), '/');
    $allowed = array_map(fn($o) => rtrim(trim((string)$o), '/'), (array)$config['allowed_origins']);
    
    if (!in_array($origin, $allowed, true)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'erro' => 'Origem não permitida.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 4. Honeypot contra robôs de spam
if (isset($_POST['website']) && is_string($_POST['website']) && trim($_POST['website']) !== '') {
    // Robô detectado: responde com sucesso silencioso sem processar nada
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// 5. Rate limit por IP (máximo 5 envios por hora por IP)
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!filter_var($clientIp, FILTER_VALIDATE_IP)) {
    $clientIp = '127.0.0.1';
}
$ipHash = hash('sha256', $clientIp);

if (!is_dir($ratelimitDir)) {
    @mkdir($ratelimitDir, 0700, true);
    @chmod($ratelimitDir, 0700);
}

$rateFile = $ratelimitDir . '/' . $ipHash . '.json';
$now = time();
$windowSeconds = 3600; // 1 hora
$maxAttempts = 5;

$attempts = [];
if (file_exists($rateFile)) {
    $rawAttempts = @file_get_contents($rateFile);
    if ($rawAttempts !== false) {
        $parsed = json_decode($rawAttempts, true);
        if (is_array($parsed)) {
            $attempts = array_filter($parsed, fn($t) => is_int($t) && ($now - $t) < $windowSeconds);
        }
    }
}

if (count($attempts) >= $maxAttempts) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'erro' => 'Limite de tentativas excedido. Tente novamente mais tarde.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Registra a tentativa
$attempts[] = $now;
@file_put_contents($rateFile, json_encode(array_values($attempts)), LOCK_EX);
@chmod($rateFile, 0600);

// 6. Função de sanitização contra injeção de fórmulas e caracteres de controle
function sanitizeText(string $str, int $maxLength): string {
    $str = trim($str);
    // Remove caracteres de controle (mantém apenas texto visível e quebras comuns)
    $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $str);
    if (mb_strlen($str) > $maxLength) {
        $str = mb_substr($str, 0, $maxLength);
    }
    // Neutraliza fórmula em planilhas (inicia com =, +, -, @, tab ou CR)
    if ($str !== '' && in_array($str[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
        $str = "'" . $str;
    }
    return $str;
}

// 7. Validação rigorosa dos campos de entrada
// Nome
if (!isset($_POST['nome']) || !is_string($_POST['nome'])) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Por favor, informe seu nome completo.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$nome = trim($_POST['nome']);
if ($nome === '' || mb_strlen($nome) < 2 || mb_strlen($nome) > 100) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Por favor, informe um nome válido (até 100 caracteres).'], JSON_UNESCAPED_UNICODE);
    exit;
}

// E-mail
if (!isset($_POST['email']) || !is_string($_POST['email'])) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Informe um e-mail válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$email = trim($_POST['email']);
if ($email === '' || mb_strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Informe um e-mail válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// WhatsApp (DDD + número: 10 ou 11 dígitos, tolerando prefixo 55)
if (!isset($_POST['whatsapp']) || !is_string($_POST['whatsapp'])) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Informe um WhatsApp válido com DDD.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$whatsRaw = preg_replace('/\D/', '', $_POST['whatsapp']);
if (strlen($whatsRaw) === 12 || strlen($whatsRaw) === 13) {
    if (str_starts_with($whatsRaw, '55')) {
        $whatsRaw = substr($whatsRaw, 2);
    }
}
if (strlen($whatsRaw) !== 10 && strlen($whatsRaw) !== 11) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'WhatsApp inválido. Informe o DDD e o número completo.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$whatsappNormalizado = '55' . $whatsRaw;

// Interesse (whitelist das 3 opções reais do <select>)
$interessesValidos = [
    'Aulas particulares (VIP)',
    'English Circle (turma em grupo)',
    'Ainda não sei, quero orientação',
];
if (!isset($_POST['interesse']) || !is_string($_POST['interesse']) || !in_array(trim($_POST['interesse']), $interessesValidos, true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Selecione uma opção de interesse válida.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$interesse = trim($_POST['interesse']);

// Objetivo (opcional, até 500 caracteres)
$objetivo = '';
if (isset($_POST['objetivo']) && is_string($_POST['objetivo'])) {
    $objetivo = trim($_POST['objetivo']);
    if (mb_strlen($objetivo) > 500) {
        $objetivo = mb_substr($objetivo, 0, 500);
    }
}

// Consentimento (obrigatório, igual a 'sim')
if (!isset($_POST['consentimento']) || !is_string($_POST['consentimento']) || trim($_POST['consentimento']) !== 'sim') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'É necessário autorizar o contato para continuar.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 8. Validação das Respostas do Questionário (q1 a q25)
$respostasUsuario = [];
$mapAlternativas = [
    '0' => 0, '1' => 1, '2' => 2, '3' => 3, '-1' => -1,
    'A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'NS' => -1,
];

for ($i = 1; $i <= 25; $i++) {
    $key = 'q' . $i;
    if (!isset($_POST[$key])) {
        $respostasUsuario[$i] = null; // Não respondida
        continue;
    }
    if (!is_string($_POST[$key])) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'erro' => "Resposta inválida para a questão $i."], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $val = trim($_POST[$key]);
    if ($val === '') {
        $respostasUsuario[$i] = null;
    } elseif (array_key_exists($val, $mapAlternativas)) {
        $respostasUsuario[$i] = $mapAlternativas[$val];
    } else {
        http_response_code(422);
        echo json_encode(['ok' => false, 'erro' => "Opção inválida na questão $i."], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 9. Verificação Cloudflare Turnstile (opcional: executada somente se turnstile_secret estiver configurado)
$turnstileSecret = trim((string)($config['turnstile_secret'] ?? ''));

if ($turnstileSecret !== '') {
    $turnstileResponse = $_POST['cf-turnstile-response'] ?? '';

    if (!is_string($turnstileResponse) || trim($turnstileResponse) === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'erro' => 'Verificação de segurança obrigatória.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $cfPayload = [
        'secret'   => $turnstileSecret,
        'response' => trim($turnstileResponse),
        'remoteip' => $clientIp,
    ];

    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($cfPayload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $cfResult = curl_exec($ch);
    $cfErrno = curl_errno($ch);
    $cfError = curl_error($ch);
    if (PHP_VERSION_ID < 80000) { curl_close($ch); } else { unset($ch); }

    if ($cfResult === false || $cfErrno !== 0) {
        error_log("Erro de conexão com Cloudflare Turnstile: $cfError (errno $cfErrno)");
        http_response_code(422);
        echo json_encode(['ok' => false, 'erro' => 'Erro ao validar o captcha. Tente novamente.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $cfJson = json_decode((string)$cfResult, true);
    if (!is_array($cfJson) || empty($cfJson['success'])) {
        error_log("Validação Turnstile recusada: " . json_encode($cfJson, JSON_UNESCAPED_UNICODE));
        http_response_code(422);
        echo json_encode(['ok' => false, 'erro' => 'Falha na verificação de segurança. Tente novamente.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 10. Gabarito Oficial e Correção do Teste
$gabarito = [
    1  => 0, // My
    2  => 2, // are
    3  => 1, // Do
    4  => 3, // are
    5  => 1, // goes
    6  => 2, // went
    7  => 0, // the best
    8  => 1, // were having
    9  => 2, // much
    10 => 3, // must
    11 => 3, // have lived
    12 => 0, // will stay
    13 => 1, // has been read
    14 => 2, // I lived
    15 => 3, // waking
    16 => 0, // had
    17 => 2, // had already started
    18 => 1, // hadn’t said
    19 => 2, // taking
    20 => 3, // off
    21 => 1, // had I left
    22 => 2, // made
    23 => 0, // although
    24 => 3, // which
    25 => 1, // would have left
];

$letrasOpcoes = [0 => 'A', 1 => 'B', 2 => 'C', 3 => 'D'];
$pontos = 0;
$respostasFormatadas = [];

for ($i = 1; $i <= 25; $i++) {
    $userVal = $respostasUsuario[$i];
    $corretoVal = $gabarito[$i];
    $letraCorreta = $letrasOpcoes[$corretoVal];

    if ($userVal === $corretoVal) {
        $pontos++;
        $letraUser = $letrasOpcoes[$userVal];
        $respostasFormatadas[] = sprintf('Q%02d:%s(✓)', $i, $letraUser);
    } elseif ($userVal === -1) {
        $respostasFormatadas[] = sprintf('Q%02d:NS[G:%s]', $i, $letraCorreta);
    } elseif ($userVal === null) {
        $respostasFormatadas[] = sprintf('Q%02d:-[G:%s]', $i, $letraCorreta);
    } else {
        $letraUser = $letrasOpcoes[$userVal] ?? '?';
        $respostasFormatadas[] = sprintf('Q%02d:%s(✗)[G:%s]', $i, $letraUser, $letraCorreta);
    }
}

$respostasString = implode(' ', $respostasFormatadas);

// Cálculo do Nível CEFR de acordo com pontos de corte originais
if ($pontos <= 6) {
    $nivel = 'A1';
} elseif ($pontos <= 11) {
    $nivel = 'A2';
} elseif ($pontos <= 16) {
    $nivel = 'B1';
} elseif ($pontos <= 21) {
    $nivel = 'B2';
} else {
    $nivel = 'C1';
}

// 11. Sanitização para envio seguro à Planilha (neutralização de fórmulas)
$safeNome = sanitizeText($nome, 100);
$safeWhats = sanitizeText($whatsappNormalizado, 20);
$safeEmail = sanitizeText($email, 120);
$safeInteresse = sanitizeText($interesse, 100);
$safeObjetivo = sanitizeText($objetivo, 500);
$safeRespostas = sanitizeText($respostasString, 3000);

// 12. Envio ao Google Apps Script via cURL com token secreto
$payloadAppsScript = [
    'token'     => $config['shared_secret'] ?? '',
    'nome'      => $safeNome,
    'whatsapp'  => $safeWhats,
    'email'     => $safeEmail,
    'interesse' => $safeInteresse,
    'objetivo'  => $safeObjetivo,
    'pontos'    => (string)$pontos,
    'nivel'     => $nivel,
    'respostas' => $safeRespostas,
];

$registrado = false;
$appsScriptUrl = $config['apps_script_url'] ?? '';

if (!empty($appsScriptUrl) && filter_var($appsScriptUrl, FILTER_VALIDATE_URL)) {
    $ch = curl_init($appsScriptUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($payloadAppsScript),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/x-www-form-urlencoded',
        ],
    ]);
    
    $asResponse = curl_exec($ch);
    $asHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $asErrno = curl_errno($ch);
    $asError = curl_error($ch);
    if (PHP_VERSION_ID < 80000) { curl_close($ch); } else { unset($ch); }

    if ($asResponse !== false && $asHttpCode >= 200 && $asHttpCode < 400) {
        $asJson = json_decode((string)$asResponse, true);
        if (is_array($asJson) && !empty($asJson['ok'])) {
            $registrado = true;
        } else {
            error_log("Apps Script rejeitou a gravação: " . ($asResponse ?: 'vazio'));
        }
    } else {
        error_log("Falha ao contatar Google Apps Script (HTTP $asHttpCode, cURL $asErrno: $asError)");
    }
} else {
    error_log("Configuração apps_script_url ausente ou inválida.");
}

// 13. Fallback de resiliência: se o Apps Script falhar, salva localmente em storage/pendentes.jsonl
if (!$registrado) {
    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0700, true);
        @chmod($storageDir, 0700);
    }
    
    $pendenteFile = $storageDir . '/pendentes.jsonl';
    $dadosPendentes = array_merge($payloadAppsScript, [
        'data_registro' => date('c'),
        'ip_hash'       => $ipHash,
    ]);
    unset($dadosPendentes['token']); // Nunca armazena o token nos logs de pendentes

    @file_put_contents($pendenteFile, json_encode($dadosPendentes, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    @chmod($pendenteFile, 0600);
    error_log("Lead de '{$safeNome}' gravado em pendentes.jsonl para sincronização futura.");
}

// 14. Resposta JSON ao usuário
// O usuário sempre recebe seu resultado com sucesso, mesmo se houver fallback na gravação
echo json_encode([
    'ok'         => true,
    'nivel'      => $nivel,
    'pontos'     => $pontos,
    'registrado' => $registrado,
], JSON_UNESCAPED_UNICODE);
exit;
