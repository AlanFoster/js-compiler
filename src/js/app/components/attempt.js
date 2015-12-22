export default function(func) {
  try {
    return func();
  } catch (e) {
    return {
      message: e.message,
      stack: e.stack.split('\n')
    };
  }
}
