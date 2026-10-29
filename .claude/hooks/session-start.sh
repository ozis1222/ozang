#!/bin/bash
# Video üretim araçlarını kurar: Hyperframes + claude-video (/watch)
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

tools_dir="$(cd "${CLAUDE_PROJECT_DIR:-.}/.." && pwd)"
hook="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

# Hyperframes
cd "$tools_dir"
[ -d hyperframes ] || git clone -q https://github.com/heygen-com/hyperframes.git
cd hyperframes
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  bun install
  bun run build
  sha256sum "$hook" package.json bun.lock packages/*/package.json > "$hashes" || rm -f "$hashes"
fi

# claude-video (/watch) ve bağımlılıkları
cd "$tools_dir"
[ -d claude-video ] || git clone -q https://github.com/bradautomates/claude-video.git
if [ ! -x /opt/yt-dlp/bin/yt-dlp ]; then
  python3 -m venv /opt/yt-dlp
  /opt/yt-dlp/bin/pip install -q "yt-dlp[default,curl-cffi]"
fi
ln -sf /opt/yt-dlp/bin/yt-dlp /usr/local/bin/yt-dlp
command -v deno >/dev/null || npm install -g deno
python3 claude-video/skills/watch/scripts/setup.py --check
