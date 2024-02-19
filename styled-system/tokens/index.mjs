const tokens = {
  "sizes.full": {
    "value": "100%",
    "variable": "var(--sizes-full)"
  }
}

export function token(path, fallback) {
  return tokens[path]?.value || fallback
}

function tokenVar(path, fallback) {
  return tokens[path]?.variable || fallback
}

token.var = tokenVar