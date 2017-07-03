import RenderPipeline from './RenderPipeline';

function isEndPoint(o) {
  return o.className === 'M4CAD.TWO.EndPoint'
}

const predicates = [
  { validate: (obj) => !isEndPoint(obj) && obj.marked === null },
  { validate: (obj) => !isEndPoint(obj) && obj.marked !== null },
  { validate: (obj) => isEndPoint(obj) && obj.marked === null },
  { validate: (obj) => isEndPoint(obj) && obj.marked !== null }
];

const pipeline = new RenderPipeline(predicates);

export default pipeline;
