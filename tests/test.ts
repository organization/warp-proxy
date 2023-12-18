import WarpProxy from "../src";
import {SocksProxyAgent} from 'socks-proxy-agent';
import axios from "axios";

(async () => {
    let service = new WarpProxy("C:\\wgcf.exe", "C:\\wireproxy.exe");
    await service.init();

    let port = 8080;
    let proxy1 = service.createProxy(port);
    await proxy1.startService();

    let res = await axios.get("http://ip-api.com/json", {
        httpAgent: new SocksProxyAgent(`socks5://127.0.0.1:${port}`),
    });
    console.log(await res.data);

    proxy1.stopService();
})();
