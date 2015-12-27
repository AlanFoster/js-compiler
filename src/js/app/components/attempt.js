export default function(func) {
  try {
    return func();
  } catch (e) {
    return {
      message: e.message,
      token: e.token,
      stack: e.stack.split('\n')
    };
  }
}
