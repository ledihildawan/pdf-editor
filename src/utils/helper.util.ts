export function ggID() {
  let id = 0;

  return function genId() {
    return id++;
  };
}
