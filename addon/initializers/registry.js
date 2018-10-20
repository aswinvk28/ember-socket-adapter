import EmberObject from '@ember/object';
import * as Controller from '../controllers/entity-controller';
import { capitalize, camelize } from '@ember/string';

const EntityRegister = EmberObject.extend({
  
  /**
   * @param {String} command
   */
  _resolveCommand(command) {
    var result = command.split('/');
    return {
      'operation': result[0],
      'type': result[1]
    };
  },

  /**
    * the `type` refers to entity type
    * @param {Element} type
    */
  _buildCommand(operation, type) {
    return operation + "/" + type;
  },

  /**
   * @param {String} command
   */
  getController(command) {
    let {operation, type} = this._resolveCommand(command);
    var controllerName = (type + "Controller").capitalize();
    if(Controller.hasOwnProperty(controllerName)) {
      return Controller[controllerName];
    }
    return Controller.DefaultController;
  },

  fetchApiSpec() {
    return Ember.$.getJSON(config.api.source);
  }
});

export function initialize(application) {
  application.register('registry:entity', EntityRegister);
  application.inject('adapter', 'registry', 'registry:entity');
}

export default { 
  name: 'registry',
  initialize: initialize
};
