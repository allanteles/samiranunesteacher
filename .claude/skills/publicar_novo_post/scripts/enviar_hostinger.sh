#!/bin/bash
# Envia arquivos do repositório para o site na Hostinger por FTP.
# A senha é lida de ~/.netrc (nunca passe a senha como argumento).
# Uso: enviar_hostinger.sh arquivo1 [arquivo2 ...]   (caminhos relativos à raiz do repositório)
set -u
HOST="147.79.84.183"
BASE="ftp://$HOST/domains/samiranunes.com/public_html"
SITE="https://samiranunes.com"

cd "$(git rev-parse --show-toplevel)" || exit 1

if ! grep -q "$HOST" ~/.netrc 2>/dev/null; then
  echo "ERRO: ~/.netrc não tem as credenciais de $HOST. Peça para a usuária configurar." >&2
  exit 1
fi
[ $# -eq 0 ] && { echo "Uso: $0 arquivo1 [arquivo2 ...]" >&2; exit 1; }

falhas=0
for f in "$@"; do
  if [ ! -f "$f" ]; then echo "NÃO EXISTE: $f"; falhas=$((falhas+1)); continue; fi
  if curl -s --netrc --max-time 120 --ftp-create-dirs -T "$f" "$BASE/$f"; then
    echo "enviado: $f"
  else
    echo "FALHOU:  $f"; falhas=$((falhas+1))
  fi
done

echo
echo "Conferindo no site:"
for f in "$@"; do
  case "$f" in *.html|*.xml|*.txt)
    code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE/$f")
    echo "$code $SITE/$f";;
  esac
done

exit $falhas
