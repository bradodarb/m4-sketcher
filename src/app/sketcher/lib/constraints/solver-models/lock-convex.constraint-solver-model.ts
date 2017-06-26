import { ConstraintResolver } from './base.constraint-solver-model'

const _pcx = 0;
const _pcy = 1;
const _pax = 2;
const _pay = 3;
const _ptx = 4;
const _pty = 5;
export class LockConvex extends ConstraintResolver {

  constructor(params) {
    super(params);

  }

  public error(): number {
    var cx = this.params[_pcx].get();
    var cy = this.params[_pcy].get();
    var ax = this.params[_pax].get();
    var ay = this.params[_pay].get();
    var tx = this.params[_ptx].get();
    var ty = this.params[_pty].get();

    var crossProductNorm = (cx - ax) * (ty - ay) - (cy - ay) * (tx - ax);

    var violate = crossProductNorm < 0;
    return violate ? crossProductNorm : 0;
  }

  public gradient(out: Array<number>): void {
    var cx = this.params[_pcx].get();
    var cy = this.params[_pcy].get();
    var ax = this.params[_pax].get();
    var ay = this.params[_pay].get();
    var tx = this.params[_ptx].get();
    var ty = this.params[_pty].get();

    out[_pcx] = ty - ay;
    out[_pcy] = ax - tx;
    out[_pax] = cy - ty;
    out[_pay] = tx - cx;
    out[_ptx] = ay - cy;
    out[_pty] = cx - ax;
  }

}
