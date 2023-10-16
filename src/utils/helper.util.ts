export function ggID(): () => any {
  let id = 0;

  return function genId() {
    return id++;
  };
}

export function timeout(ms: number): Promise<any> {
  return new Promise((res) => setTimeout(res, ms));
}

export const noop: object = () => {};
