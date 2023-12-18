# Warp-Proxy
Make socks5 proxy server using Wgcf and Wireguard.

## Usage
```ts
let service = new WarpProxy("wgcf_executable_path", "wireproxy_executable_path");
await service.init();

let port = 8080;
let proxy1 = service.createProxy(port);
await proxy1.startService();

// listen socks5 proxy server on 'socks5://127.0.0.1:8080'

proxy1.stopService();
```
