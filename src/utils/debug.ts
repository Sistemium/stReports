import debug from 'debug';

const namespace = 'stm:reports';

export function createDebug(name: string) {
  return debug(`${namespace}:${name}`);
}
