#!/usr/bin/env bash
# Gera as URLs limpas /contratar-<cargo> pro GitHub Pages (que não suporta rewrites).
# Cada arquivo é uma cópia idêntica de contratar.html — o JS lê o cargo do path.
# RODAR ISTO sempre que editar contratar.html, pra as cópias não ficarem desatualizadas.
set -euo pipefail
cd "$(dirname "$0")/.."

CARGOS=(
  garcom cozinheiro auxiliar-de-cozinha bartender barman barista
  chapeiro hostess sommelier padeiro confeiteiro pizzaiolo
  pizzaiolo-napolitano sushiman churrasqueiro manobrista
)

for c in "${CARGOS[@]}"; do
  cp contratar.html "contratar-$c.html"
done
echo "Geradas ${#CARGOS[@]} páginas: contratar-<cargo>.html (cópias de contratar.html)"
