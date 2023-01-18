export const waitForTime = (time: number): Promise<unknown> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
};
