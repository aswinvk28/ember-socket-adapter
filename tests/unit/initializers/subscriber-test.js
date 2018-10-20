import Application from '@ember/application';

import { initialize } from 'dummy/initializers/subscriber';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

module('Unit | Initializer | subscriber', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize
    });

    this.application = this.TestApplication.create({ autoboot: false });

    this.api_spec = {
      defaultNamespace: {
        name: "/request",
        api: ['/$read\/document\/*/', '/$update\/document\/*/']
      },
      additionalNamespace: {
        name: "/remote",
        api: [/$create\/document\/*/, '/$delete\/document\/*//']
      }
    }
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
  });

  // Replace this with your real tests.
  test('the socket connection exists', async function(assert) {
    await this.application.boot();

    let subscriber = this.owner.lookup("controller:subscriber");

    assert.ok(!isEmpty(subscriber.get("defaultSocket").id), "the default socket exists");
    assert.ok(!isEmpty(subscriber.get("additionalSocket").id), "the additional socket exists");
  });

  test('the subscriber has events bound', async function(assert) {
    await this.application.boot();

    let subscriber = this.owner.lookup("controller:subscriber");
    subscriber._bindAllEvents(subscriber.get("defaultSocket"), {
      requestData: null,
      command: "read/document"
    });

    subscriber._bindApiEvents(this.api_spec);
    
    subscriber.get("defaultSocket").emit("read/document", {
      id: 1
    });
  });
});
