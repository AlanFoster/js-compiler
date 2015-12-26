import { notImplemented, isNotImplemented } from './not-implemented';

class Symbol {
  constructor(type) {
    this.type = type;
    this.nud = notImplemented;
    this.rbp = 0;
    this.lbp = 0;
    this.led = notImplemented;
    this.std = notImplemented;
  }

  withNud(nud) {
    this.nud = nud;
    return this;
  }

  withLbp(lbp) {
    this.lbp = lbp;
    return this;
  }

  withRbp(rbp) {
    this.rbp = rbp;
    return this;
  }

  withLed(led) {
    this.led = led;
    return this;
  }

  withStd(std) {
    this.std = std;
    return this;
  }

  mergeWith(other) {
    if (!other) return Object.create(this);

    const combinedSymbol = Object.create(other);

    if (isNotImplemented(other.nud)) {
      combinedSymbol.nud = this.nud;
    }

    if (isNotImplemented(other.led)) {
      combinedSymbol.led = this.led;
    }

    if (isNotImplemented(other.std)) {
      combinedSymbol.std = this.std;
    }

    return combinedSymbol;
  }
}

export default Symbol;
