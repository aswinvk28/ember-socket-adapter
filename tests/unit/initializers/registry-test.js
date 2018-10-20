import Application from '@ember/application';

import { initialize } from 'dummy/initializers/registry';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';

module('Unit | Initializer | registry', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize
    });

    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
  });

  // Replace this with your real tests.
  test('it contains getController method and returns a valid controller', async function(assert) {
    await this.application.boot();

    assert.ok(this.owner.lookup('initializer:registry').hasOwnProperty('getController'), "Registry contains `getController` method");

    assert.equal(typeOf(this.owner.lookup('initializer:registry').getController()), "function", "method `getController` of registry is a function");
  });

  test('it resolves and builds command', async function(assert) {
    await this.application.boot();

    assert.equal(this.owner.lookup('initializer:registry')._buildCommand('read', 'document'), "read/document", "the command builder works");

    assert.equal(this.owner.lookup('initializer:registry')._resolveCommand("update/document"), {
      operation: 'write',
      type: 'document'
    }, "the resolve command works");
  });

  test('it returns a non-default controller', async function(assert) {
    await this.application.boot();

    assert.equal(typeOf(this.owner.lookup('initializer:registry').getController("create/document")), "function", "method `getController` of registry is a function");
  });
});
