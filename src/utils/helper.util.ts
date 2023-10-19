export function ggID(): () => any {
  let id = 0;

  return function genId() {
    return id++;
  };
}

export function timeout(ms: number): Promise<any> {
  return new Promise((res) => setTimeout(res, ms));
}

export function noop(): Object {
  return {};
}

export function scaleImage(width: number, height: number, limit = 500) {
  let scale = 1;

  if (width > limit) {
    scale = limit / width;
  }

  if (height > limit) {
    scale = Math.min(scale, limit / height);
  }

  return {
    width: width * scale,
    height: height * scale,
  };
}
