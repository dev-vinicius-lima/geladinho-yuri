declare global {
  interface BigInt {
    toJSON(): string;
  }
}

export const setConfigMain = () => {
  BigInt.prototype.toJSON = function () {
    // eslint-disable-next-line
    return this.toString();
  };
};
