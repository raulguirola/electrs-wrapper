#!/bin/bash

set -e

b_type=$(yq e '.bitcoind.type' /data/start9/config.yaml)
if [ "$b_type" = "internal" ]; then
    b_host="bitcoind.embassy"
    b_username=$(yq e '.bitcoind.user' /data/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /data/start9/config.yaml)
elif [ "$b_type" = "internal-proxy" ]; then
    b_host="btc-rpc-proxy.embassy"
    b_username=$(yq e '.bitcoind.user' /data/start9/config.yaml)
    b_password=$(yq e '.bitcoind.password' /data/start9/config.yaml)
else
    b_host=$(yq e '.bitcoind.connection-settings.address' /data/start9/config.yaml)
    b_username=$(yq e '.bitcoind.connection-settings.user' /data/start9/config.yaml)
    b_password=$(yq e '.bitcoind.connection-settings.password' /data/start9/config.yaml)
fi
b_gbc_result=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockcount", "params": []}' -H 'content-type: text/plain;' http://$b_host:8332/)
error_code=$?
if [[] $error_code -ne 0 ]]; then
    echo $b_gbc_result >&2
    exit $error_code
fi

b_block_count=$(echo "$b_gbc_result" | yq e '.result' -)
b_gbc_err=$(echo "$b_gbc_result" | yq e '.error' -)
if [ "$b_block_count" = "null" ]; then
    # Starting
    exit 60
else
    #This doesn't ever seem to correspond to actual compaction events.  We'll determine compaction another way.
    #features_res=$(echo '{"jsonrpc": "2.0", "method": "server.features", "params": ["", "1.4"], "id": 0}' | netcat -q 1 127.0.0.1 50001)
    #compaction_res=$(echo -e "$features_res" | grep num-running-compactions | sed "s/\s$//g" | grep " [^0]$"|awk '{print $NF}'|head -1)
    curl_res=$(curl -sS localhost:4224)
    error_code=$?
    
    if [[ $error_code -ne 0 ]]; then
        echo "Error contacting the Electrs Prometheus RPC" >&2
        exit $error_code
    fi

    synced_height=$(echo -e "$curl_res" | grep index_height | grep tip | awk '{ print $NF }')
    if [ -n "$synced_height" ] && [[ $synced_height -ge 0 ]] ; then
        if [[ $synced_height -lt $b_block_count ]]; then
            echo "Catching up to blocks from bitcoind. This should take at most a day. Progress: $synced_height of $b_block_count blocks" >&2
            exit 61
        else
            echo "Electrs RPC is not yet returning the sync status" >&2
            exit 61
        fi
    elif [ -z "$curl_res" ]; then
        compaction_res=$(tail -2 /data/db/bitcoin/LOG|head -1|grep "compaction_job\.cc"|wc -l)
        if [[ $compaction_res -eq 1 ]] ; then
            echo "Finishing database compaction... This could take a some hours depending on your hardware." >&2
            exit 61
        fi
        echo "Synced to blockchain. Finalizing..." >&2
        exit 61
    else
        exit 0
    fi
fi
