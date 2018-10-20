import { moduleFor, test } from 'ember-qunit';
import { setupTest } from 'ember-qunit';
import { typeOf } from '@ember/utils';

moduleFor('adapter:socket-adapter', 'Unit | Adapter | socket-adapter', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
});

test('it returns valid data by querying', function(assert) {
  let adapter = this.subject();
  
  let promise = adapter.query(null, "document", {
    id: 1
  });
  promise.then(function(value) {
    assert.ok((typeOf(value) == 'object'), "the value returned is an object");
  }, function(reason) {
    assert.ok((typeOf(reason) == 'function'), "the value obtained is of function type");
  });
});

