import { useState } from 'react';
import axios from 'axios';

import { useAuth } from './auth';

const rpc = initRPC('/api/');

type RPCService = {
    [key: string]: (...args: any[]) => Promise<any>;
};

type DescribeSpec = {
    name: string;
    params: any[]
};

function initRPC(uri: string) {
    var id = 1;
    function request(method: string, params: any[]) {
        var req = axios.post(uri, {id: id++, method: method, params: params || []});
        return req.then(res => res.data);
    }
    return request('system.describe', []).then(data => {
        if (data.error) {
            throw data.error.message;
        }
        var service: RPCService = {};
        data.procs.forEach((spec:DescribeSpec) => {
            service[spec.name] = function(...args: any[]) {
                if (args.length === spec.params.length) {
                    return request(spec.name, args).then(data => {
                        if (data.error) {
                            throw new Error(data.error.message);
                        } else {
                            return data.result;
                        }
                    });
                } else {
                    const msg = 'Invalid arity expected ' + spec.params.length +
                        ' got ' + args.length;
                    throw new Error(msg);
                }
            };
        });
        return service;
    });
}

function useRPC<T>(method: string, init: T | null = null) {
    const [ isLoading, setLoad ] = useState(false);
    const [ result, setResult ] = useState<T | null>(init);
    const [ error, setError ] = useState(null);

    function call(...args: any[]) {
        setLoad(true);

        return rpc.then(rpc => {
            return rpc[method].apply(null, args).then((result: any) => {
                setResult(result);
                setLoad(false);
            });
        }).catch(error => {
            setError(error);
            setLoad(false);
        });
    }

    return { isLoading, error, result, call };
}

function useSecureRPC<T>(method: string, init: T | null = null) {
    const { auth } = useAuth();
    const [ authError, setAuthError ] = useState<string | null>(null);
    const {
        error,
        call: rpc,
        result,
        isLoading
    } = useRPC<T>(method, init);
    const call = (...args: any[]) => {
        if (!auth) {
            setAuthError('Missing token');
        } else {
            return rpc(auth.token, ...args);
        }
    };
    return { call, error, result, isLoading, authError };
}

export { useRPC, useSecureRPC };
