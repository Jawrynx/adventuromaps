import { defineConfig, mergeConfig } from 'vite';

export const getBuildConfig = (env) => {
  const { forgeConfigSelf } = env;
  const define = {};
  for (const key in env) {
    if (key === 'FORGE_CONFIG' || key === 'forgeConfigSelf') continue;
    define[`process.env.${key}`] = JSON.stringify(env[key]);
  }
  
  return defineConfig({
    build: {
      rollupOptions: {
        external: [
          ...(forgeConfigSelf?.externalPackages || []),
        ],
      },
    },
    define,
  });
};

export const getBuildDefine = (env) => {
  const define = {};
  for (const key in env) {
    if (key === 'FORGE_CONFIG' || key === 'forgeConfigSelf') continue;
    define[`process.env.${key}`] = JSON.stringify(env[key]);
  }
  return define;
};

export const pluginExposeRenderer = (name) => {
  return {
    name: `expose-renderer-${name}`,
    configureServer(server) {
      process.viteDevServers ??= {};
      process.viteDevServers[name] = server;
    },
  };
};