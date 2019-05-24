import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';
import { isExpanded } from '../../../util/DiUtil.js';

export default function SubProcessStartEventBehavior(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  eventBus.on('create.start', function(event) {
    var context = event.context,
        shape = context.shape;

    if (
      !is(shape, 'bpmn:SubProcess')
    ) {
      return;
    }

    shape.isBlank = shape.children.length ? false : true;
  });

  this.postExecuted('shape.create', function(event) {
    var shape = event.context.shape,
        isBlank = shape.isBlank,
        position;

    if (
      !is(shape, 'bpmn:SubProcess') ||
      !isExpanded(shape) ||
      !isBlank
    ) {
      return;
    }

    position = calculatePositionRelativeToShape(shape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, shape);
  });

  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape,
        position;

    if (
      !is(newShape, 'bpmn:SubProcess') ||
      !is(oldShape, 'bpmn:Task') ||
      !isExpanded(newShape)
    ) {
      return;
    }

    position = calculatePositionRelativeToShape(newShape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, newShape);
  });
}

SubProcessStartEventBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(SubProcessStartEventBehavior, CommandInterceptor);

// helpers //////////

function calculatePositionRelativeToShape(shape) {
  return {
    x: shape.x + shape.width / 6,
    y: shape.y + shape.height / 2
  };
}
