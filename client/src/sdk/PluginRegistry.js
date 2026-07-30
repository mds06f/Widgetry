// Dynamic Widget Plugin SDK Loader & Registry Engine

const pluginStore = new Map();

export function registerPlugin(manifest, ViewComponent, ConfigComponent) {
  if (!manifest || !manifest.type) {
    throw new Error('Plugin manifest must define a unique "type" property');
  }

  pluginStore.set(manifest.type, {
    manifest,
    ViewComponent,
    ConfigComponent,
    registeredAt: new Date().toISOString(),
  });

  return true;
}

export function getPlugin(type) {
  return pluginStore.get(type) || null;
}

export function getAllPlugins() {
  return Array.from(pluginStore.values());
}
