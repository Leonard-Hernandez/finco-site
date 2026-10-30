#!/bin/sh
# Writes the runtime configuration of the SPA (window.__env) from environment variables.
# Runs from /docker-entrypoint.d/ of the official nginx image before nginx starts.
set -eu

ENV_JS=/usr/share/nginx/html/env.js

# JSON string literal: escapes backslashes and quotes, drops control characters.
json_string() {
  printf '"%s"' "$(printf '%s' "$1" | tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')"
}

entries=""
for name in FINCO_API_URL AUTHCO_URL OAUTH_CLIENT_ID FINCO_RESOURCE; do
  eval "value=\${$name:-}"
  if [ -n "$value" ]; then
    entries="${entries:+$entries, }\"$name\": $(json_string "$value")"
  fi
done

printf 'window.__env = {%s};\n' "$entries" > "$ENV_JS"
echo "$0: wrote $ENV_JS"
