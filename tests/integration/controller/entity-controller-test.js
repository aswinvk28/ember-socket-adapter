import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { InvalidError } from 'dummy/adapters/errors';

module('Unit | Controller | entity-controller', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it handles the error', function(assert) {
    let controller = this.owner.lookup('controller:entity-controller');
    var socket = controller.get('subscriber').get('defaultSocket');
    var result = controller.handleError(socket, {
      id: 1
    }, Objecr.create({detail: 'An error occured', title: 'Error'}), InvalidError);
    assert.equal(typeOf(result), 'object', "Error object matches the type");
  });
});
