#!/bin/bash

echo '{"jsonrpc": "2.0", "method": "server.version", "params": ["", "1.4"], "id": 0}' | netcat -q 1 127.0.0.1 50001 &>/dev/null
RES=$?
if test "$RES" != 0; then
    echo "Electrum interface is unreachable" >&2
    exit 1
fi
