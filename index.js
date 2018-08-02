/*
 *
 * The document of validator.js is in README.md
 *
 */

import { isURL, isPhone, isEmail, isUUID } from './tools';
import _ from 'lodash';

// TODO: default message can be replaced by other language(i18n) in the future
const defaultMessage = {
  required: 'This field is required.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  equalTo: 'Please enter the same value again.',
  minLength: 'Please enter at least {0} characters.',
  maxLength: 'Please enter no more than {0} characters.',
  rangeLength: 'Please enter a value between {0} and {1} characters long.',
  min: 'Please enter a value greater than or equal to {0}.',
  max: 'Please enter a value less than or equal to {0}.',
  range: 'Please enter a value between {0} and {1}.',
  integer: 'Please enter a integer.',
  phone: 'Please enter phone number',
  or: "You didn't match any format",
  uuid: 'Please enter a valid UUID',
  pattern: 'Please enter a valid data',
  minDate: 'Date is invalid',
  maxDate: 'Date is invalid',

  // remote: 'Please fix this field.',
  // date: 'Please enter a valid date.',
  // dateISO: 'Please enter a valid date (ISO).',
  // number: 'Please enter a valid number.',
  // digits: 'Please enter only digits.',
  // step: $.validator.format('Please enter a multiple of {0}.'),
};

export default function validator(parent, config) {
  this.config = config;
  this.rules = this.config.rules;
  this.messages = this.config.messages;
  this.errors = {};
  this.active = {};
  Object.keys(this.rules).forEach(ruleKey => {
    this.active[ruleKey] = false;
  });

  const recordError = (field, rule) => {
    this.errors[field] = rule;
  };

  // use setState to update errorText
  const setErrorMessage = (field, ruleKey) => {
    const errorMessage = getErrorMessage(field, ruleKey);
    setNestedValueByString(this.rules[field].errorState, errorMessage);
  };

  // if the oringal message is "Please enter a value between {0} and {1} characters long."
  // use formatByParameter() to replace {0} and {1} with ruleValue,
  // {0} is replace with ruleValue[0]
  const formatByParameter = (message, ruleValue) => {
    if (Array.isArray(ruleValue)) {
      let msg = message;
      ruleValue.forEach((eachRuleValue, index) => {
        const pattern = `{[${index}]}`;
        const regex = new RegExp(pattern, 'g');
        msg = msg.replace(regex, eachRuleValue);
      });
      return msg;
    }
    return message.replace(/{[0]}/g, ruleValue);
  };

  // select proper error message from error message list.
  const getErrorMessage = (field, ruleKey) => {
    const ruleValue = this.rules[field][ruleKey];
    if (this.messages && this.messages[field] && this.messages[field][ruleKey]) {
      return formatByParameter(this.messages[field][ruleKey], ruleValue); // use custom error message
    }
    if (defaultMessage[ruleKey]) {
      return formatByParameter(defaultMessage[ruleKey], ruleValue); // use general error message
    }
    return 'Invalid input'; // use default error message
  };

  const validateByRule = (rule, fieldValue) => {
    const ruleKey = Object.keys(rule)[0];
    const ruleValue = rule[ruleKey];
    // validCount is used to case "or"
    let validCount = 0;

    switch (ruleKey) {
      case 'required':
        if ((fieldValue === '' || fieldValue === null) && ruleValue === true) {
          return false;
        }
        break;

      case 'integer':
        if (!Number.isInteger(Number(fieldValue))) {
          return false;
        }
        break;

      case 'equalTo':
        if (fieldValue !== parent.state[ruleValue]) {
          return false;
        }
        break;

      case 'url':
        if (!isURL(fieldValue) && ruleValue === true) {
          return false;
        }
        break;

      case 'email':
        if (!isEmail(fieldValue) && ruleValue === true) {
          return false;
        }
        break;

      case 'phone':
        if (!isPhone(fieldValue) && ruleValue === true) {
          return false;
        }
        break;

      case 'uuid':
        if (!isUUID(fieldValue) && ruleValue === true) {
          return false;
        }
        break;

      case 'pattern':
        return ruleValue && ruleValue.test(fieldValue);

      case 'min':
        if (fieldValue < ruleValue) {
          return false;
        }
        break;

      case 'max':
        if (fieldValue > ruleValue) {
          return false;
        }
        break;

      case 'range':
        if (fieldValue < ruleValue[0] || fieldValue > ruleValue[1]) {
          return false;
        }
        break;

      case 'minLength':
        if (fieldValue.length < ruleValue) {
          return false;
        }
        break;

      case 'maxLength':
        if (fieldValue.length > ruleValue) {
          return false;
        }
        break;

      case 'rangeLength':
        if (fieldValue.length < ruleValue[0] || fieldValue.length > ruleValue[1]) {
          return false;
        }
        break;

      case 'minDate':
        if (_.isString(ruleValue)) {
          if (fieldValue < parent.state[ruleValue]) {
            return false;
          }
        } else if (fieldValue < ruleValue) {
          return false;
        }
        break;

      case 'maxDate':
        if (_.isString(ruleValue)) {
          if (fieldValue > parent.state[ruleValue]) {
            return false;
          }
        } else if (fieldValue > ruleValue) {
          return false;
        }
        break;

      case 'or':
        Object.keys(ruleValue).forEach(nestedRuleKey => {
          const valid = validateByRule({ [nestedRuleKey]: ruleValue[nestedRuleKey] }, fieldValue);
          if (valid) validCount += 1;
        });
        if (validCount === 0) return false;
        break;

      default:
        // undefined validation rule
        return false;
    }
    return true;
  };

  /*
   * example of getNestedValueByString() and setNestedValueByString():
   *
   * parent.state = {
   *   taiwan:{
   *     taipei: 'sunny'
   *   }
   * };
   *
   * setNestedValueByString('taiwan.taipei', 'rainy');
   * getNestedValueByString('taiwan.taipei'); // The value is 'rainy'
   */

  const getNestedValueByString = path => {
    const state = parent.state;
    // _.get(object, path, [defaultValue])
    return _.get(state, path);
  };

  const setNestedValueByString = (path, value) => {
    const state = parent.state;
    _.set(state, path, value);
    parent.setState(state);
  };

  const validateField = field => {
    const fieldValue = getNestedValueByString(field);

    // when this field is not "required" and input is empty
    // pass the validation, we don't have to validate this field with other rules
    const isOptionalField = this.rules[field].required === undefined || this.rules[field].required === false;
    const isFieldInputEmpty = !validateByRule({ required: true }, fieldValue);
    if (isOptionalField && isFieldInputEmpty) {
      return;
    }

    // validate this field only when parameter value of depend is true
    if (parent.state[this.rules[field].depend] === false) {
      return;
    }

    Object.keys(this.rules[field]).forEach(ruleKey => {
      // errorState is used to update errorText in textField, so we don't have to validate "errorState".
      // depend is used on special case, not a regular rule, so we don't have to validate "depend".
      if (ruleKey === 'errorState' || ruleKey === 'depend') return;
      // if the field already have one error, then skip validating other rules.
      if (this.errors[field]) return;

      const ruleValue = this.rules[field][ruleKey];

      if (!validateByRule({ [ruleKey]: ruleValue }, fieldValue)) {
        recordError(field, ruleKey);
        setErrorMessage(field, ruleKey);
      }
    });
  };

  function deleteUnwantedKey(ruleObject) {
    const rules = ruleObject;
    Object.keys(rules).forEach(field => {
      if (typeof rules[field] === 'object') {
        // handle nesdted variable
        deleteUnwantedKey(rules[field]);
      } else if (rules[field] === 'delete') {
        delete rules[field];
      }
    });
  }

  // use setConfig() to change rules or messages after Validator() was already delcared.
  this.setConfig = newConfig => {
    this.config = _.merge(this.config, newConfig);
    deleteUnwantedKey(this.config);
    this.rules = this.config.rules;
    this.messages = this.config.messages;
  };

  const validateFields = fields => {
    this.errors = {};
    fields.forEach(field => {
      // clear error message at first
      setNestedValueByString(this.rules[field.toString()].errorState, '');
      validateField(field);
    });
    // return errors, let index.js can use errors to judge submit form or not
    return Object.keys(this.errors).length === 0 ? null : this.errors;
  };

  const activateFields = fields => {
    fields.forEach(field => {
      this.active[field] = true;
    });
  };

  this.validateWhenActive = (...fieldArray) => {
    const allFields = Object.keys(this.rules);
    const fields = fieldArray.length === 0 ? allFields : fieldArray;

    const activeFields = fields.filter(field => this.active[field] === true);
    if (activeFields.length > 0) {
      return validateFields(activeFields);
    }
    return null;
  };

  this.activateValidator = (...fieldArray) => {
    const allFields = Object.keys(this.rules);
    const fields = fieldArray.length === 0 ? allFields : fieldArray;

    const toActiveFields = fields.filter(field => parent.state[field] !== '' && this.active[field] === false);
    if (toActiveFields.length > 0) {
      activateFields(toActiveFields);
      return validateFields(toActiveFields);
    }
    return null;
  };

  this.validate = (...fieldArray) => {
    const allFields = Object.keys(this.rules);
    const fields = fieldArray.length === 0 ? allFields : fieldArray;

    activateFields(fields);
    return validateFields(fields);
  };
}
