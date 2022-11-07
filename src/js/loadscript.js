const loadScriptAsync = (url) => {
    return new Promise((resolve) => {
        const tag = document.createElement("script");
        tag.onload = () => {
            resolve();
        };
        tag.onerror = () => {
            throw new Error(`failed to load ${url}`);
        };
        tag.async = true;
        tag.src = url;
        document.head.appendChild(tag);
    });
};

const loadAmmoModule = async (url) => {
    // there were some wasm checks here that I never tested out so I don't remember the og source here
    // console.log(wasmSupported ? 'WebAssembly is supported' : 'WebAssembly is not supported')
    // if (wasmSupported) loadScriptAsync(`${path}/ammo.wasm.js`, () => doneCallback())
    await loadScriptAsync(url);
};
export default loadAmmoModule;