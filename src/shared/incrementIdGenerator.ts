export const incrementIdGenerator = <T>(formatter: (n: number) => T) => {
  let id = 0;
  return () => formatter(id++);
};
