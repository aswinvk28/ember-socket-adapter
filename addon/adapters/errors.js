import EmberObject from '@ember/object';
import EmberError from '@ember/error';
import { AdapterError } from 'ember-data';
export { InvalidError, TimeoutError, ServerError, AdapterError } from 'ember-data';

export const DisconnectedError = EmberObject.extend(AdapterError, 'Socket disconnected from server');

export const ValidationError = function(errors, message = 'Validation error') {
  this.isValidationError = true;
  EmberError.call(this, message);

  this.errors = errors || [
    {
      title: 'Validation Error',
      detail: message
    }
  ];
};