import PipelinePredicate from './PipelinePredicate'

export default class RenderPipeline {

  private predicateList: Array<PipelinePredicate>;

  get predicates(): Array<PipelinePredicate> {
    return this.predicateList;
  }
  constructor(predicates: Array<PipelinePredicate> = new Array<PipelinePredicate>()) {
    this.predicateList = predicates;
    if (predicates.length < 1) {
      this.predicateList.push({
        validate: (obj) => true
      });
    }
  }
}
