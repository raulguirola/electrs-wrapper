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
b_gbc_result=$(curl -sS --user $b_username:$b_password --data-binary '{"jsonrpc": "1.0", "id": "sync-hck", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://$b_host:8332/ 2>&1)
error_code=$?
b_gbc_error=$(echo $b_gbc_result | yq e '.error' -)
if [[ $error_code -ne 0 ]]; then
    echo "Error contacting Bitcoin RPC: $b_gbc_result" >&2
    exit $error_code
elif [ "$b_gbc_error" != "null" ] ; then
    #curl gave a good json "result" but it could be an error like:
    # '{"result":null,"error":{"code":-28,"message":"Verifying blocks…"},"id":"sync-hck"}'
    # meaning bitcoin is not yet synced.  Display that "message" and exit:
    echo "Bitcoin RPC returned error: $b_gbc_error" >&2
    exit 60
fi

b_block_count=$(echo "$b_gbc_result" | yq e '.result.blocks' -)
b_block_ibd=$(echo "$b_gbc_result" | yq e '.result.initialblockdownload' -)
if [ "$b_block_count" = "null" ]; then
    echo "Error ascertaining Bitcoin blockchain status: $b_gbc_error" >&2
    exit 60
elif [ "$b_block_ibd" != "false" ] ; then
    b_block_hcount=$(echo "$b_gbc_result" | yq e '.result.headers' -)
    echo -n "Bitcoin blockchain is not fully synced yet: $b_block_count of $b_block_hcount blocks" >&2
    echo " ($(expr ${b_block_count}00 / $b_block_hcount)%)" >&2
    exit 60
else
    #Gather keys/values from prometheus rpc:
    curl_res=$(curl -sS localhost:4224)
    error_code=$?
    
    if [[ $error_code -ne 0 ]]; then
        echo "Error contacting the electrs Prometheus RPC" >&2
        exit $error_code
    fi
    
    #compaction_res=$(echo -e "$features_res" | grep num-running-compactions | sed "s/\s$//g" | grep " [^0]$"|awk '{print $NF}'|head -1)
    #^The prometheus RPC's num-running-compactions key doesn't seem to correspond to actual compaction events, so we'll determine compaction by another, dumber but accurate method:
    compaction_res=$(tail -2 /data/db/bitcoin/LOG|head -1|grep "compaction_job\.cc"|wc -l)
    if [[ $compaction_res -eq 1 ]] ; then
        echo "Finishing database compaction... This could take a some hours depending on your hardware." >&2
        exit 61
    fi
    
    synced_height=$(echo -e "$curl_res" | grep index_height | grep tip | awk '{ print $NF }')
    if [ -n "$synced_height" ] && [[ $synced_height -ge 0 ]] ; then
        if [[ $synced_height -lt $b_block_count ]] ; then
            echo "Catching up to blocks from bitcoind. This should take at most a day. Progress: $synced_height of $b_block_count blocks ($(expr ${synced_height}00 / $b_block_count)%)" >&2
            exit 61
        else
            #Index is synced to tip
            exit 0
        fi
    elif [ -z "$synced_height" ] ; then
        echo "The electrs Prometheus RPC is not yet returning the sync status" >&2
        exit 61
    fi
fi
