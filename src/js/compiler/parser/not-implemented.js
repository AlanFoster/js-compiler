const notImplemented = () => {
  throw new Error('Not Implemented')
};
const isNotImplemented = (func) => !isImplemented(func);
const isImplemented = (func) => func !== notImplemented;

export {
  notImplemented,
  isNotImplemented,
  isImplemented
};
