const isWhitespace = function (char) {
  return (
    char === ' ' ||
    char === '\t' ||
    char === '\r' ||
    char === '\n'
  );
};

const isLetter = function (char) {
  return (
    char >= 'a' && char <= 'z' ||
    char >= 'A' && char <= 'Z'
  );
};

const isDigit = function (char) {
  return char >= '0' && char <= '9';
};

export {
  isWhitespace,
  isLetter,
  isDigit
};
