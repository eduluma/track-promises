#!/usr/bin/env bash

set -euo pipefail

namespace="${TRACK_PROMISES_K8S_NAMESPACE:-track-promises-prod}"
local_port="${TRACK_PROMISES_K8S_DB_LOCAL_PORT:-55432}"
service_name="${TRACK_PROMISES_K8S_DB_SERVICE:-track-promises-postgres}"
log_file="${TRACK_PROMISES_K8S_DB_PORT_FORWARD_LOG:-/tmp/track-promises-k8s-db-port-forward.log}"
port_forward_pid=""

cleanup() {
  if [[ -n "$port_forward_pid" ]]; then
    kill "$port_forward_pid" >/dev/null 2>&1 || true
    wait "$port_forward_pid" 2>/dev/null || true
  fi
}

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <command> [args...]" >&2
  exit 1
fi

if ! nc -z 127.0.0.1 "$local_port" >/dev/null 2>&1; then
  kubectl port-forward -n "$namespace" "svc/$service_name" "$local_port:5432" >"$log_file" 2>&1 &
  port_forward_pid=$!
  trap cleanup EXIT INT TERM

  until nc -z 127.0.0.1 "$local_port" >/dev/null 2>&1; do
    if ! kill -0 "$port_forward_pid" >/dev/null 2>&1; then
      echo "kubectl port-forward to $service_name exited unexpectedly:" >&2
      tail -n 20 "$log_file" >&2 || true
      exit 1
    fi
  done
fi

"$@"