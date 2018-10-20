import ApplicationInstance from '@ember/application/instance';
import EmberObject from '@ember/object';
import { capitalize, camelize } from '@ember/string';
import config from '../../config/environment';
import { typeOf, isEmpty } from '@ember/utils';

const EntitySubscriber = EmberObject.extend({

  socket: Ember.inject.service('socket-io'),
  defaultSocket: null,
  additionalSocket: null,
  event_emitter: new EventEmitter(),
  parameters: Object.create(),

  /**
   * Removes all event listeners from the EventEmitter
   * @param {EventEmitter} socket
   * @param {String} command
   */
  _removeAllBindings(socket, command) {
    socket.removeAllListeners();
  },

  /**
   * @param {EventEmitter} socket
   * @param {Object} options
   */
  _bindAllEvents(socket, options) {
    if(!options.hasOwnProperty("requestData")) {
      options['requestData'] = null;
    }
    let { command } = options;
    let controller = this.getController(command);
    options['controller'] = controller;
    
    socket.on('error', this.get('socketError').call(this, socket, options));
    
    options['error_class'] = DisconnectedError;
    socket.on('connect_error', this.get('socketError').call(this, socket, options));
    
    options['error_class'] = TimeoutError;
    socket.on('connect_timeout', this.get('socketError').call(this, socket, options));
    
    options['error_class'] = DisconnectedError;
    socket.on('reconnect_error', this.get('socketError').call(this, socket, options));

    options['error_class'] = ServerError;
    socket.on('reconnect_failed', this.get('socketError').call(this, socket, options));
  },

  /**
   * @param {Object} apiSpec
   */
  _bindApiEvents(apiSpec) {
    try {
      var result = this._validateApi(apiSpec);
      if(result) {
        let keys = Object.keys(apiSpec);
        let namespaces = keys.filter(key => (key.toLowerCase().indexOf("namespace") != -1));
        if(namespaces.length > 0) {
          for(var namespace in namespaces) {
            this.set(namespace.toLowerCase().replace("namespace", "") + "Socket", 
            this.get('socket').socketFor(config.socket.host + apiSpec[namespace]["name"]));
            if(namespace.indexOf("default") !== -1) {
              var socket = this.get('defaultSocket');
            } else if(namespace.indexOf("additional") !== -1) {
              var socket = this.get('additionalSocket');
            }
            for(var index in apiSpec[namespace]["api"]) {
              socket.on(apiSpec[namespace]["api"][index], this.get('socketSuccess').call(socket, {
                command: apiSpec[namespace]["api"][index]
              })); 
            }
          }
        }
        ApplicationInstance.register("socket:api", apiSpec);
        ApplicationInstance.inject('adapter', 'socket_api', "socket:api");
      } else {
        throw "The API Specification is invalid, it should contain at least one `namespace` and an associated `api` array";
      }
    } catch(error) {
      throw error;
    }
  },

  /**
   * @param {Object} apiSpec
   * @return {Boolean}
   */
  _validateApi(apiSpec) {
    let keys = Object.keys(apiSpec);
    let namespaces = keys.filter(key => (key.toLowerCase().indexOf("namespace") != -1));
    if(namespaces.length > 0) {
      for(var namespace in namespaces) {
        if(typeOf(apiSpec[namespace]) != 'object') {
          throw "The namespace of the API specification is not an Object";
        }
        if(!apiSpec[namespace].hasOwnProperty("name")) {
          throw "The namespace of the API specification does not have a name property";
        }
        if(!apiSpec[namespace].hasOwnProperty("api")) {
          throw "The namespace of the API specification does not have an api property";
        }
        if(typeOf(apiSpec[namespace]["api"]) != 'Array') {
          throw "The api property is not an Array";
        }
        if(isEmpty(apiSpec[namespace]["api"])) {
          throw "The api property is empty";
        }
      }
      return true;
    } else {
      throw "The API specification does not have any registered namespace(s)"
    }
    return false;
  },

  /**
   * @param {String} key
   */
  clear(key) {
    if(this.get('parameters').hasOwnProperty(key)) {
      delete this.get('parameters')[key];
      return true;
    }
    return false;
  },

  clearAll() {
    this.set('parameters', Object.create());
  },
  
  /**
   * @param {String} eventName
   * @param {Ember.Object.Function} listener
   */
  subscribe(eventName, listener) {
    this.get('event_emitter').on(eventName, listener);
  },

  /**
   * @param {String} eventName
   * @param {Ember.Object.Function} listener
   */
  unsubscribe(eventName, listener) {
    this.get('event_emitter').removeListener(eventName, listener);
  },

  /**
   * @param {String} eventName
   */
  removeAll(eventName) {
    if(eventname == undefined) {
      this.get('event_emitter').removeAllListeners();
    } else {
      this.get('event_emitter').removeAllListeners(eventName);
    }
  },

  /**
   * @param {String} eventName
   */
  trigger(eventName) {
    var args = arguments.slice(1);
    this.get('event_emitter').emit(eventName, args, this);
  },

  /**
   * @param {String} eventName
   * @param {Ember.Object.Function} listener
   */
  subscribeOnce(eventName, listener) {
    this.get('event_emitter').once(eventName, listener);
  },

  /**
   * Error handler for the socket errors
   * @param {EventEmitter} socket
   * @param {Object} options
   */
  socketError(socket, options) {
    let adapter = this;
    let { requestData, errorClass, controller, reject } = options;
    errorClass = errorClass || AdapterError;
    return function(errorObject) {
      let errorResponse;
      try {
        errorResponse = controller.handleError(socket, requestData, errorObject, errorClass);
      } catch(error) {
        return Promise.reject(error);
      }

      if(errorResponse && errorResponse.isAdapterError) {
        return Promise.reject(errorResponse);
      } else {
        run.join(null, reject, errorResponse);
        return errorResponse;
      }
    };
  },

  /**
   * Event handler for the successful socket events
   * @param {EventEmitter} socket
   * @param {Object} options
   */
  socketSuccess(socket, options) {
    let adapter = this;
    let { requestData, controller, resolve, command } = options;
    return function(data) {
      let response;
      try {
        // the success handler connects with a component to respond to success event
        response = controller.handleResponse(socket, command, data);
      } catch(error) {
        return Promise.reject(error);
      }

      if(response && response.isAdapterError) {
        return Promise.reject(response);
      } else {
        run.join(null, resolve, response);
        return response;
      }
    };
  }
});

export function initialize(application) {
  application.register('subscriber:entity', EntitySubscriber);
  application.inject('controller', 'subscriber', 'subscriber:entity');
};

export default { 
  name: 'subscriber',
  initialize: initialize
};
